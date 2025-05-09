import express from "express";
const router = express.Router();
import productController from "../controllers/product.controller.js";
import { verifyAccessToken } from "../middlewares/jwt.js";
import { checkRole } from "../middlewares/checkRole.js";

router
  .get("/", productController.getAllProducts)
  .post(
    "/",
    verifyAccessToken,
    checkRole("admin"),
    productController.createProduct
  )
  .put(
    "/change-status/:id",
    verifyAccessToken,
    checkRole("admin"),
    productController.changeStatusProduct
  )
  .put(
    "/:id",
    verifyAccessToken,
    checkRole("admin"),
    productController.updateProduct
  )
  .get("/top-10-products", productController.topProducts)
  .get("/categories/:id", productController.getProductByCategory)
  .get("/detail", productController.getDetailProduct);

export default router;
