import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long"],
      maxlength: [100, "Product name can't exceed 100 characters"],
    },

    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
      index: true,
    },

    category: {
      type: String,
      required: [true, "Please enter product category"],
      trim: true,
      index: true,
    },

    image: {
      type: String,
      default: "", // Avoid undefined fields
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ name: "text", category: "text"});
productSchema.index({ createdAt: -1 });
productSchema.path("price").get((v) => Number(v.toFixed(2)));

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
