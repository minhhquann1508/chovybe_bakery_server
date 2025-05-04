import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

import UserModel from "../models/user.model.js";
import sendEmail from "../utils/sendMail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.js";

const controller = {};

controller.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    //   Kiểm tra người dùng có nhập email và mật khẩu
    if (!email || !password)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Vui lòng nhập email và mật khẩu" });
    //   Kiểm tra người dùng đã tồn tại chưa
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email đã tồn tại" });

    // Tạo người dùng mới
    const newUser = await UserModel.create({
      email,
      password,
    });

    return res.status(StatusCodes.CREATED).json({
      msg: "Đăng ký thành công",
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: error,
    });
  }
};

controller.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //   Kiểm tra người dùng có nhập email và mật khẩu
    if (!email || !password)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Vui lòng nhập email và mật khẩu" });

    // Kiểm tra người dùng có tồn tại không
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email không tồn tại" });

    //Kiểm tra mật khẩu có đúng không
    const isCorrectPassword = await existingUser.comparePassword(password);
    if (!isCorrectPassword)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email hoặc mật khẩu không đúng" });

    // Nếu đúng tạo token cho người dùng
    res.cookie(
      "refreshToken",
      generateRefreshToken(existingUser._id, existingUser.role),
      {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      }
    );
    return res.status(StatusCodes.OK).json({
      msg: "Đăng nhập thành công",
      data: {
        accessToken: generateAccessToken(existingUser._id, existingUser.role),
        user: {
          id: existingUser._id,
          email: existingUser.email,
          fullName: existingUser.fullName,
          phone: existingUser.phone,
          isActive: existingUser.isActive,
          role: existingUser.role,
        },
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.logout = async (req, res) => {
  try {
  } catch (error) {}
};

controller.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Vui lòng nhập email" });
    // Kiểm tra người dùng có tồn tại không
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email không tồn tại" });

    // Tạo token để reset mật khẩu và lưu vào db của người dùng
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExp = Date.now() + 15 * 60 * 1000; // Thời hạn là 15 phút

    existingUser.resetPasswordToken = resetPasswordToken;
    existingUser.resetPasswordExpires = resetPasswordExp;
    await existingUser.save();

    // Gửi email cho người dùng với link reset mật khẩu
    const resetLink = `http://localhost:3000/reset-password?token=${resetPasswordToken}`;
    const html = `<a href="${resetLink}">Nhấn vào đây để cấp lại mật khẩu</a>`;
    const isSendEmail = await sendEmail(
      existingUser.email,
      "Cập nhật mật khẩu",
      html
    );
    if (!isSendEmail)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Gửi mail không thành công" });

    //Gửi mail thành công thì trả về thông báo
    return res.status(StatusCodes.OK).json({
      msg: "Email thay đổi mật khẩu đã được gửi. Hãy kiểm tra email của bạn nhé",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, token } = req.body;
    if (!email || !newPassword || !token)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Cập nhật mật khẩu không thành công" });

    // Kiểm tra xem mật khẩu cũ và mới có giống nhau không
    const user = await UserModel.findOne({ email });
    const isMatchPassword = await user.comparePassword(newPassword);
    if (isMatchPassword)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Mật khẩu mới không được giống mật khẩu cũ" });

    // Kiểm tra xem token có đúng không
    if (user.resetPasswordToken !== token)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Bạn không thể cập nhật mật khẩu" });

    if (user.resetPasswordExpires < Date.now())
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Bạn chỉ có thể cập nhật mật khẩu trong vòng 15 phút. Vui lòng thử lại",
      });

    // Nếu đúng thì cập nhật lại mật khẩu mới
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(StatusCodes.OK).json({
      msg: "Cập nhật mật khẩu thành công",
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

export default controller;
