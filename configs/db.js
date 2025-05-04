import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    if (conn.connection.readyState === 1) {
      console.log("Kết nối database thành công!");
    } else {
      throw new Error("Kết nối database thất bại!");
    }
  } catch (error) {
    throw new Error(error);
  }
};
