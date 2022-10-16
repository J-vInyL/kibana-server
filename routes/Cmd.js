import express from "express";

import { executeService, exitService } from "../Service/cmdService.js";

const router = express.Router();

router.get("/exeCute", executeService);
router.get("/exIt", exitService);

export default router;
