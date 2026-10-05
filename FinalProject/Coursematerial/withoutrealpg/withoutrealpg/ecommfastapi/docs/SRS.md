# Software Requirements Specification (SRS)

**Project:** FastAPI E-Commerce Backend

---

## 1. Introduction

### 1.1 Purpose

This document details the requirements for a backend RESTful API for an e-commerce platform, supporting user management, product catalog, cart, order, payment, and shipping functionalities.

### 1.2 Scope

The backend provides APIs for:

- User registration, authentication, and profile management
- Product and category management
- Shopping cart operations
- Order placement and management
- Payment processing (simulated)
- Shipping address and status management

### 1.3 Definitions, Acronyms, and Abbreviations

- **API:** Application Programming Interface
- **JWT:** JSON Web Token
- **CRUD:** Create, Read, Update, Delete

---

## 2. Overall Description

### 2.1 Product Perspective

This backend is a standalone RESTful API, intended to be consumed by a frontend (web/mobile). It uses FastAPI, SQLAlchemy (async), MySQL, and Alembic for migrations.

### 2.2 Product Functions

- **User Account:** Registration, login, JWT-based authentication, password reset, email verification, admin roles.
- **Product Catalog:** CRUD for products and categories, image upload, search, and filtering.
- **Cart:** Add, update, remove items; view cart summary.
- **Order:** Checkout, view orders, cancel orders.
- **Payment:** Simulated payment processing, payment status tracking.
- **Shipping:** Manage addresses, track shipping status.

### 2.3 User Classes and Characteristics

- **Customer:** Can register, login, manage cart, place orders, manage addresses, view payments and shipping.
- **Admin:** All customer privileges plus product/category CRUD, shipping status updates.

### 2.4 Operating Environment

- **Backend:** Python 3.x, FastAPI, SQLAlchemy ORM, MySQL, Alembic
- **Frontend:** Any (not included) Later in ReactJS or NextJS
- **OS:** Windows (as per setup), Linux compatible

### 2.5 Design and Implementation Constraints

- Async SQLAlchemy and aiomysql
- JWT for authentication
- Passwords hashed with bcrypt
- Environment variables via python-decouple

---

## 3. System Features and Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Management

- Register with email, name, password
- Login with email and password
- JWT-based authentication (access/refresh tokens via cookies)
- Email verification and password reset via tokenized links
- Admin role support

#### 3.1.2 Product & Category Management

- List/search products with pagination and filtering
- CRUD for products (admin only)
- Image upload for products
- CRUD for categories (admin only)

#### 3.1.3 Cart Management

- Add product to cart (with quantity)
- Increase/decrease quantity
- Remove item from cart
- View cart summary (total price, quantity)

#### 3.1.4 Order Management

- Checkout cart to create order (with payment and shipping address)
- View user orders and order details
- Cancel order (if not shipped)

#### 3.1.5 Payment Processing

- Simulated payment gateway (success/failure)
- Track payment status per order
- View payment history

#### 3.1.6 Shipping Management

- Add/update/delete shipping addresses
- View shipping addresses
- Track shipping status per order
- Admin can update shipping status

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

- API responses within 1 second for standard operations

#### 3.2.2 Security

- JWT authentication, secure cookies
- Passwords hashed with bcrypt
- Admin-only endpoints protected

#### 3.2.3 Usability

- OpenAPI/Swagger documentation auto-generated
- Consistent RESTful API design

#### 3.2.4 Maintainability

- Modular codebase: account, product, cart, order, payment, shipping, db, core
- Alembic for migrations

#### 3.2.5 Scalability

- Async database operations for high concurrency

---

## 4. External Interface Requirements

### 4.1 API Endpoints

#### Account

- `POST /api/account/register` – Register user
- `POST /api/account/login` – Login
- `POST /api/account/refresh` – Refresh token
- `GET /api/account/me` – Get current user
- `POST /api/account/verify-request` – Send verification email
- `GET /api/account/verify` – Verify email
- `POST /api/account/change-password` – Change password
- `POST /api/account/forgot-password` – Request password reset
- `POST /api/account/reset-password` – Reset password
- `POST /api/account/logout` – Logout

#### Products & Categories

- `GET /api/products` – List products
- `GET /api/products/search` – Search products
- `GET /api/products/{slug}` – Get product details
- `POST /api/products` – Create product (admin)
- `PATCH /api/products/{product_id}` – Update product (admin)
- `DELETE /api/products/{product_id}` – Delete product (admin)
- `GET /api/products/category/` – List categories
- `POST /api/products/category/` – Create category (admin)
- `DELETE /api/products/category/{category_id}` – Delete category (admin)

#### Cart

- `GET /api/carts` – View cart
- `POST /api/carts/add` – Add item
- `PATCH /api/carts/increase/{product_id}` – Increase quantity
- `PATCH /api/carts/decrease/{product_id}` – Decrease quantity
- `DELETE /api/carts/delete/{item_id}` – Remove item

#### Orders

- `GET /api/orders/` – List user orders
- `GET /api/orders/{order_id}` – Get order details
- `PATCH /api/orders/cancel/{order_id}` – Cancel order
- `POST /api/orders/checkout` – Checkout cart

#### Payments

- `GET /api/payments/{payment_id}` – Get payment status
- `GET /api/payments` – List user payments

#### Shipping

- `POST /api/shippings/addresses` – Add address
- `GET /api/shippings/addresses` – List addresses
- `GET /api/shippings/addresses/{address_id}` – Get address
- `PUT /api/shippings/addresses/{address_id}` – Update address
- `DELETE /api/shippings/addresses/{address_id}` – Delete address
- `GET /api/shippings/status/{order_id}` – Get shipping status
- `PUT /api/shippings/status/{order_id}` – Update shipping status (admin)

### 4.2 Database

- MySQL, async SQLAlchemy ORM models for all entities

### 4.3 Other Interfaces

- Static file serving for product images (`/media`)

---

## 5. Data Model Overview

### 5.1 Main Entities

- **User:** id, email, hashed_password, name, is_active, is_admin, is_verified, created_at, updated_at
- **Product:** id, title, description, slug, price, stock_quantity, image_url, created_at, updated_at, categories
- **Category:** id, name
- **CartItem:** id, user_id, product_id, quantity, price
- **Order:** id, user_id, total_price, status, created_at, shipping_address_id, items, payment, shipping_status
- **OrderItem:** id, order_id, product_id, quantity, price
- **Payment:** id, order_id, user_id, amount, status, payment_gateway, is_paid, created_at
- **ShippingAddress:** id, user_id, address_line1, address_line2, city, state, postal_code, country
- **ShippingStatus:** id, order_id, status, updated_at

---

## 6. Security Requirements

- All sensitive endpoints require authentication (JWT via cookies)
- Admin-only endpoints require admin privileges
- Passwords are hashed and never stored in plaintext
- CSRF protection via secure cookies and CORS settings

---

## 7. Quality Attributes

- **Reliability:** Database transactions for critical operations (checkout, payment)
- **Availability:** Async operations for high concurrency
- **Maintainability:** Modular code, clear separation of concerns
- **Portability:** Runs on any OS with Python 3.x and MySQL

---

## 8. OpenAPI Documentation

- All endpoints are documented and browsable via `/docs` (Swagger UI)

---

## 9. Future Enhancements (Optional)

- Real payment gateway integration
- Product reviews and ratings
- Inventory management
- Email/SMS notifications

---
