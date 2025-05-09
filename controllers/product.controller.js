import { StatusCodes } from "http-status-codes";
import ProductModel from "../models/product.model.js";

const controller = {};

controller.createProduct = async (req, res) => {
  try {
    const { productName, category, subCategories } = req.body;
    const { id } = req.user;
    if (!productName || !category || !subCategories)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Vui lòng cung cấp tên sản phẩm, danh mục, danh mục con",
      });

    const product = await ProductModel.create({
      ...req.body,
      productName,
      subCategories,
      category,
      createdBy: id,
    });

    return res.status(StatusCodes.CREATED).json({
      msg: "Tạo sản phẩm mới thành công",
      data: product,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Không tìm thấy id sản phẩm",
      });
    const product = await ProductModel.findById(id);
    if (!product) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Không tìm thấy sản phẩm" });
    }

    Object.assign(product, { ...req.body });

    const updatedProduct = await product.save();
    return res.status(StatusCodes.OK).json({
      msg: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

// Tìm theo slug hoặc id
controller.getDetailProduct = async (req, res) => {
  try {
    const { id, slug } = req.query;
    if (!id && !slug)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Vui lòng cung cấp slug hoặc id" });

    const query = {
      isActive: true,
      $or: [{ _id: id }, { slug: { $regex: slug, $options: "i" } }],
    };

    const product = await ProductModel.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Không tìm thấy sản phẩm phù hợp",
      });

    return res.status(StatusCodes.OK).json({
      msg: "Tìm thấy sản phẩm",
      data: product,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Lỗi phía server" });
  }
};

// Soft delete sản phẩm
controller.changeStatusProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Không tìm thấy id sản phẩm",
      });

    const product = await ProductModel.findById(id);
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "Không tìm thấy sản phấm",
      });

    product.isActive = !product.isActive;
    await product.save();

    return res.status(StatusCodes.OK).json({
      msg: "Cập nhật trạng thái sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Bộ lọc giá sản phẩm
    let filterPrice = {};
    if (req.query["price[gte]"]) {
      filterPrice.$gte = Number(req.query["price[gte]"]);
    }
    if (req.query["price[lte]"]) {
      filterPrice.$lte = Number(req.query["price[lte]"]);
    }
    if (req.query["price[gt]"]) {
      filterPrice.$gt = Number(req.query["price[gt]"]);
    }
    if (req.query["price[lt]"]) {
      filterPrice.$lt = Number(req.query["price[lt]"]);
    }

    const queries = {};

    // Kiếm theo tên
    if (req.query.productName) {
      const productName = req.query.productName;
      queries.productName = { $regex: productName, options: "i" };
    }

    // Check giá
    if (Object.keys(filterPrice).length > 0) {
      queries.price = filterPrice;
    }

    const products = await ProductModel.find(queries)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalProducts = await ProductModel.countDocuments(queries);

    return res.status(StatusCodes.OK).json({
      msg: "Lấy danh sách sản phẩm thành công",
      data: products,
      pagination: {
        totalItems: totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

// Lấy top 10 sản phẩm bán chạy nhất
controller.topProducts = async (req, res) => {
  try {
    const topProducts = await ProductModel.find({ isActive: true })
      .sort({ solds: -1 })
      .limit(10);
    return res
      .status(StatusCodes.OK)
      .json({ msg: "Lấy top 10 sản phẩm thành công", data: topProducts });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

controller.getProductByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const { id } = req.params;
    if (!id)
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Không tìm thấy id của danh mục",
      });

    const products = await ProductModel.find({
      category: id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Lấy danh sách sản phẩm thành công", data: products });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Lỗi phía server" });
  }
};

export default controller;
