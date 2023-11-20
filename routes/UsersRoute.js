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

router.get("/api/users/current", verifyToken, getUsers);
router.post("/api/users", registerUsers);
router.post("/api/users/login", loginUsers);
router.delete("/api/users/logout", logoutUsers);
router.patch("/users/:id", verifyToken, updateUsers);
router.delete("/users/:id", deleteUsers);

export default router;
