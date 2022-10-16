//import { readFile } from "fs/promises";
import Sequelize from "sequelize";
import "../env.js";
import File from "./file.js";
import History from "./history.js";
import List from "./list.js";
import Status from "./status.js";
import Heart_Status from "./heart_status.js";
import Metric_Status from "./metric_status.js";
import configJson from "../config/elasticConfig.js";
import { logger } from "../config/winston.js";
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
//const configJson = JSON.parse(await readFile(new URL("../config/config.json", import.meta.url)));
const config = configJson[env];

logger.info("this is the environment: ", env);

const db = {};

const sequelize = new Sequelize(
  config.dbConfig.database,
  config.dbConfigusername,
  config.dbConfigpassword,
  config.dbConfig
);

db.sequelize = sequelize;

db.History = History;
db.File = File;
db.List = List;
db.Status = Status;
db.Heart_Status = Heart_Status;
db.Metric_Status = Metric_Status;

History.init(sequelize);
File.init(sequelize);
List.init(sequelize);
Status.init(sequelize);
Heart_Status.init(sequelize);
Metric_Status.init(sequelize);

//1:n 관계
// db 외래키 설정
//db.History.hasMany(db.List, {foreignKey: "history_id"});
db.File.hasMany(db.History, {
  foreignKey: "history_id",
  sourceKey: "history_id",
});
db.Metric_Status.hasMany(db.Status, {
  foreignKey: "service_id",
});
db.Heart_Status.hasMany(db.Status, {
  foreignKey: "service_id",
  sourceKey: "service_id",
});

//1:1 관계
db.History.belongsTo(db.File, { foreignKey: "id", targetKey: "history_id" });
//db.File.belongsTo(db.History, {foreignKey: "history_id", sourceKey: "history_id"})

//db.Status.belongsTo(db.Heart_Status, { foreignKey: "id", targetKey: "id" });

export default db;
