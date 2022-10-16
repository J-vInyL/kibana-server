import Heart from "../models/heart_status.js";
import Status from "../models/status.js";
import moment from "moment-timezone";
import db from "../models/index.js";

//heart 초기 insert
const heartCreateUpsert = async (service_id, service_port, service_status, heart_post_count) => {
  await Heart.upsert(
    {
      service_id: service_id,
      service_port: service_port,
      service_desc: "TEST",
      service_status: service_status,
      heart_post_count: heart_post_count,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { returning: true }
  );
};

//heart 꺼짐 상태 변경
const heartStatusUpdate = async (service_id, service_port, service_status, heart_post_count) => {
  await Heart.update(
    {
      service_id: service_id,
      service_port: service_port,
      service_status: service_status,
      heart_post_count: heart_post_count,
      //createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { where: { service_id: service_id, service_port: service_port } },
    { returning: true }
  );
};

//heart 켜짐(유지) 상태 변경
const heartUpStatusUpdate = async (service_id, service_status, heart_post_count) => {
  await Heart.update(
    {
      service_id: service_id,
      service_status: service_status,
      heart_post_count: heart_post_count,
      //createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { where: { service_id: service_id } },
    { returning: true }
  );
};

//heart 상태 변경
const heartStatusInit = async (service_id, service_port) => {
  await Heart.update(
    {
      heart_post_count: 0,
      //createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { where: { service_id: service_id, service_port: service_port } },
    { returning: true }
  );
};

//상태 가져오기
const getServiceStatus = async (host_name, service_port) => {
  let query = `SELECT service_status FROM heart_statuses a JOIN statuses b ON a.service_id = b.id WHERE b.host_name = :host_name AND a.service_port = :service_port`;

  const status = await db.sequelize
    .query(query, {
      replacements: { host_name: host_name, service_port: service_port },
      type: db.sequelize.QueryTypes.SELECT,
    })
    .then((data) => data.map((result) => result.service_status));
  return status[0];
};

//heart 포트와 상태 가져오기
const getStatusPort = async (host_name) => {
  let query = `SELECT service_port, service_status FROM heart_statuses a INNER JOIN statuses b ON a.service_id = b.id WHERE b.host_name = :host_name`;

  const port = await db.sequelize.query(query, {
    replacements: { host_name: host_name },
    type: db.sequelize.QueryTypes.SELECT,
  });
  return port;
};

//해당 서비스 찾기
const getHeartFind = async (host_name, service_port) => {
  let query = `SELECT service_desc FROM heart_statuses a JOIN statuses b ON a.service_id = b.id WHERE b.host_name = :host_name AND a.service_port = :service_port`;

  const data = await db.sequelize
    .query(query, {
      replacements: { host_name: host_name, service_port: service_port },
      type: db.sequelize.QueryTypes.SELECT,
    })
    .then((data) => data.map((result) => result.service_desc));
  return data;
};

//heart 카운트 확인
const getHeartCountTest = async (host_name, service_port) => {
  try {
    let query = `SELECT heart_post_count FROM heart_statuses a INNER JOIN statuses b ON a.service_id = b.id WHERE b.host_name = :host_name AND a.service_port = :service_port`;

    const data = await db.sequelize.query(query, {
      replacements: { host_name: host_name, service_port: service_port },
      type: db.sequelize.QueryTypes.SELECT,
    });
    return data[0]["heart_post_count"];
  } catch (err) {
    console.log("ERROR", err);
  }
};

//(예전버전) heart 카운트 확인
const getHeartCount = async (service_id, service_port) => {
  const count = await Heart.findAll({
    attributes: ["heart_post_count"],
    where: { service_id: service_id, service_port: service_port },
    raw: true,
  });
  //.then((data) => data.map((result) => result.heart_post_count));
  return count[0].heart_post_count;
};

export {
  heartCreateUpsert,
  getServiceStatus,
  heartStatusUpdate,
  getHeartFind,
  getHeartCount,
  getStatusPort,
  getHeartCountTest,
  heartStatusInit,
  heartUpStatusUpdate,
};
