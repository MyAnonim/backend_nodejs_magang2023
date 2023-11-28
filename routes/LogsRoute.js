import express from "express";
import { getLogs, getLogsById } from "../controllers/LogsController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/api/dblcokers/logs", verifyToken, getLogs);
router.get("/api/dblcokers/logs/:id", verifyToken, getLogsById);

export default router;
