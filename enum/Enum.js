const StatusEnum = Object.freeze({
  STATUS_UP: 1,
  STATUS_DOWN: 0,
  AGENT_INIT: -1,
  MAIL_INIT: 0,
  SERVER_STATUS: 1,
  METRIC_NAME: "metricbeat",
  HEART_NAME: "heartbeat",
  COUNT: 3,
});

export default StatusEnum;
