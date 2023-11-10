import express from "express";
import {
  getDrone,
  getDroneById,
  addDrone,
  updateDrone,
  turnDrone,
  deleteDrone,
} from "../controllers/DblockerController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/drone", verifyToken, getDrone);
router.get("/drone/:id", verifyToken, getDroneById);
router.post("/drone", verifyToken, addDrone);
router.patch("/drone/:id", verifyToken, updateDrone);
router.post("/drone/:id", verifyToken, turnDrone);
router.delete("/drone/:id", verifyToken, deleteDrone);

export default router;
