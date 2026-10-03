# backend2 - E-commerce API

Express + MongoDB (Mongoose) REST API for an e-commerce app: products, cart and orders.
No authentication - everything is public (single shared cart).

## Run

```bash
cd backend2
npm install
cp .env.example .env   # adjust MONGO_URI / PORT if needed
npm run seed           # loads 16 sample products (wipes products/cart/orders)
npm run dev            # http://localhost:8001
```

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/products` | List products (`?search=&category=&sort=price&order=asc&minPrice=&maxPrice=`) |
| GET | `/api/products/categories` | Distinct categories |
| GET | `/api/products/:id` | Product details |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product (also removes it from cart) |
| GET | `/api/cart` | Cart with items, subtotal and total |
| POST | `/api/cart` | Add to cart `{ productId, quantity }` |
| PUT | `/api/cart/:id` | Update item quantity `{ quantity }` |
| DELETE | `/api/cart/:id` | Remove item |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/orders` | Place order `{ name, email, phone, address }` - creates order items and clears cart |
| GET | `/api/orders` | List orders (newest first) |
| GET | `/api/orders/:id` | Order by order id (`ORD-XXXXXXXX`) or Mongo id, with items |

## Response shape

Every response is `{ success, message, ...payload }`. Errors return
`400` validation / `404` not found / `409` conflict / `500` internal server error.

## Tables (MongoDB collections)

`products`, `cart`, `orders`, `order_items`
