import async from "async";
import { logger } from "../config/winston.js";
import History from "../models/history.js";
import {
  createSettingYAML,
  updateSettingYAML,
  fileSave,
} from "./FileService.js";
import { verifyService } from "./cmdService.js";
import moment from "moment-timezone";
import model from "../models/index.js";

moment.tz.setDefault("Asia/Seoul");

const historySave = (req, t, callback) => {
  let server_settings = [];
  try {
    req.body.server_settings.forEach(function (item, index) {
      server_settings.push(item.label);
    });

    History.create(
      {
        history_name: req.body.history_name,
        server_settings: server_settings.toString(),
        history_query: req.body.history_query,
        history_command: req.body.history_command,
        user_id: req.body.user_id,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { transaction: t }
    ).then((data) => {
      callback(null, req, data.dataValues.id, t);
    });
  } catch (err) {
    logger.error("ERROR MESSAGE / ", err);
  }
};

const historyUpdate = async (req, t, callback) => {
  try {
    History.update(
      {
        history_name: req.body.history_name,
        server_settings: req.body.server_settings,
        history_query: req.body.history_query,
        history_command: req.body.history_command,
        user_id: req.body.user_id,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { where: { history_name: req.body.history_name } },
      { transaction: t }.then((data) => {
        callback(null, req, data.dataValues.id, t);
      })
    );
  } catch (err) {
    logger.error("ERROR MESSAGE / ", err);
  }
};

const createFile = (req, history_pk, t, callback) => {
  fileSave(req, history_pk, t, function (req, history_pk, t) {
    callback(null, req, history_pk, t);
  });
};

const verfiyFile = (req, history_pk, t, callback) => {
  verifyService(req, history_pk, t, function (req, history_pk, verifyCheck, t) {
    callback(null, req, history_pk, verifyCheck, t);
  });
};

const createYaml = (req, history_pk, verifyCheck, t, callback) => {
  createSettingYAML(
    req,
    history_pk,
    verifyCheck,
    t,
    function (req, history_pk, verifyCheck) {
      callback(null, verifyCheck);
    }
  );
};

const updateYaml = (req, history_pk, verifyCheck, t, callback) => {
  updateSettingYAML(
    req,
    history_pk,
    verifyCheck,
    t,
    function (req, history_pk, verifyCheck) {
      callback(null, verifyCheck);
    }
  );
};

const createAction = async (req, res) => {
  const t = await model.sequelize.transaction();
  async.waterfall(
    [async.apply(historySave, req, t), createFile, verfiyFile, createYaml],
    async (err, result) => {
      if (err) {
        logger.error("ERROR MESSAGE / ", err);
        await t.rollback();
        return res.json({ success: false });
      } else {
        if (result === true) {
          await t.rollback();
          return res.json({ success: false });
        }
        logger.info("GET /", result);
        await t.commit();
        return res.json({ success: true });
      }
    }
  );
};

const updateAction = async (req, res) => {
  const t = await model.sequelize.transaction();
  async.waterfall(
    [async.apply(historyUpdate, req, t), createFile, verfiyFile, updateYaml],
    async (err, result) => {
      if (err) {
        logger.error("ERROR MESSAGE /", err);
        await t.rollback();
        return res.json({ success: false });
      } else {
        if (result === true) {
          await t.rollback();
          return res.json({ success: false });
        }
        logger.info("GET /", result);
        await t.commit();
        return res.json({ success: true });
      }
    }
  );
};

const getSetting = async (req, res) => {
  try {
    const getSettings = await History.findAll({
      attributes: [
        "id",
        "history_name",
        "server_settings",
        "history_query",
        "history_command",
      ],
      raw: true,
    });
    return res.status(200).json({ success: true, getSettings });
  } catch (err) {
    return res.status(400).json({ success: false, err });
  }
};

const historyDelete = async (req, res) => {
  try {
    fileSave;
    let historyName = req.body.history_name;

    await History.destroy({ where: { history_name: historyName } }).then(
      (data) => {
        if (!data) {
          return res.json({ success: false });
        } else {
          //fs.unlink(`/opt/kibana_server/yaml_files/${req.body.user_id}`)
          return res.status(200).json({ success: true });
        }
      }
    );
  } catch (err) {
    return res.status(400).json({ success: false, err });
  }
};

export { getSetting, historyDelete, historyUpdate, createAction, updateAction };
