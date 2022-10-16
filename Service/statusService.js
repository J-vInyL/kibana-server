import Status from "../models/status.js";
import moment from "moment-timezone";

//IP 가져오기(배열 형태 정렬)
const getIP = async (host_name) => {
  const ip = await Status.findAll({
    attributes: ["host_ip"],
    where: { host_name: host_name },
    raw: true,
  }).then((data) => data.map((result) => result.host_ip));

  return ip[0];
};

//ID 값 가져오기(배열 형태 정렬)
const getID = async (host_name) => {
  const id = await Status.findAll({
    attributes: ["id"],
    where: { host_name: host_name },
    raw: true,
  }).then((data) => data.map((result) => result.id));
  return id[0];
};

//메일 확인용 카운트 확인
const getCount = async (host_name) => {
  const count = await Status.findAll({
    attributes: ["post_count"],
    where: { host_name: host_name },
    raw: true,
  }).then((data) => data.map((result) => result.post_count));

  return count[0];
};

//서버 이름 가져오기(배열 형태 정렬)
const getStatusName = async () => {
  const statusName = await Status.findAll({
    attributes: ["host_name"],
    raw: true,
  }).then((data) => data.map((result) => result.host_name));

  return statusName;
};

//서버 상태 확인
const verifyStatus = async (host_name) => {
  const verify = await Status.findAll({
    attributes: ["server_status"],
    where: { host_name: host_name },
    raw: true,
  }).then((data) => data.map((result) => result.server_status));

  return verify[0];
};

const createUpsert = async (host_name, host_ip, server_status, post_count) => {
  await Status.upsert(
    {
      host_name: host_name,
      host_ip: host_ip,
      desc: "TEST",
      server_status: server_status,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      post_count: post_count,
    },
    { returning: true }
  );
};

const statusUpdate = async (host_name, host_ip, server_status, post_count) => {
  await Status.update(
    {
      host_name: host_name,
      host_ip: host_ip,
      server_status: server_status,
      //createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      post_count: post_count,
    },
    { where: { host_name: host_name } },
    { returning: true }
  );
};

export { getIP, getID, getCount, getStatusName, verifyStatus, statusUpdate, createUpsert };
