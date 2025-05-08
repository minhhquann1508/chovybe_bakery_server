import { StatusCodes } from "http-status-codes";
import CategoryModel from "../models/category.model.js";

const controller = {};

controller.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const { id: userId } = req.user;
    if (!categoryName || !userId)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu thông tin",
      });

    const category = await CategoryModel.create({
      ...req.body,
      categoryName,
      createdBy: userId,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    //Truy vấn theo tên
    const query = {
      $or: [
        { categoryName: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ],
    };

    const categories = await CategoryModel.find(query)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCategories = await CategoryModel.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách danh mục thành công",
      data: categories,
      pagination: {
        totalCategories,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCategories / limit),
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

// Kiếm chi tiết danh mục dựa trên slug hoặc cả id
controller.getDetailCategory = async (req, res) => {
  try {
    const { slug, id } = req.query;
    if (!id && !slug)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu id hoặc slug danh mục",
      });

    const query = {
      $or: [{ _id: id }, { slug: slug }],
    };

    const category = await CategoryModel.findOne(query).populate(
      "createdBy",
      "fullName email"
    );
    if (!category)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Không tìm thấy danh mục",
      });

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh mục thành công",
      data: category,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu id danh mục",
      });

    const { categoryName, description } = req.body;
    if (!categoryName || !description)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu thông tin",
      });

    const category = await CategoryModel.findById(id);
    if (!category)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Không tìm thấy danh mục",
      });

    category.categoryName = categoryName;
    category.description = description;
    await category.save();

    return res.status(StatusCodes.OK).json({
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.changeStatusCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu id danh mục",
      });

    const category = await CategoryModel.findById(id);
    if (!category)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Không tìm thấy danh mục",
      });

    category.isActive = !category.isActive;
    await category.save();

    return res.status(StatusCodes.OK).json({
      message: "Thay đổi trạng thái danh mục thành công",
      data: category,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

export default controller;
