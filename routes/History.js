import express from "express";

import {
  getSetting,
  historyDelete,
  createAction,
  updateAction,
} from "../Service/HistoryService.js";

const router = express.Router();

router.post("/historySave", createAction);
router.get("/getSettings", getSetting);
router.post("/historyDelete", historyDelete);
router.post("/historyUpdate", updateAction);

export default router;
