import express from "express";
import {
  getUsers,
  registerUsers,
  loginUsers,
  logoutUsers,
  updateUsers,
  deleteUsers,
  getUsersById,
} from "../controllers/UsersController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/api/users/current", verifyToken, getUsers);
router.get("/api/users/current/:id", verifyToken, getUsersById);
router.post("/api/users", registerUsers);
router.post("/api/users/login", loginUsers);
router.delete("/api/users/logout", logoutUsers);
router.patch("/api/users/update/:id", verifyToken, updateUsers);
router.delete("/api/users/:id", verifyToken, deleteUsers);

export default router;
