import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getRelatedProducts,
  searchProducts,
  getAllCategory,
  getAllBrands,
  getFilteredProducts,
  getProductsByCategory
} from "./controllers/product.controller.js";
import { isAdmin, verifyToken } from "../userAuth/middlewares/auth.middleware.js";
// import { getFilteredProductsService } from "./services/product.service.js";

const router = express.Router();



/* Public Routes */
router.get("/category/:category", getProductsByCategory);
router.get("/filter/all", getFilteredProducts);
router.get("/getCategories",getAllCategory)
router.get("/getBrands",getAllBrands)
router.get("/related/:id", getRelatedProducts);
router.get("/search/query", searchProducts);


router.get("/", getAllProducts);
router.get("/:id", getProductById);



/* Admin Routes */
router.post("/",verifyToken,isAdmin, createProduct);
router.put("/:id",verifyToken,isAdmin, updateProduct);
router.delete("/:id",verifyToken,isAdmin, deleteProduct);

export default router;