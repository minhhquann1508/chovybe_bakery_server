import express from "express";
const router = express.Router();
import authController from "../controllers/auth.controller.js";

router
  .post("/register", authController.register)
  .post("/login", authController.login)
  .post("/forgot-password", authController.forgotPassword)
  .put("/reset-password", authController.resetPassword);

export default router;
