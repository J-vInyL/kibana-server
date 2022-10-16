import express from "express";

import { createSettingYAML } from "../Service/FileService.js";

const router = express.Router();

router.post("/fileSave", createSettingYAML);

export default router;
