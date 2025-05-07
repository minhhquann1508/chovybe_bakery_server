import express from "express";
const router = express.Router();
import userController from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/jwt.js";
import { checkRole } from "../middlewares/checkRole.js";
router
  .post("/", verifyAccessToken, checkRole("admin"), userController.addNewAdmin)
  .get("/", verifyAccessToken, checkRole("admin"), userController.getAllUsers)
  .put("/update", verifyAccessToken, userController.updateUser)
  .put(
    "/change-role",
    verifyAccessToken,
    checkRole("admin"),
    userController.changeRole
  )
  .get(
    "/:id",
    verifyAccessToken,
    checkRole("admin"),
    userController.getUserById
  );

export default router;
