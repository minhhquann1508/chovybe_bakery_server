import mongoose from "mongoose";
import slugify from "slugify";

const subCategorySchema = new mongoose.Schema(
  {
    subCategoryName: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

subCategorySchema.pre("save", function (next) {
  if (this.isModified("subCategoryName")) {
    this.slug = slugify(this.subCategoryName, { lower: true });
  }
  next();
});

export default mongoose.model("SubCategory", subCategorySchema);
