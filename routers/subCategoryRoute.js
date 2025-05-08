import express from "express";
const router = express.Router();
import subCategoryController from "../controllers/subCategory.controller.js";
import { verifyAccessToken } from "../middlewares/jwt.js";
import { checkRole } from "../middlewares/checkRole.js";

router
  .get("/", subCategoryController.getAllSubCategories)
  .post(
    "/",
    verifyAccessToken,
    checkRole("admin"),
    subCategoryController.createSubCategory
  )
  .get("/detail", subCategoryController.getDetailSubCategory)
  .put(
    "/change-status/:id",
    verifyAccessToken,
    checkRole("admin"),
    subCategoryController.changeStatusSubCategory
  )
  .put(
    "/:id",
    verifyAccessToken,
    checkRole("admin"),
    subCategoryController.updateSubCategory
  );

export default router;
