import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ["S", "M", "L", "XL", "XXL","28","30","32","34"],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Boys", "Girls", "Unisex"],
      default: "Men",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => Number(v.toFixed(2))
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
      default: 0,
      set: (v) => Number(v.toFixed(2))
    },
    coverImage: {
      type: String,
      required: true,
    },
    images: [String],
    sizes: [sizeSchema],
    package_weight_in_kg:{type:Number},
    package_dimension:{
       length:{type:Number},
       breadth:{type:Number},
       height:{type:Number}
    },
    material: {
      type: String,
    },
    fit: {
      type: String,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  },
);

// Calculate Final Price & Stock

productSchema.pre("save", function () {
  console.log("PRE SAVE HIT");

  this.finalPrice = this.price - (this.price * this.discount) / 100;

  this.stockQuantity = this.sizes.reduce(
    (total, item) => total + item.stock,
    0,
  );

  this.inStock = this.stockQuantity > 0;

  console.log("BEFORE END");
});

const Product = mongoose.model("Product", productSchema);
export default Product;
