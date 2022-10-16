import schedule from "node-schedule";
import moment from "moment-timezone";
import { getIP, getID, getCount, getStatusName, statusUpdate, createUpsert } from "./statusService.js";
import { metricCreateUpsert, metricStatusUpdate, getMetricCount } from "../Service/metricService.js";
import {
  heartCreateUpsert,
  heartStatusUpdate,
  getHeartFind,
  getStatusPort,
  getHeartCountTest,
  heartStatusInit,
  heartUpStatusUpdate,
} from "../Service/heartService.js";
import {
  clientElastic,
  getIndex,
  deleteIndex,
  getMetricSearch,
  getShutDownTime,
  getHeartSearch,
  getHeartHostName,
} from "../common/common.js";
import { mailOptions, serviceMailOptions, serviceOperateMailOptions } from "./mailService.js";
import StatusEnum from "../enum/Enum.js";

moment.tz.setDefault("Asia/Seoul");
const regexpDate = /\d{4}.\d{2}.\d{2}/g;
// 수행 함수
const runSchedule = (config) => {
  //삭제할 인덱스 범위
  const setDate = config["elasticConfig"]["deleteDate"];

  //elasticsearch 호출
  let client = clientElastic;
  // 스케줄링 동작 로직
  schedule.scheduleJob("0 0 0 * * *", function () {
    runDeleteIndex(client, setDate);
  });
};
//서버 상태 확인 로직  (5분 주기)
const statusSchedule = () => {
  //elasticsearch 호출
  let client = clientElastic;

  //재귀식 규칙 시간 설정 (5분)
  const rule = new schedule.RecurrenceRule();
  rule.minute = new schedule.Range(0, 59, 5);

  //rule.second = 10;
  //서버 상태 유무 메일 서비스 시작
  schedule.scheduleJob(rule, async function () {
    //const t = await model.sequelize.transaction();
    const { STATUS_UP, STATUS_DOWN, MAIL_INIT, SERVER_STATUS, METRIC_NAME, COUNT } = StatusEnum;
    const heartDownAry = new Array();
    const heartUpAry = new Array();
    //서버 이름 가져오기
    const getStatus = await getStatusName();

    //메트릭비트 하트비트 분리된 서비스
    const metricSearchData = await getMetricSearch(client);
    const heartSearchData = await getHeartSearch(client);
    const heartHostName = await getHeartHostName(client);

    //메트릭 검증을 위한 새로운 배열
    let verifyMetricArr = metricSearchData.map((value, index) => {
      return value.key;
    });

    //하트비트 호스트 이름 값만 위한 배열
    let verifyHeartHostName = heartHostName.map((value, index) => {
      return value.key;
    });

    //하트비트 검증을 위한 새로운 객체 배열
    let verifyHeartArr = heartSearchData.map((status, index) => {
      let heartAry = new Array();

      try {
        status.getName.buckets.map((name, nameIndex) => {
          name.getPort.buckets.map((port, portIndex) => {
            let heartObj = new Object();
            let heartdataAry = new Array();
            heartObj.status = status.key;
            heartObj.name = name.key;
            heartObj.port = port.key;
            heartdataAry.push(heartObj);
            heartAry.push(heartdataAry);
          });
        });

        return heartAry;
      } catch (err) {
        console.log("ERROR", err);
      }
    });

    //하트비트 summary up(서비스 정상작동 되는) 값 들만 위한 배열
    heartSearchData[0].getName.buckets.map((name, index) => {
      try {
        name.getPort.buckets.map((port, nameIndex) => {
          let heartObj = new Object();
          heartObj.name = name.key;
          heartObj.port = port.key;

          heartUpAry.push(heartObj);
        });
        return heartUpAry;
      } catch (err) {
        console.log("SUMMARY UP ERROR", err);
      }
    });

    //하트비트 summary down(서비스 안되는) 값 들만 위한 배열
    if (heartSearchData[1] != undefined) {
      heartSearchData[1].getName.buckets.map((name, index) => {
        try {
          name.getPort.buckets.map((port, nameIndex) => {
            let heartObj = new Object();
            heartObj.name = name.key;
            heartObj.port = port.key;

            heartDownAry.push(heartObj);
          });

          return heartDownAry;
        } catch (err) {
          console.log("SUMMARY DOWN ERROR", err);
        }
      });
    }

    //db에 값이 없으면 초기 값 넣기
    if (getStatus.length == 0) {
      metricSearchData.map(async (value, valueIndex) => {
        //status 초기 값
        await createUpsert(value.key, value.getIP.buckets[0].key, SERVER_STATUS, MAIL_INIT);

        //metric 초기 값
        await metricCreateUpsert(await getID(value.key), SERVER_STATUS, MAIL_INIT);
      });

      //heart 초기 값
      verifyHeartArr.map((value, valueIndex) => {
        value.map((data, dataIndex) => {
          data.map(async (result, resultIndex) => {
            await heartCreateUpsert(await getID(result.name), result.port, result.status, MAIL_INIT);
          });
        });
      });
    }

    //서버 상태 유무 반복문 돌리기  (statuses, metric_statuses 테이블만 영향)
    for (let index = 0; index < getStatus.length; index++) {
      //수집되는 서버 이름과 DB에 저장되어 있는 서버이름 검증
      //metric heart 둘다 내려가 있는 상태
      if (verifyMetricArr.indexOf(getStatus[index]) == -1 && verifyHeartHostName.indexOf(getStatus[index]) == -1) {
        //서버 상태 유무 메일 3번 보내기
        if ((await getCount(getStatus[index])) < COUNT) {
          const elasticTime = new Date(await getShutDownTime(client, getStatus[index])).toLocaleString();

          //메일 보내기
          mailOptions(getStatus[index], await getIP(getStatus[index]), elasticTime);
          await statusUpdate(
            getStatus[index],
            await getIP(getStatus[index]),
            STATUS_DOWN,
            (await getCount(getStatus[index])) + STATUS_UP
          );
        }
      }

      //metric 만 내려가 있는 상태
      if (verifyMetricArr.indexOf(getStatus[index]) == -1) {
        try {
          //서버 상태 유무 메일 3번 보내기
          if ((await getMetricCount(await getID([getStatus[index]]))) < COUNT) {
            const elasticTime = new Date(await getShutDownTime(client, getStatus[index])).toLocaleString();
            //메일 보내기
            serviceMailOptions(getStatus[index], await getIP(getStatus[index]), METRIC_NAME, elasticTime);

            await metricStatusUpdate(
              await getID(getStatus[index]),
              STATUS_DOWN,
              (await getMetricCount(await getID([getStatus[index]]))) + STATUS_UP
            );
          }
        } catch (err) {
          console.timeLog("ERROR", err);
        }
      }

      for (let heartIndex = 0; heartIndex < heartUpAry.length; heartIndex++) {
        //하트비트 정상작동 할  떄
        if (heartUpAry[heartIndex].name == getStatus[index]) {
          await heartUpStatusUpdate(await getID(getStatus[index]), SERVER_STATUS, MAIL_INIT);
        }
      }

      for (let heartIndex = 0; heartIndex < heartDownAry.length; heartIndex++) {
        //heartbeat만 내려가 있을때
        if (heartDownAry[heartIndex].name == getStatus[index]) {
          let heartbeatMailCount = await getHeartCountTest(
            heartDownAry[heartIndex].name,
            heartDownAry[heartIndex].port
          );
          if (heartbeatMailCount < COUNT) {
            const elasticTime = new Date(await getShutDownTime(client, getStatus[index])).toLocaleString();
            //메일 보내기
            serviceOperateMailOptions(
              heartDownAry[heartIndex].name,
              await getIP(heartDownAry[heartIndex].name),
              await getHeartFind(heartDownAry[heartIndex].name, heartDownAry[heartIndex].port),
              elasticTime
            );

            await heartStatusUpdate(
              await getID(heartDownAry[heartIndex].name),
              heartDownAry[heartIndex].port,
              STATUS_DOWN,
              heartbeatMailCount + STATUS_UP
            );
          }
        } else if (heartAry[heartIndex].name != getStatus[index]) {
          await heartUpStatusUpdate(await getID(getStatus[index]), SERVER_STATUS, MAIL_INIT);
        }
      }

      //에이전트 수집 확인 시 실행으로 변경
      if (verifyMetricArr.indexOf(getStatus[index]) != -1) {
        await metricStatusUpdate(await getID(getStatus[index]), SERVER_STATUS, MAIL_INIT);
        await statusUpdate(getStatus[index], await getIP(getStatus[index]), SERVER_STATUS, MAIL_INIT);
      }
    }
  });
};

//실제 동작 수행
async function runDeleteIndex(client, setDate) {
  let checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - setDate);
  getIndex(client, function (data) {
    for (let i in data) {
      let getItem = data[i].index;
      if (getItem.match(regexpDate)) {
        let resultDate = checkDate - changeDate(getItem.match(regexpDate)[0]);
        if (resultDate > 0) {
          deleteIndex(client, getItem);
        }
      }
    }
  });
}

// 일자 형태 데이터를 Date 타입을 파싱
function changeDate(dateString) {
  var parts = dateString.split(".");
  var mydate = new Date(parts[0], parts[1] - 1, parts[2]);
  return mydate;
}

export { runSchedule, statusSchedule };
