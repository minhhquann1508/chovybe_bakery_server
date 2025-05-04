import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDb } from "./configs/db.js";
import useRoute from "./routers/index.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

useRoute(app);

const port = process.env.PORT || 5050;

await connectDb();

app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
