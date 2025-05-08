import { StatusCodes } from "http-status-codes";
import subCategoryModel from "../models/subCategory.model.js";

const controller = {};

controller.createSubCategory = async (req, res) => {
  try {
    const { subCategoryName, category } = req.body;
    const { id: userId } = req.user;
    if (!subCategoryName || !category)
      return (
        res.status(StatusCodes.BAD_REQUEST),
        json({
          msg: "Vui lòng nhập đầy đủ thông tin",
        })
      );

    const subCategory = await subCategoryModel.create({
      ...req.body,
      subCategoryName,
      createdBy: userId,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Tạo danh mục con thành công",
      data: subCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.getAllSubCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { subCategoryName: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ],
    };
    const totalSubCategories = await subCategoryModel.countDocuments(query);
    const subCategories = await subCategoryModel
      .find(query)
      .populate("category", "categoryName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách danh mục con thành công",
      data: subCategories,
      pagination: {
        totalItems: totalSubCategories,
        totalPage: Math.ceil(totalSubCategories / limit),
        currentPage: +page,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.updateSubCategory = async (req, res) => {
  try {
    const { subCategoryName, category } = req.body;
    const { id } = req.params;

    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Vui lòng cung cấp id",
      });

    if (!subCategoryName || !category)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Vui lòng nhập đầy đủ thông tin",
      });

    const subCategory = await subCategoryModel.findById(id);
    if (!subCategory)
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Danh mục con không tồn tại",
      });

    subCategory.subCategoryName = subCategoryName;
    subCategory.category = category;
    await subCategory.save();

    return res.status(StatusCodes.OK).json({
      message: "Cập nhật danh mục con thành công",
      data: subCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.getDetailSubCategory = async (req, res) => {
  try {
    const { slug, id } = req.query;
    if (!id && !slug)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu id hoặc slug danh mục",
      });

    const query = {
      $or: [{ _id: id }, { slug: { $regex: slug, $options: "i" } }],
    };

    const subCategory = await subCategoryModel
      .findOne(query)
      .populate("category", "categoryName");

    if (!subCategory)
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Danh mục con không tồn tại",
      });

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh mục con thành công",
      data: subCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

controller.changeStatusSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu id danh mục",
      });

    const subCategory = await subCategoryModel.findById(id);
    if (!subCategory)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Không tìm thấy danh mục con",
      });

    subCategory.isActive = !subCategory.isActive;
    await subCategory.save();

    return res.status(StatusCodes.OK).json({
      message: "Thay đổi trạng thái danh mục con thành công",
      data: subCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi phía server",
    });
  }
};

export default controller;
