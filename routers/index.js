import authRoute from "../routers/authRoute.js";
import userRoute from "../routers/userRoute.js";
import categoryRoute from "../routers/categoryRoute.js";
const useRoute = (app) => {
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/categories", categoryRoute);
};

export default useRoute;
