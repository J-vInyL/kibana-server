import { spawn, spawnSync } from "child_process";
import fs from "fs";
import model from "../models/index.js";
import File from "../models/file.js";
import History from "../models/history.js";
import moment from "moment-timezone";
import "../env.js";
import { logger } from "../config/winston.js";

moment.tz.setDefault("Asia/Seoul");

const verifyService = (req, history_pk, t, callback) => {
  //const process = spawn('bash');
  //const command = spawn('find', ['-type', 'd']);
  //const  command = spawn('curl', ['http://10.32.37.79:3307']);

  const command = spawnSync(
    "elastalert-test-rule",
    [
      "--config",
      "/opt/elastalert2/examples/config.yaml",
      `${process.env.YAML_VERIFYPATH}/${req.body.user_id}/${history_pk}_${req.body.user_id}.yaml`,
    ],
    { encoding: "utf-8" }
  );

  logger.info("GET /", command.stdout);
  logger.info("GET /", command.stderr);

  let search = "Traceback";
  let verifyCheck = command.stderr.includes(search);
  if (verifyCheck === true) {
    logger.error("ERROR MESSAGE /", command.error);
    fs.unlinkSync(`${process.env.YAML_PATH}/${req.body.user_id}/${history_pk}_${req.body.user_id}.yaml`);
  }

  return callback(req, history_pk, verifyCheck, t);
};

const executeService = async (req, res) => {
  const t = await model.sequelize.transaction();

  try {
    let history_Info = await History.findAll({
      attributes: ["id", "user_id"],
      where: { history_name: req.query.id },
      raw: true,
    });

    const command = spawn("python3.7", [
      "-m",
      "elastalert.elastalert",
      "--verbose",
      "--config",
      "/opt/elastalert2/examples/config.yaml",
      "--rule",
      `/opt/kibana_server/yaml_files/elastic/${history_Info[0].id}_${history_Info[0].user_id}.yaml`,
    ]);
    logger.info("===START SERVICE===");

    await File.update(
      {
        pid: command.pid,
      },
      {
        where: {
          history_id: history_Info[0].id,
        },
      },
      { transaction: t }
    );
    await t.commit();

    command.stdout.on("data", (data) => {
      logger.info(`GET / ${data}`);
    });

    command.stderr.on("data", (data) => {
      logger.info(`GET / ${data}`);
    });

    command.on("close", (code) => {
      logger.info(`FINISH / ${code}`);
    });
    return res.json({ success: true });
  } catch (err) {
    or("ERROR MESSAGE /", err);
    await t.rollback();
    return res.json({ success: false, err });
  }
};

const exitService = async (req, res) => {
  const t = await model.sequelize.transaction();

  try {
    let history_Info = await History.findAll({
      attributes: ["user_id"],

      include: [
        {
          model: File,
          attributes: ["history_id", "pid", "file_name"],
        },
      ],
      where: { history_name: req.query.id },
      raw: true,
    });

    //const  command = spawnSync('kill', ['-9', `${history_Info[0]['File.pid']}`], {encoding : 'utf-8'});
    const command = spawn("kill", ["-9", `${history_Info[0]["File.pid"]}`]);
    logger.info("===EXIT SERVICE===");

    command.stdout.on("data", (data) => {
      logger.info(`GET / ${data}`);
    });

    command.stderr.on("data", (data) => {
      logger.error(`ERROR MESSAGE / ${data}`);
    });

    command.on("close", (code) => {
      logger.info(`FINISH / ${code}`);
    });

    await File.update(
      {
        pid: null,
      },
      {
        where: {
          file_name: history_Info[0]["File.file_name"],
        },
      },
      { transaction: t }
    );
    await t.commit();

    return res.json({ success: true });
  } catch (err) {
    logger.error("ERROR MESSAGE", err);
    await t.rollback();
    return res.json({ success: false, err });
  }
};

export { verifyService, executeService, exitService };
