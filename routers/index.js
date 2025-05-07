import authRoute from "../routers/authRoute.js";
import userRoute from "../routers/userRoute.js";
const useRoute = (app) => {
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
};

export default useRoute;
