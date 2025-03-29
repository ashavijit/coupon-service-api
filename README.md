

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication is required. For production use, consider adding JWT or API key-based authentication.

---

## Endpoints

### 1. Create a Coupon
- **Method**: `POST`
- **Path**: `/coupons`
- **Description**: Creates a new coupon.
- **Request Body**:
  ```json
  {
    "type": "string", // "cart-wise", "product-wise", or "bxgy"
    "details": {
      "threshold": "number",
      "discount": "number",
      "product_id": "number",
      "buy_products": [{"product_id": "number", "quantity": "number"}], 
      "get_products": [{"product_id": "number", "quantity": "number"}],
      "repetition_limit": "number"
    },
    "expiration_date": "string"
  }
  ```
- **Example Request** (BxGy):
  ```json
  {
    "type": "bxgy",
    "details": {
      "buy_products": [{"product_id": 1, "quantity": 3}, {"product_id": 2, "quantity": 3}],
      "get_products": [{"product_id": 3, "quantity": 1}],
      "repetition_limit": 2
    },
    "expiration_date": "2025-12-31T23:59:59Z"
  }
  ```
- **Success Response**:
  - Status: `201 Created`
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "_id": "6605f3a3b2c4e12d3f8b4569",
      "type": "bxgy",
      "details": {
        "buy_products": [{"product_id": 1, "quantity": 3}, {"product_id": 2, "quantity": 3}],
        "get_products": [{"product_id": 3, "quantity": 1}],
        "repetition_limit": 2
      },
      "expiration_date": "2025-12-31T23:59:59.000Z",
      "created_at": "2025-03-28T12:00:00.000Z"
    }
  }
  ```
- **Error Response** (Validation Failed):
  - Status: `400 Bad Request`
  ```json
  {
    "success": false,
    "statusCode": 400,
    "error": {
      "message": "Validation failed",
      "details": ["Path `type` is required."]
    }
  }
  ```

---

### 2. Get All Coupons
- **Method**: `GET`
- **Path**: `/coupons`
- **Description**: Retrieves all coupons.
- **Request Body**: None
- **Success Response**:
  - Status: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "_id": "6605f3a1b2c4e12d3f8b4567",
        "type": "cart-wise",
        "details": { "threshold": 100, "discount": 10 }
      }
    ]
  }
  ```

---

### 3. Get Coupon by ID
- **Method**: `GET`
- **Path**: `/coupons/{id}`
- **Description**: Retrieves a specific coupon by ID.
- **URL Parameter**: `id` (e.g., `6605f3a1b2c4e12d3f8b4567`)
- **Success Response**:
  - Status: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "_id": "6605f3a1b2c4e12d3f8b4567",
      "type": "cart-wise",
      "details": { "threshold": 100, "discount": 10 }
    }
  }
  ```
- **Error Response** (Not Found):
  - Status: `404 Not Found`
  ```json
  {
    "success": false,
    "statusCode": 404,
    "error": {
      "message": "Coupon not found"
    }
  }
  ```

---

### 4. Update Coupon
- **Method**: `PUT`
- **Path**: `/coupons/{id}`
- **Description**: Updates a specific coupon by ID.
- **URL Parameter**: `id`
- **Request Body**: Partial coupon object
  ```json
  {
    "details": {
      "threshold": 150,
      "discount": 15
    }
  }
  ```
- **Success Response**:
  - Status: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "_id": "6605f3a1b2c4e12d3f8b4567",
      "type": "cart-wise",
      "details": { "threshold": 150, "discount": 15 }
    }
  }
  ```
- **Error Response** (Not Found):
  - Status: `404 Not Found`
  ```json
  {
    "success": false,
    "statusCode": 404,
    "error": {
      "message": "Coupon not found"
    }
  }
  ```

---

### 5. Delete Coupon
- **Method**: `DELETE`
- **Path**: `/coupons/{id}`
- **Description**: Deletes a specific coupon by ID.
- **URL Parameter**: `id`
- **Success Response**:
  - Status: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "message": "Coupon deleted",
      "coupon": {
        "_id": "6605f3a1b2c4e12d3f8b4567",
        "type": "cart-wise",
        "details": { "threshold": 100, "discount": 10 }
      }
    }
  }
  ```
- **Error Response** (Not Found):
  - Status: `404 Not Found`
  ```json
  {
    "success": false,
    "statusCode": 404,
    "error": {
      "message": "Coupon not found"
    }
  }
  ```

---

### 6. Get Applicable Coupons
- **Method**: `POST`
- **Path**: `/applicable-coupons`
- **Description**: Fetches all applicable coupons for a cart.
- **Request Body**:
  ```json
  {
    "cart": {
      "items": [
        {"product_id": 1, "quantity": 6, "price": 50},
        {"product_id": 2, "quantity": 3, "price": 30},
        {"product_id": 3, "quantity": 2, "price": 25}
      ]
    }
  }
  ```
- **Success Response**:
  - Status: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "applicable_coupons": [
        {
          "coupon_id": "6605f3a1b2c4e12d3f8b4567",
          "type": "cart-wise",
          "discount": 44
        },
        {
          "coupon_id": "6605f3a3b2c4e12d3f8b4569",
          "type": "bxgy",
          "discount": 50
        }
      ]
    }
  }
  ```
- **Error Response** (Invalid Cart):
  - Status: `400 Bad Request`
  ```json
  {
    "success": false,
    "statusCode": 400,
    "error": {
      "message": "Invalid cart data"
    }
  }
  ```

---

### 7. Apply Coupon
- **Method**: `POST`
- **Path**: `/apply-coupon/{id}`
- **Description**: Applies a specific coupon to a cart.
- **URL Parameter**: `id`
- **Request Body**:
  ```json
  {
    "cart": {
      "items": [
        {"product_id": 1, "quantity": 6, "price": 50},
        {"product_id": 3, "quantity": 2, "price": 25}
      ]
    }
  }
  ```
- **Success Response** (BxGy):
  - Status: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "updated_cart": {
        "items": [
          {"product_id": 1, "quantity": 6, "price": 50, "total_discount": 0},
          {"product_id": 3, "quantity": 2, "price": 25, "total_discount": 50}
        ],
        "total_price": 350,
        "total_discount": 50,
        "final_price": 300
      }
    }
  }
  ```
- **Error Response** (Expired):
  - Status: `400 Bad Request`
  ```json
  {
    "success": false,
    "statusCode": 400,
    "error": {
      "message": "Coupon has expired"
    }
  }
  ```

---

## Error Handling
The API uses a consistent error response format:
```json
{
  "success": false,
  "statusCode": "number",
  "error": {
    "message": "string",
    "details": ["string"] 
  }
}
```

### Common Error Codes
- `400 Bad Request`: Invalid input or conditions not met.
- `404 Not Found`: Coupon not found.
- `500 Internal Server Error`: Unexpected server issues.

