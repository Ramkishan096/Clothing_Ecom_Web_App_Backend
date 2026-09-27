# Product API Documentation

## Base URL

```text
http://localhost:5000/api/v1/product
## API Endpoints

1. Create Product
```
Endpoint: POST /
Description: Create a new product

Request Body:

```json
{
  "name": "Classic Cotton T-Shirt",
  "slug": "classic-cotton-tshirt",
  "description": "Premium quality cotton t-shirt with comfortable fit",
  "category": "T-Shirts",
  "subCategory": "Casual",
  "brand": "Nike",
  "gender": "Men",
  "price": 29.99,
  "discount": 10,
  "coverImage": "https://example.com/images/tshirt.jpg",
  "images": [
    "https://example.com/images/tshirt1.jpg",
    "https://example.com/images/tshirt2.jpg"
  ],
  "sizes": [
    { "size": "S", "stock": 10 },
    { "size": "M", "stock": 20 },
    { "size": "L", "stock": 15 }
  ],
  "material": "100% Cotton",
  "fit": "Regular",
  "tags": ["summer", "casual", "cotton"],
  "isNewArrival": true,
  "isPopular": false,
  "isFeatured": true
}
```
Response (Success - 201):

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "6678f1a2b3c4d5e6f7g8h9i0",
    "product_id": "PRD-ABCD1234-EFGH",
    "name": "Classic Cotton T-Shirt",
    "slug": "classic-cotton-tshirt",
    "description": "Premium quality cotton t-shirt with comfortable fit",
    "category": "T-Shirts",
    "subCategory": "Casual",
    "brand": "Nike",
    "gender": "Men",
    "price": 29.99,
    "discount": 10,
    "finalPrice": 26.99,
    "coverImage": "https://example.com/images/tshirt.jpg",
    "images": ["https://example.com/images/tshirt1.jpg", "https://example.com/images/tshirt2.jpg"],
    "sizes": [
      { "size": "S", "stock": 10 },
      { "size": "M", "stock": 20 },
      { "size": "L", "stock": 15 }
    ],
    "material": "100% Cotton",
    "fit": "Regular",
    "stockQuantity": 45,
    "inStock": true,
    "rating": 0,
    "totalReviews": 0,
    "isNewArrival": true,
    "isPopular": false,
    "isFeatured": true,
    "isActive": true,
    "tags": ["summer", "casual", "cotton"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "__v": 0
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Missing required fields: name, category",
  "data":null,
  "error":"Missing Fields..."
}
```
Response (Error - 409): 
```json
{
  "success": false,
  "message": "Slug already exists",
  "data": null,
  "error": "Slug already exists"
}
```

2. Get All Products
```
Endpoint: GET /
Description: Get all products with pagination

Query Parameters:

page (optional, default: 1) - Page number

limit (optional, default: 10) - Items per page (max: 100)

sort (optional, default: -createdAt) - Sort field (createdAt, price, finalPrice, rating, name)

Response (Success - 200):

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "_id": "6678f1a2b3c4d5e6f7g8h9i0",
      "product_id": "PRD-ABCD1234-EFGH",
      "name": "Classic Cotton T-Shirt",
      "slug": "classic-cotton-tshirt",
      "description": "Premium quality cotton t-shirt with comfortable fit",
      "category": "T-Shirts",
      "subCategory": "Casual",
      "brand": "Nike",
      "gender": "Men",
      "price": 29.99,
      "discount": 10,
      "finalPrice": 26.99,
      "coverImage": "https://example.com/images/tshirt.jpg",
      "images": ["https://example.com/images/tshirt1.jpg"],
      "sizes": [{ "size": "M", "stock": 20 }],
      "material": "100% Cotton",
      "fit": "Regular",
      "stockQuantity": 45,
      "inStock": true,
      "rating": 4.5,
      "totalReviews": 120,
      "isNew": true,
      "isPopular": false,
      "isFeatured": true,
      "isActive": true,
      "tags": ["summer", "casual"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "hasMore": true
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Invalid sort field. Allowed: createdAt, price, finalPrice, rating, name"
}
3. Get Product By ID
```
Endpoint: GET /:id
Description: Get single product by MongoDB ID

URL Parameters:

id - MongoDB ObjectId

Response (Success - 200):

```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "_id": "6678f1a2b3c4d5e6f7g8h9i0",
    "product_id": "PRD-ABCD1234-EFGH",
    "name": "Classic Cotton T-Shirt",
    "slug": "classic-cotton-tshirt",
    "description": "Premium quality cotton t-shirt with comfortable fit",
    "category": "T-Shirts",
    "subCategory": "Casual",
    "brand": "Nike",
    "gender": "Men",
    "price": 29.99,
    "discount": 10,
    "finalPrice": 26.99,
    "coverImage": "https://example.com/images/tshirt.jpg",
    "images": ["https://example.com/images/tshirt1.jpg", "https://example.com/images/tshirt2.jpg"],
    "sizes": [
      { "size": "S", "stock": 10 },
      { "size": "M", "stock": 20 },
      { "size": "L", "stock": 15 }
    ],
    "material": "100% Cotton",
    "fit": "Regular",
    "stockQuantity": 45,
    "inStock": true,
    "rating": 4.5,
    "totalReviews": 120,
    "isNew": true,
    "isPopular": false,
    "isFeatured": true,
    "isActive": true,
    "tags": ["summer", "casual", "cotton"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Invalid product ID format"
}
```
Response (Error - 404):

```json
{
  "success": false,
  "message": "Product not found"
}
4. Update Product
```
Endpoint: PUT /:id
Description: Update existing product

URL Parameters:

id - MongoDB ObjectId

Request Body: (All fields optional)

```json
{
  "name": "Premium Cotton T-Shirt",
  "price": 34.99,
  "discount": 15,
  "description": "Updated description",
  "sizes": [
    { "size": "S", "stock": 15 },
    { "size": "M", "stock": 25 },
    { "size": "L", "stock": 20 }
  ],
  "isNewArrival": false,
  "isFeatured": true,
  "tags": ["premium", "summer", "new"]
}
```
Response (Success - 200):

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "6678f1a2b3c4d5e6f7g8h9i0",
    "product_id": "PRD-ABCD1234-EFGH",
    "name": "Premium Cotton T-Shirt",
    "slug": "classic-cotton-tshirt",
    "price": 34.99,
    "discount": 15,
    "finalPrice": 29.74,
    "sizes": [
      { "size": "S", "stock": 15 },
      { "size": "M", "stock": 25 },
      { "size": "L", "stock": 20 }
    ],
    "stockQuantity": 60,
    "inStock": true,
    "isNew": false,
    "isFeatured": true,
    "tags": ["premium", "summer", "new"],
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Discount must be between 0 and 100"
}
```
Response (Error - 404):

```json
{
  "success": false,
  "message": "Product not found"
}
5. Delete Product
```
Endpoint: DELETE /:id
Description: Soft delete product (set isActive to false)

URL Parameters:

id - MongoDB ObjectId

Response (Success - 200):

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "_id": "6678f1a2b3c4d5e6f7g8h9i0",
    "name": "Classic Cotton T-Shirt",
    "isActive": false,
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Invalid product ID format"
}
```
Response (Error - 404):

```json
{
  "success": false,
  "message": "Product not found"
}
6. Get Products By Category
```
Endpoint: GET /category/:category
Description: Get all products in a specific category

URL Parameters:

category - Category name (case-insensitive)

Query Parameters:

page (optional, default: 1) - Page number

limit (optional, default: 10) - Items per page (max: 50)

Response (Success - 200):

```json
{
  "success": true,
  "message": "Products in category: T-Shirts",
  "data": [
    {
      "_id": "6678f1a2b3c4d5e6f7g8h9i0",
      "name": "Classic Cotton T-Shirt",
      "category": "T-Shirts",
      "brand": "Nike",
      "price": 29.99,
      "finalPrice": 26.99,
      "coverImage": "https://example.com/images/tshirt.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasMore": true
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Category is required"
}
```
Response (Error - 404):

```json
{
  "success": false,
  "message": "No products found in category: T-Shirts"
}
7. Get Filtered Products
```
Endpoint: GET /filter/all
Description: Get products with advanced filtering

Query Parameters:

Parameter	Type	Description	Example
category	string	Filter by category	category=T-Shirts
subCategory	string	Filter by subcategory	subCategory=Casual
brand	string	Filter by brand	brand=Nike
gender	string	Filter by gender	gender=Men
minPrice	number	Minimum price	minPrice=20
maxPrice	number	Maximum price	maxPrice=50
minRating	number	Minimum rating (0-5)	minRating=4
size	string	Filter by size	size=M
inStock	boolean	In stock only	inStock=true
isNew	boolean	New arrivals	isNew=true
isPopular	boolean	Popular products	isPopular=true
isFeatured	boolean	Featured products	isFeatured=true
search	string	Search in name/description	search=cotton
sortBy	string	Sort field (price_asc, price_desc, rating, newest, popular)	sortBy=price_asc
page	number	Page number	page=1
limit	number	Items per page (max: 50)	limit=20
Request Example:

```text
GET /filter/all?category=T-Shirts&brand=Nike&minPrice=20&maxPrice=50&size=M&sortBy=price_asc&page=1&limit=10
```
Response (Success - 200):

```json
{
  "success": true,
  "message": "Filtered products fetched successfully",
  "data": [
    {
      "_id": "6678f1a2b3c4d5e6f7g8h9i0",
      "name": "Classic Cotton T-Shirt",
      "category": "T-Shirts",
      "brand": "Nike",
      "price": 29.99,
      "finalPrice": 26.99,
      "sizes": [{ "size": "M", "stock": 20 }],
      "inStock": true,
      "rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2,
    "hasMore": true
  },
  "filters": {
    "applied": {
      "category": "T-Shirts",
      "brand": "Nike",
      "minPrice": "20",
      "maxPrice": "50",
      "size": "M",
      "sortBy": "price_asc",
      "page": "1",
      "limit": "10"
    },
    "totalResults": 15
  }
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "minPrice cannot be greater than maxPrice"
}
8. Get Related Products
```
Endpoint: GET /related/:id
Description: Get related products based on category, subCategory, brand, and gender

URL Parameters:

id - MongoDB ObjectId

Query Parameters:

limit (optional, default: 4, max: 10) - Number of related products

Response (Success - 200):

```json
{
  "success": true,
  "message": "Related products fetched successfully",
  "data": [
    {
      "_id": "6678f1a2b3c4d5e6f7g8h9i1",
      "name": "Premium Cotton T-Shirt",
      "category": "T-Shirts",
      "brand": "Nike",
      "price": 34.99,
      "finalPrice": 29.74,
      "coverImage": "https://example.com/images/premium-tshirt.jpg",
      "rating": 4.8,
      "totalReviews": 85
    },
    {
      "_id": "6678f1a2b3c4d5e6f7g8h9i2",
      "name": "Sports T-Shirt",
      "category": "T-Shirts",
      "brand": "Adidas",
      "price": 39.99,
      "finalPrice": 35.99,
      "coverImage": "https://example.com/images/sports-tshirt.jpg",
      "rating": 4.3,
      "totalReviews": 67
    }
  ],
  "count": 4
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Invalid product ID format"
}
```
Response (Error - 404):

```json
{
  "success": false,
  "message": "Product not found"
}
9. Search Products
```
Endpoint: GET /search/query
Description: Search products by name, description, brand, category, or tags

Query Parameters:

q (required) - Search query (minimum 2 characters)

category (optional) - Filter by category

brand (optional) - Filter by brand

gender (optional) - Filter by gender

minPrice (optional) - Minimum price

maxPrice (optional) - Maximum price

page (optional, default: 1) - Page number

limit (optional, default: 20, max: 50) - Items per page

Request Example:

```text
GET /search/query?q=cotton&category=T-Shirts&brand=Nike&page=1&limit=10
```
Response (Success - 200):

```json
{
  "success": true,
  "message": "Search results fetched successfully",
  "data": [
    {
      "_id": "6678f1a2b3c4d5e6f7g8h9i0",
      "name": "Classic Cotton T-Shirt",
      "description": "Premium quality cotton t-shirt",
      "category": "T-Shirts",
      "brand": "Nike",
      "price": 29.99,
      "finalPrice": 26.99,
      "coverImage": "https://example.com/images/tshirt.jpg",
      "rating": 4.5,
      "totalReviews": 120
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1,
    "hasMore": false
  },
  "searchTerm": "cotton",
  "totalResults": 8
}
```
Response (Error - 400):

```json
{
  "success": false,
  "message": "Search query (q) is required"
}
or

```
```json
{
  "success": false,
  "message": "Search term must be at least 2 characters"
}
Error Response Formats
400 - Bad Request
```
```json
{
  "success": false,
  "message": "Specific error message"
}
404 - Not Found
```
```json
{
  "success": false,
  "message": "Product not found"
}
409 - Conflict (Duplicate)
```
```json
{
  "success": false,
  "message": "Slug already exists"
}
500 - Internal Server Error
```
```json
{
  "success": false,
  "message": "Internal server error"
}
```
Postman Collection
Environment Variables
```json
{
  "baseUrl": "http://localhost:5000/api/v1/product"
}
Collection Variables
```
```json
{
  "productId": "6678f1a2b3c4d5e6f7g8h9i0"
}
```








