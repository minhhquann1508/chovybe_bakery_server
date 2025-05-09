import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
    },
    isHot: { type: Boolean, default: false },
    ratings: { type: Number, default: 0 },
    price: {
      type: Number,
      default: 0,
    },
    discount: { type: Number, default: 0 },
    finalPrice: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    solds: {
      type: Number,
      default: 0,
    },
    stocks: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    slug: {
      type: String,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("productName")) {
    this.slug = slugify(this.productName, { lower: true, strict: true });
  }
  this.finalPrice = this.price - (this.price * this.discount) / 100;
  next();
});

export default mongoose.model("Product", productSchema);
