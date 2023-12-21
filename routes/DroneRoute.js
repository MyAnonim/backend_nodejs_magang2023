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

router.get("/api/dblockers", verifyToken, getDrone);
router.get("/api/dblockers/:id", verifyToken, getDroneById);
router.post("/api/dblockers", verifyToken, addDrone);
router.patch("/api/dblockers/:id", verifyToken, updateDrone);
router.post("/api/dblockers/:id", verifyToken, turnDrone);
router.delete("/api/dblockers/:id", verifyToken, deleteDrone);

export default router;
