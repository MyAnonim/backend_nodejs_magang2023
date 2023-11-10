import express from "express";
import {
  getUsers,
  registerUsers,
  loginUsers,
  logoutUsers,
  updateUsers,
  deleteUsers,
} from "../controllers/UsersController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.post("/register", registerUsers);
router.post("/", loginUsers);
router.delete("/users", logoutUsers);
router.patch("/users/:id", verifyToken, updateUsers);
router.delete("/users/:id", deleteUsers);

export default router;
