

Testing Scenarios
1. Create Product - Valid
```text
POST {{baseUrl}}/
Content-Type: application/json

{
  "name": "Test Product",
  "slug": "test-product-123",
  "description": "Test description",
  "category": "T-Shirts",
  "subCategory": "Casual",
  "brand": "Test Brand",
  "gender": "Men",
  "price": 29.99,
  "coverImage": "https://example.com/test.jpg",
  "sizes": [
    {"size": "M", "stock": 10}
  ]
}
2. Create Product - Invalid (Missing Required Field)
```
```text
POST {{baseUrl}}/
Content-Type: application/json

{
  "name": "Test Product",
  "slug": "test-product-123"
}
3. Create Product - Duplicate Slug
```
```text
POST {{baseUrl}}/
Content-Type: application/json

{
  "name": "Test Product 2",
  "slug": "test-product-123", // Already exists
  "description": "Test description",
  "category": "T-Shirts",
  "subCategory": "Casual",
  "brand": "Test Brand",
  "price": 29.99,
  "coverImage": "https://example.com/test.jpg"
}
4. Get All Products
```
```text
GET {{baseUrl}}/?page=1&limit=10&sort=-createdAt
5. Get Product By ID - Valid
```
```text
GET {{baseUrl}}/{{productId}}
6. Get Product By ID - Invalid
```
```text
GET {{baseUrl}}/invalid-id
7. Update Product - Valid
```
```text
PUT {{baseUrl}}/{{productId}}
Content-Type: application/json

{
  "price": 39.99,
  "discount": 20,
  "isFeatured": true
}
8. Update Product - Invalid Discount
```
```text
PUT {{baseUrl}}/{{productId}}
Content-Type: application/json

{
  "discount": 150
}
9. Delete Product
```
```text
DELETE {{baseUrl}}/{{productId}}
10. Get Products By Category
```
```text
GET {{baseUrl}}/category/T-Shirts?page=1&limit=10
11. Filter Products - Complex Query
```
```text
GET {{baseUrl}}/filter/all?category=T-Shirts&brand=Nike&minPrice=20&maxPrice=50&size=M&minRating=4&sortBy=price_asc
12. Search Products
```
```text
GET {{baseUrl}}/search/query?q=cotton&category=T-Shirts&page=1&limit=10
13. Get Related Products
```
```text
GET {{baseUrl}}/related/{{productId}}?limit=4
```

Quick Reference
Method	Endpoint	Description
POST	/	Create product
GET	/	Get all products
GET	/:id	Get product by ID
PUT	/:id	Update product
DELETE	/:id	Delete product
GET	/category/:category	Get products by category
GET	/filter/all	Get filtered products
GET	/related/:id	Get related products
GET	/search/query	Search products
Notes
Product ID: MongoDB ObjectId (_id) is automatically generated

Product Code: product_id is auto-generated if not provided

Slug: Must be unique and lowercase

Price: Cannot be negative

Discount: Must be between 0 and 100

Sizes: Only S, M, L, XL, XXL, XXXL are allowed

Gender: Only Men, Women, Boys, Girls, Unisex

Pagination: Default page=1, limit=10

Soft Delete: Products are marked as isActive: false, not permanently deleted

Sorting: Use - prefix for descending order (e.g., -createdAt)

Status Codes
Code	Description
200	Success
201	Created
400	Bad Request / Validation Error
404	Not Found
409	Conflict (Duplicate)
500	Internal Server Error