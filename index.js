import express from "express";
import "./env.js";
import models from "./models/index.js";
import { logger } from "./config/winston.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import urlencoded from "body-parser";
import history from "./routes/History.js";
import file from "./routes/File.js";
import cmd from "./routes/Cmd.js";
import { runSchedule, statusSchedule } from "./Service/ruleService.js";
import configJson from "./config/elasticConfig.js";

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const config = configJson[env];

//스케줄링 실행
runSchedule(config);
statusSchedule();
//스케줄링 로직 종료

//서버 포트 설정
const PORT = process.env.PORT;
const app = express();

//db 세팅
models.sequelize
  .sync({ force: false })
  .then(() => {
    logger.info("DB connected");
  })
  .catch((err) => {
    logger.error("DB connected fail", err);
  });
//라우팅 설정
//app.use(urlencoded({ extended: false }));
//app.use(json());
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "10mb",
  })
);
app.use(bodyParser.json());

app.use("/history", history);
app.use("/file", file);
app.use("/cmd", cmd);

app.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}`);
  logger.info(`Server is running on port ${PORT}`);
});
