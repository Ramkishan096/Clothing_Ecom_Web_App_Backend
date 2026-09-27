import Product from "../product.model.js";
import mongoose from "mongoose";
import { generateSlug } from "../prouductUtils/generateSlug.js";

// ==================== CREATE PRODUCT ====================
export const createProductService = async (productData) => {
  try {
    console.log("hit product service function createProductService...");
    // Validate required fields
    const requiredFields = [
      "name",
      "slug",
      "description",
      "category",
      "subCategory",
      "brand",
      "price",
      "coverImage",
    ];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate price
    if (productData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    // Validate discount
    if (
      productData.discount &&
      (productData.discount < 0 || productData.discount > 100)
    ) {
      throw new Error("Discount must be between 0 and 100");
    }

    // Validate gender
    if (
      productData.gender &&
      !["Men", "Women", "Boys", "Girls", "Unisex"].includes(productData.gender)
    ) {
      throw new Error("Invalid gender value");
    }

    // Validate sizes
    if (productData.sizes && Array.isArray(productData.sizes)) {
      const validSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
      for (const size of productData.sizes) {
        if (!validSizes.includes(size.size)) {
          throw new Error(`Invalid size: ${size.size}`);
        }
        if (size.stock && size.stock < 0) {
          throw new Error(`Stock cannot be negative for size ${size.size}`);
        }
      }
    }

    // Check for duplicate slug
    const existingSlug = await Product.findOne({
      slug: productData.slug.toLowerCase(),
    });
    if (existingSlug) {
      throw new Error("Slug already exists");
    }

    // Check for duplicate product_id
    if (productData.product_id) {
      const existingProductId = await Product.findOne({
        product_id: productData.product_id,
      });
      if (existingProductId) {
        throw new Error("Product ID already exists");
      }
    }
    console.log("1---------------------------------");
    const product = new Product(productData);
    await product.save();
    console.log("Product created successfully");
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== GET ALL PRODUCTS ====================
export const getAllProductsService = async (
  page = 1,
  limit = 10,
  sort = "-createdAt",
) => {
  try {
    console.log("hit product service function getALlProductsService");
    // Validate pagination
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));

    const skip = (page - 1) * limit;

    // Validate sort field
    const allowedSortFields = [
      "createdAt",
      "price",
      "finalPrice",
      "rating",
      "name",
    ];
    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    if (!allowedSortFields.includes(sortField) && sortField !== "") {
      throw new Error(
        `Invalid sort field. Allowed: ${allowedSortFields.join(", ")}`,
      );
    }

    const [products, total] = await Promise.all([
      Product.find({ isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ isActive: true }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== GET PRODUCT BY ID ====================
export const getProductByIdService = async (id) => {
  try {
    // Validate MongoDB ObjectId
    console.log("hit product service function getProductByIdService...");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    const product = await Product.findOne({ _id: id, isActive: true }).lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== UPDATE PRODUCT ====================
export const updateProductService = async (id, updateData) => {
  try {
    // Validate MongoDB ObjectId
    console.log("hit product service function updateProuduct Service...",updateData);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }


    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Validate price
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    // Validate discount
    if (
      updateData.discount !== undefined &&
      (updateData.discount < 0 || updateData.discount > 100)
    ) {
      throw new Error("Discount must be between 0 and 100");
    }

    // Validate gender
    if (
      updateData.gender &&
      !["Men", "Women", "Boys", "Girls", "Unisex"].includes(updateData.gender)
    ) {
      throw new Error("Invalid gender value");
    }

    // update slug 
    if(updateData.name){
      updateData.slug = generateSlug(updateData.name)
    }

    // Validate slug uniqueness
    // if (updateData.slug) {
    //   const slugExists = await Product.findOne({
    //     slug: updateData.slug.toLowerCase(),
    //     _id: { $ne: id },
    //   });
    //   if (slugExists) {
    //     throw new Error("Slug already exists");
    //   }
    // }

    // Validate product_id uniqueness
    if (updateData.product_id) {
      const productIdExists = await Product.findOne({
        product_id: updateData.product_id,
        _id: { $ne: id },
      });
      if (productIdExists) {
        throw new Error("Product ID already exists");
      }
    }

    // Validate sizes
    if (updateData.sizes && Array.isArray(updateData.sizes)) {
      const validSizes = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34"];
      for (const size of updateData.sizes) {
        if (!validSizes.includes(size.size)) {
          throw new Error(`Invalid size: ${size.size}`);
        }
        if (size.stock !== undefined && size.stock < 0) {
          throw new Error(`Stock cannot be negative for size ${size.size}`);
        }
      }
    }

    // Remove protected fields
    const protectedFields = ["_id", "__v", "createdAt", "updatedAt"];
    protectedFields.forEach((field) => delete updateData[field]);

    // Update product
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: "after" },
    );

    await product.save(); // Trigger pre-save middleware
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== DELETE PRODUCT (Soft Delete) ====================
export const deleteProductService = async (id) => {
  try {
    // Validate MongoDB ObjectId
    console.log("hit product service function deleteProductService...");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== GET PRODUCTS BY CATEGORY ====================
export const getProductsByCategoryService = async (
  category,
  page = 1,
  limit = 10,
) => {
  try {
    // Validate category
    console.log("hit product service function getProductsByCategoryService...");
    if (!category || category.trim().length === 0) {
      throw new Error("Category is required");
    }

    // Validate pagination
    page = Math.max(1, parseInt(page));
    limit = Math.min(50, Math.max(1, parseInt(limit)));

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({
        category: { $regex: category.trim(), $options: "i" },
        isActive: true,
      })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({
        category: { $regex: category.trim(), $options: "i" },
        isActive: true,
      }),
    ]);

    if (products.length === 0) {
      throw new Error(`No products found in category: ${category}`);
    }

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== GET FILTERED PRODUCTS ====================
export const getFilteredProductsService = async (filters = {}) => {
  try {
    console.log("hit product service function getFilteredProductsService...");
    const query = { isActive: true };

    console.log("req query :", filters);

    // Category filter
    if (filters.category) {
      query.category = { $regex: filters.category.trim(), $options: "i" };
    }

    // SubCategory filter
    if (filters.subCategory) {
      query.subCategory = { $regex: filters.subCategory.trim(), $options: "i" };
    }

    // Brand filter
    if (filters.brand) {
      query.brand = { $regex: filters.brand.trim(), $options: "i" };
    }

    // Gender filter
    if (filters.gender) {
      const validGenders = ["Men", "Women", "Boys", "Girls", "Unisex"];
      if (!validGenders.includes(filters.gender)) {
        throw new Error(`Invalid gender. Allowed: ${validGenders.join(", ")}`);
      }
      query.gender = filters.gender;
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.finalPrice = {};
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice);
        if (isNaN(minPrice) || minPrice < 0) {
          throw new Error("Invalid minPrice value");
        }
        query.finalPrice.$gte = minPrice;
      }
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (isNaN(maxPrice) || maxPrice < 0) {
          throw new Error("Invalid maxPrice value");
        }
        query.finalPrice.$lte = maxPrice;
      }
      if (
        query.finalPrice.$gte &&
        query.finalPrice.$lte &&
        query.finalPrice.$gte > query.finalPrice.$lte
      ) {
        throw new Error("minPrice cannot be greater than maxPrice");
      }
    }

    // Rating filter
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      if (isNaN(minRating) || minRating < 0 || minRating > 5) {
        throw new Error("minRating must be between 0 and 5");
      }
      query.rating = { $gte: minRating };
    }

    // Size filter
    if (filters.size) {
      const validSizes = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34"];
      const sizeUpper = filters.size.toUpperCase();
      if (!validSizes.includes(sizeUpper)) {
        throw new Error(`Invalid size. Allowed: ${validSizes.join(", ")}`);
      }
      query["sizes.size"] = sizeUpper;
    }

    // Stock filter
    if (filters.inStock !== undefined) {
      query.inStock = filters.inStock === "true";
    }

    // Boolean filters
    if (filters.isNewArrival !== undefined) {
      query.isNewArrival = filters.isNewArrival === "true";
    }
    if (filters.isPopular !== undefined) {
      query.isPopular = filters.isPopular === "true";
    }
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured === "true";
    }

    // Search query
    if (filters.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm.length < 2) {
        throw new Error("Search term must be at least 2 characters");
      }
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { brand: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // // Sorting
    // let sort = {};
    // const validSortFields = [
    //   "price_asc",
    //   "price_desc",
    //   "rating",
    //   "newest",
    //   "popular",
    // ];
    // if (filters.sortBy) {
    //   const sortField = filters.sortBy.startsWith("-")
    //     ? filters.sortBy.substring(1)
    //     : filters.sortBy;
    //   if (!validSortFields.includes(sortField)) {
    //     throw new Error(
    //       `Invalid sort field. Allowed: ${validSortFields.join(", ")}`,
    //     );
    //   }
    //   const sortOrder = filters.sortBy.startsWith("-") ? -1 : 1;
    //   sort = { [sortField]: sortOrder };
    // } else {
    //   sort = { createdAt: -1 };
    // }

    // Sorting
    let sort = {};
    const validSortFields = {
      price_asc: { field: "finalPrice", order: 1 },
      price_desc: { field: "finalPrice", order: -1 },
      rating: { field: "rating", order: -1 },
      newest: { field: "createdAt", order: -1 },
      // popular: { field: "popularityScore", order: -1 },
      // discount: { field: "discount", order: -1 },
    };

    if (filters.sortBy && validSortFields[filters.sortBy]) {
      const sortConfig = validSortFields[filters.sortBy];
      sort = { [sortConfig.field]: sortConfig.order };
    } else {
      // Default sort by newest
      sort = { createdAt: -1 };
    }

    // Pagination
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      filters: {
        applied: { ...filters },
        totalResults: total,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== GET RELATED PRODUCTS ====================
export const getRelatedProductsService = async (productId, limit = 4) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID format");
    }

    // Get the product
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new Error("Product not found");
    }

    // Validate limit
    limit = Math.min(10, Math.max(1, parseInt(limit)));

    // Find related products based on category, subCategory, brand, gender
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: product.category },
        { subCategory: product.subCategory },
        { brand: product.brand },
        { gender: product.gender },
      ],
    })
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit)
      .lean();

    // If not enough related products, add more from same category
    if (relatedProducts.length < limit) {
      const additionalProducts = await Product.find({
        _id: { $ne: productId, $nin: relatedProducts.map((p) => p._id) },
        isActive: true,
        category: product.category,
      })
        .sort({ rating: -1 })
        .limit(limit - relatedProducts.length)
        .lean();

      relatedProducts.push(...additionalProducts);
    }

    return relatedProducts;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ==================== SEARCH PRODUCTS ====================
export const searchProductsService = async (query, filters = {}) => {
  try {
    // Validate search query
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const searchQuery = { isActive: true };
    const searchTerm = query.trim();

    // Search in multiple fields
    if (searchTerm.length >= 2) {
      searchQuery.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { brand: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
      ];
    } else {
      throw new Error("Search term must be at least 2 characters");
    }

    // Apply additional filters
    if (filters.category) {
      searchQuery.category = { $regex: filters.category.trim(), $options: "i" };
    }

    if (filters.brand) {
      searchQuery.brand = { $regex: filters.brand.trim(), $options: "i" };
    }

    if (filters.minPrice || filters.maxPrice) {
      searchQuery.finalPrice = {};
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice);
        if (isNaN(minPrice) || minPrice < 0) {
          throw new Error("Invalid minPrice value");
        }
        searchQuery.finalPrice.$gte = minPrice;
      }
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (isNaN(maxPrice) || maxPrice < 0) {
          throw new Error("Invalid maxPrice value");
        }
        searchQuery.finalPrice.$lte = maxPrice;
      }
    }

    if (filters.gender) {
      const validGenders = ["Men", "Women", "Boys", "Girls", "Unisex"];
      if (!validGenders.includes(filters.gender)) {
        throw new Error(`Invalid gender. Allowed: ${validGenders.join(", ")}`);
      }
      searchQuery.gender = filters.gender;
    }

    // Pagination
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .sort({ rating: -1, totalReviews: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchQuery),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      searchTerm: searchTerm,
      totalResults: total,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// ======================== Get All Categories =================
export const getAllCategories = async () => {
  return await Product.distinct("category", {
    isActive: true,
  });
};

// ======================== Get All Brands =================
export const getAllBrands = async () => {
  return await Product.distinct("brand", {
    isActive: true,
  });
};
