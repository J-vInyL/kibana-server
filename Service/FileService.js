import File from "../models/file.js";
import moment from "moment-timezone";
import fs from "fs";
import "../env.js";
import { logger } from "../config/winston.js";

moment.tz.setDefault("Asia/Seoul");

const fileSave = (req, history_pk, t, callback) => {
  let server_settings = [];
  req.body.server_settings.forEach(function (item, index) {
    server_settings.push(item.label);
  });
  const insertData = {
    index: server_settings.toString(),
    query: req.body.history_query,
    command: req.body.history_command,
  };

  const input =
    insertData.query +
    "\n" +
    "alert:" +
    "\n" +
    '- "command"' +
    "\n" +
    insertData.command +
    "\nindex: " +
    insertData.index;
  const examData = fs.readFileSync(
    "/opt/kibana_server/yaml_files/yamlExamples/yamlExample.conf",
    "utf8"
  );

  //������ ���� ������ ���ٸ�
  if (!fs.existsSync(req.user_id)) {
    // ���� ����
    fs.mkdirSync(`/opt/kibana_server/yaml_files/${req.body.user_id}`, {
      recursive: true,
    });
    //���� ���� ����
    fs.appendFileSync(
      `${process.env.YAML_PATH}/${req.body.user_id}/${history_pk}_${req.body.user_id}.yaml`,
      `${examData}`,
      "utf8"
    );
    //���� ����
    fs.appendFileSync(
      `${process.env.YAML_PATH}/${req.body.user_id}/${history_pk}_${req.body.user_id}.yaml`,
      `${input}`,
      "utf8"
    );
    logger.info("===CREATE FILE===");
  } else {
    fs.appendFileSync(
      `${process.env.YAML_PATH}/${req.body.user_id}/${history_pk}_${req.body.user_id}.yaml`,
      `${examData}`,
      "utf8"
    );
    fs.appendFileSync(
      `${process.env.YAML_PATH}/${req.body.user_id}/${history_pk}_${req.body.user_id}.yaml`,
      `${input}`,
      "utf8"
    );
  }
  return callback(req, history_pk, t);
  //return true
};

//yaml ����
const createSettingYAML = (req, history_pk, verifyCheck, t, callback) => {
  try {
    File.create(
      {
        file_name: `${history_pk}_${req.body.user_id}`,
        file_path: `${process.env.YAML_PATH}/${req.body.user_id}/`,
        history_id: history_pk,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { transaction: t }
    ).then((data) => {
      return callback(req, history_pk, verifyCheck);
    });
  } catch (err) {
    logger.error("ERROR MESSAGE / ", err);
    return false;
  }
};

//yaml ������Ʈ
const updateSettingYAML = (req, history_pk, verifyCheck, t, callback) => {
  try {
    File.update(
      {
        file_name: `${history_pk}_${req.body.user_id}`,
        file_path: `${process.env.YAML_PATH}/${req.body.user_id}`,
        history_id: history_pk,
      },
      { transaction: t }
    ).then((data) => {
      return callback(req, history_pk, verifyCheck);
    });
  } catch (err) {
    logger.error("ERROR MESSAGE / ", err);
    return false;
  }
};

export { createSettingYAML, fileSave, updateSettingYAML };
