import authRoute from "../routers/authRoute.js";

const useRoute = (app) => {
  app.use("/api/auth", authRoute);
};

export default useRoute;
