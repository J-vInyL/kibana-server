import Metric from "../models/metric_status.js";
import moment from "moment-timezone";

//metric 초기 insert
const metricCreateUpsert = async (service_id, service_status, metric_post_count) => {
  await Metric.upsert(
    {
      service_id: service_id,
      service_desc: "TEST",
      service_status: service_status,
      metric_post_count: metric_post_count,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { returning: true }
  );
};

//metric 상태 변경
const metricStatusUpdate = async (service_id, service_status, metric_post_count) => {
  await Metric.update(
    {
      service_id: service_id,
      service_status: service_status,
      metric_post_count: metric_post_count,
      //createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { where: { service_id: service_id } },
    { returning: true }
  );
};

//메일 확인용 카운트 확인
const getMetricCount = async (service_id) => {
  const count = await Metric.findAll({
    attributes: ["metric_post_count"],
    where: { service_id: service_id },
    raw: true,
  }).then((data) => data.map((result) => result.metric_post_count));
  return count[0];
};

export { metricCreateUpsert, metricStatusUpdate, getMetricCount };
