import mongoose from "mongoose";
import Product from "./modules/ProductModule/product.model.js";
import dotenv from "dotenv";
    
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);

const tshirtImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500",
  "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=500",
  "https://images.unsplash.com/photo-1622445275576-721325763afe?w=500",
];

const shirtImages = [
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500",
  "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=500",
];

const jeansImages = [
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
  "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
  "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500",
];

const lowerImages = [
  "https://images.unsplash.com/photo-1506629905607-d9c297d35f2f?w=500",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500",
];

const categories = [
  {
    category: "T-Shirts",
    subCategory: "Casual",
    material: "100% Cotton",
    fit: "Regular",
    names: [
      "Classic Cotton T-Shirt",
      "Premium Round Neck Tee",
      "Summer Casual T-Shirt",
      "Graphic Printed Tee",
      "Oversized Cotton Tee",
    ],
    images: tshirtImages,
  },
  {
    category: "Shirts",
    subCategory: "Formal",
    material: "Cotton Blend",
    fit: "Slim",
    names: [
      "Formal Office Shirt",
      "Checked Casual Shirt",
      "Oxford Cotton Shirt",
      "Premium Linen Shirt",
      "Slim Fit Shirt",
    ],
    images: shirtImages,
  },
  {
    category: "Jeans",
    subCategory: "Denim",
    material: "Denim",
    fit: "Slim",
    names: [
      "Slim Fit Jeans",
      "Classic Blue Jeans",
      "Black Denim Jeans",
      "Stretch Fit Jeans",
      "Regular Denim Jeans",
    ],
    images: jeansImages,
  },
  {
    category: "Lower",
    subCategory: "Sports",
    material: "Polyester",
    fit: "Comfort",
    names: [
      "Track Pant",
      "Sports Lower",
      "Jogger Pant",
      "Gym Lower",
      "Comfort Lower",
    ],
    images: lowerImages,
  },
];

const brands = [
  "Nike",
  "Adidas",
  "Puma",
  "Levis",
  "US Polo",
  "Roadster",
  "H&M",
  "Zara",
];

const genders = ["Men", "Women", "Unisex"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

try {
  await Product.deleteMany({});
  console.log("Old products deleted");

  for (let i = 1; i <= 20; i++) {
    const categoryData = categories[i % categories.length];

    const name = `${randomItem(categoryData.names)} ${i}`;

    const price = Math.floor(Math.random() * 2500) + 500;

    const discount = Math.floor(Math.random() * 50);

    const image1 = randomItem(categoryData.images);
    const image2 = randomItem(categoryData.images);
    const image3 = randomItem(categoryData.images);

    const product = new Product({
      product_id: `PRD${1000 + i}`,

      name,

      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-"),

      description: `${name} made with premium quality fabric for daily comfort and style.`,

      category: categoryData.category,

      subCategory: categoryData.subCategory,

      brand: randomItem(brands),

      gender: randomItem(genders),

      price,

      discount,

      coverImage: image1,

      images: [image1, image2, image3],

      sizes: [
        {
          size: "S",
          stock: Math.floor(Math.random() * 15) + 1,
        },
        {
          size: "M",
          stock: Math.floor(Math.random() * 15) + 1,
        },
        {
          size: "L",
          stock: Math.floor(Math.random() * 15) + 1,
        },
        {
          size: "XL",
          stock: Math.floor(Math.random() * 15) + 1,
        },
      ],

      material: categoryData.material,

      fit: categoryData.fit,

      rating: Number((Math.random() * 5).toFixed(1)),

      totalReviews: Math.floor(Math.random() * 1000),

      isNewArrival: Math.random() > 0.7,

      isPopular: Math.random() > 0.6,

      isFeatured: Math.random() > 0.8,

      isActive: true,

      tags: [
        categoryData.category.toLowerCase(),
        "fashion",
        "clothing",
        "premium",
      ],
    });

    await product.save();

    console.log(`✅ Added ${i}/100 : ${product.name}`);
  }

  console.log("🎉 100 Products Inserted Successfully");
} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
}