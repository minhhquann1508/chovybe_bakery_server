import express from "express";
const router = express.Router();
import categoryController from "../controllers/category.controller.js";
import { verifyAccessToken } from "../middlewares/jwt.js";
import { checkRole } from "../middlewares/checkRole.js";

router
  .get("/", categoryController.getAllCategories)
  .post(
    "/",
    verifyAccessToken,
    checkRole("admin"),
    categoryController.createCategory
  )
  .get("/detail", categoryController.getDetailCategory)
  .put(
    "/change-status/:id",
    verifyAccessToken,
    checkRole("admin"),
    categoryController.changeStatusCategory
  )
  .put(
    "/:id",
    verifyAccessToken,
    checkRole("admin"),
    categoryController.updateCategory
  );

export default router;
