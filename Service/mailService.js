import request from "request";
import { logger } from "../config/winston.js";

const mailOptions = (serverName, serverIP, shutDownTime) => {
  const options = {
    uri: "http://10.32.18.52:8083/service/customCall/serverStatusAlert",
    method: "POST",
    form: {
      sendUserEmail: "wnstjq7894@ncc.re.kr,blueman911@ncc.re.kr,thchoi@ncc.re.kr,kimdy@ncc.re.kr",
      dataMap: `{'serverName': '${serverName}', 'serverIP': '${serverIP}', 'dateTime': '${shutDownTime}'}`,
    },
  };

  request.post(options, function (err, response, body) {
    logger.info(`GET / ${body}`);
    if (err) {
      logger.error(`ERROR MESSAGE / ${err}`);
    }
  });
};

const serviceMailOptions = (serverName, serverIP, serviceName, shutDownTime) => {
  const options = {
    uri: "http://10.32.18.52:8083/service/customCall/ServiceStatusAlert",
    method: "POST",
    form: {
      sendUserEmail: "wnstjq7894@ncc.re.kr,blueman911@ncc.re.kr,thchoi@ncc.re.kr,kimdy@ncc.re.kr",
      dataMap: `{'serverName': '${serverName}', 'serverIP': '${serverIP}','serviceName': '${serviceName}',  'dateTime': '${shutDownTime}'}`,
    },
  };

  request.post(options, function (err, response, body) {
    logger.info(`GET / ${body}`);
    if (err) {
      logger.error(`ERROR MESSAGE / ${err}`);
    }
  });
};

const serviceOperateMailOptions = (serverName, serverIP, serviceName, shutDownTime) => {
  const options = {
    uri: "http://10.32.18.52:8083/service/customCall/ServiceOperateStatusAlert",
    method: "POST",
    form: {
      sendUserEmail: "wnstjq7894@ncc.re.kr,blueman911@ncc.re.kr,thchoi@ncc.re.kr,kimdy@ncc.re.kr",
      dataMap: `{'serverName': '${serverName}', 'serverIP': '${serverIP}','serviceName': '${serviceName}', 'dateTime': '${shutDownTime}'}`,
    },
  };

  request.post(options, function (err, response, body) {
    logger.info(`GET / ${body}`);
    if (err) {
      logger.error(`ERROR MESSAGE / ${err}`);
    }
  });
};

export { mailOptions, serviceMailOptions, serviceOperateMailOptions };
