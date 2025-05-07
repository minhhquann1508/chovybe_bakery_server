import { StatusCodes } from "http-status-codes";

export const notFound = async (req, res, next) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    msg: "Không tìm thấy trang này",
  });
};
