import { generateSlug } from "../prouductUtils/generateSlug.js";
import * as productService from "../services/product.service.js";

// ==================== CREATE PRODUCT ====================
export const createProduct = async (req, res) => {
  try {
    console.log("api Hit create Product...")
    const productData = req.body;
    console.log("productData:",productData)
    // Generate product_id if not provided  
     const timestamp = Date.now().toString(36).toUpperCase();
     const random = Math.random().toString(36).substring(2, 6).toUpperCase();
     productData.product_id = `PRD-${timestamp}-${random}`;

     productData.slug = generateSlug(productData.name)
  

    const product = await productService.createProductService(productData);
    console.log("Product created successfully:", product);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
      data:null,
      error: error.message || "An error occurred while creating the product."
    });
  }
};


// ==================== GET ALL PRODUCTS ====================
export const getAllProducts = async (req, res) => {
  try {
    console.log("hit api get All Prouducts...")
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const result = await productService.getAllProductsService(
      parseInt(page),
      parseInt(limit),
      sort
    );
    
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data:null,
      error:error.message
    });
  }
};

// ==================== GET PRODUCT BY ID ====================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductByIdService(id);
    
    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid product ID format") ? 400 : 404;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE PRODUCT ====================
export const updateProduct = async (req, res) => {
  try {

    console.log("hit api update Product...")
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await productService.updateProductService(id, updateData);
    
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid product ID format") ? 400 : 
                       error.message.includes("Product not found") ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE PRODUCT ====================
export const deleteProduct = async (req, res) => {
  try {
    console.log("hit api delete Product...")
    const { id } = req.params;
    const product = await productService.deleteProductService(id);
    
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid product ID format") ? 400 : 404;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// // ==================== GET PRODUCTS BY CATEGORY ====================
export const getProductsByCategory = async (req, res) => {
  try {
    console.log("hit api get Products By Category...")
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await productService.getProductsByCategoryService(
      category,
      parseInt(page),
      parseInt(limit)
    );
    
    return res.status(200).json({
      success: true,
      message: `Products in category: ${category}`,
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    const statusCode = error.message.includes("Category is required") ? 400 : 404;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// // ==================== GET FILTERED PRODUCTS ====================
export const getFilteredProducts = async (req, res) => {
  try {
   console.log("hit api get Filtered Products...")
    const filters = req.query;
    const result = await productService.getFilteredProductsService(filters);
    
    return res.status(200).json({
      success: true,
      message: "Filtered products fetched successfully",
      data: result.products,
      pagination: result.pagination,
      filters: result.filters
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET RELATED PRODUCTS ====================
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    const products = await productService.getRelatedProductsService(
      id,
      parseInt(limit)
    );
    
    return res.status(200).json({
      success: true,
      message: "Related products fetched successfully",
      data: products,
      count: products.length
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid product ID format") ? 400 : 404;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== SEARCH PRODUCTS ====================
export const searchProducts = async (req, res) => {
  try {

    console.log("req.query:",req.query)
    const { q, ...filters } = req.query;

    console.log("q:",q,"filters:",filters)
    
    // Validate search query
    // if (!q) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Search query (q) is required"
    //   });
    // }
    
    const result = await productService.searchProductsService(q, filters);
    
    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: result.products,
      pagination: result.pagination,
      searchTerm: result.searchTerm,
      totalResults: result.totalResults
    });
  } catch (error) {
    const statusCode = error.message.includes("Search query is required") ? 400 : 
                       error.message.includes("at least 2 characters") ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};


// ======================== Get All Categories =================
export const getAllCategory = async (req, res) => {
  try {

    console.log("hit api get All Category")
    const categories = await productService.getAllCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ======================== Get All Brands =================
export const getAllBrands = async (req, res) => {
  try {

    console.log("hit api get all brands...")
    const brands = await productService.getAllBrands();

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
};