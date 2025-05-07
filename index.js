import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDb } from "./configs/db.js";
import useRoute from "./routers/index.js";
import { notFound } from "./middlewares/notFound.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

useRoute(app);

app.use(notFound);

const port = process.env.PORT || 5050;

await connectDb();

app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
