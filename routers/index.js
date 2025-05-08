import authRoute from "../routers/authRoute.js";
import userRoute from "../routers/userRoute.js";
import categoryRoute from "../routers/categoryRoute.js";
import subCategoryRoute from "../routers/subCategoryRoute.js";
const useRoute = (app) => {
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/categories", categoryRoute);
  app.use("/api/subCategories", subCategoryRoute);
};

export default useRoute;
