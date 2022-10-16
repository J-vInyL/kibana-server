import { Client } from "@elastic/elasticsearch";
import moment from "moment-timezone";
import { logger } from "../config/winston.js";
import "../env.js";
import configJson from "../config/elasticConfig.js";
import { metricSearchQuery, heartSearchQuery, heartHostNameQuery } from "./util/elasticQuery.js";
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const config = configJson[env];

moment.tz.setDefault("Asia/Seoul");

//서버 상태 체크 쿼리 조건

//elasticsearch 호출
const clientElastic = new Client({
  node: config["elasticConfig"]["node"],
  auth: {
    username: config["elasticConfig"]["username"],
    password: config["elasticConfig"]["password"],
  },
});

const getMetricSearch = async (client) => {
  //elasticsearch 검색 및 쿼리
  const data = await client.search(metricSearchQuery());

  return data.aggregations.getHostName.buckets;
};

const getHeartSearch = async (client) => {
  //elasticsearch 검색 및 쿼리
  const data = await client.search(heartSearchQuery());
  return data.aggregations.getStatus.buckets;
};

const getHeartHostName = async (client) => {
  const data = await client.search(heartHostNameQuery());

  return data.aggregations.getHostName.buckets;
};

const getShutDownTime = async (client, serverName) => {
  const data = await client.search({
    body: {
      query: {
        term: {
          "observer.hostname": serverName,
        },
      },

      aggs: {
        getTime: {
          max: {
            field: "@timestamp",
          },
        },
      },
    },
  });
  return data.aggregations.getTime.value_as_string;
};

//elasticsearch index 가져오기 로직
function getIndex(client, callback) {
  client.cat.indices({ format: "json" }).then(function (data) {
    callback(data);
  });
}

//elasticsearch index 삭제 로직
function deleteIndex(client, index) {
  client.indices
    .delete({
      index: index,
    })
    .then(
      function (resp) {
        logger.info(`GET / ${resp}`);
      },
      function (err) {
        logger.error(`ERROR MESSAGE / ${err}`);
      }
    );
}

export { clientElastic, getIndex, deleteIndex, getMetricSearch, getHeartSearch, getShutDownTime, getHeartHostName };
