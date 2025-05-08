import { StatusCodes } from "http-status-codes";

import UserModel from "../models/user.model.js";

const controller = {};

controller.getAllUsers = async (req, res) => {
  try {
    // Phân trang và tìm kiếm người dùng
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Lấy truy vấn tên hoặc email
    const query = {
      $or: [
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ],
    };

    // lấy danh sách người dùng
    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalUsers = await UserModel.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      msg: "Lấy danh sách người dùng thành công",
      data: users,
      pagination: {
        totalItems: totalUsers,
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu id người dùng",
      });

    const user = await UserModel.findById(id).select("-password");
    if (!user)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu id người dùng",
      });

    return res.status(StatusCodes.OK).json({
      msg: "Lấy thông tin người dùng thành công",
      data: user,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Lỗi phía server" });
  }
};

controller.updateUser = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu id người dùng",
      });

    const { fullName, phone } = req.body;
    if (!fullName || !phone)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu thông tin người dùng",
      });

    const user = await UserModel.findById(id).select("-password");
    if (!user)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Người dùng không tồn tại",
      });

    user.fullName = fullName;
    user.phone = phone;
    await user.save();
    return res.status(StatusCodes.OK).json({
      msg: "Cập nhật thông tin người dùng thành công",
      data: user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.addNewAdmin = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || !password || !fullName || !phone)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu thông tin người dùng",
      });
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Người dùng đã tồn tại",
      });

    const newUser = await UserModel.create({
      email,
      password,
      fullName,
      phone,
      role: "admin",
    });
    return res.status(StatusCodes.OK).json({
      msg: "Thêm tài khoản quản trị thành công",
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.changeRole = async (req, res) => {
  try {
    const { role, id } = req.body;
    if (!role || !id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu thông tin người dùng",
      });

    const user = await UserModel.findById(id).select("-password");
    if (!user)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Người dùng không tồn tại",
      });

    user.role = role;
    await user.save();
    return res.status(StatusCodes.OK).json({
      msg: "Cập nhật quyền người dùng thành công",
      data: user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Thiếu id người dùng",
      });
    const user = await UserModel.findById(id).select("-password");
    if (!user)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Người dùng không tồn tại",
      });

    if (user.role === "admin") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Không thể khóa tài khoản admin",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();
    return res.status(StatusCodes.OK).json({
      msg: user.isBlocked
        ? "Khóa người dùng thành công"
        : "Mở khóa người dùng thành công",
      data: user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

export default controller;
