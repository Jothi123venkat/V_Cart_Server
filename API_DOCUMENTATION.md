# API Documentation

## Authentication
Base URL: `/api/auth`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| POST | `/signup` | Register new user | No | Body: `name`, `email`, `password` |
| POST | `/login` | Authenticate user & get token | No | Body: `email`, `password` |

## Products
Base URL: `/api/products`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all products | No | Query: `keyword` (optional) |
| GET | `/:id` | Get single product | No | URL Param: `id` |
| POST | `/` | Add product | No* | Body: Product fields |
| PUT | `/:id` | Update product | No* | URL Param: `id`, Body: Product fields |
| DELETE | `/:id` | Delete product | No* | URL Param: `id` |

*> [!WARNING]
> No authentication middleware detected on Product modification routes. These should likely be protected.

## Categories
Base URL: `/api/categories`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all categories | No | - |
| POST | `/` | Create category | No* | Body: `name`, `description` |
| PUT | `/:id` | Update category | No* | URL Param: `id`, Body: fields to update |
| DELETE | `/:id` | Delete category | No* | URL Param: `id` |

*> [!WARNING]
> No authentication middleware detected on Category modification routes.

## Cart
Base URL: `/api/cart`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get user's cart | Yes | - |
| POST | `/add` | Add item to cart | Yes | Body: `productId`, `quantity` |
| PUT | `/update` | Update item quantity | Yes | Body: `productId`, `quantity` |
| DELETE | `/:productId` | Remove item from cart | Yes | URL Param: `productId` |
| DELETE | `/` | Clear entire cart | Yes | - |

## Orders
Base URL: `/api/orders`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| POST | `/` | Create a new order | Yes | Body: `items`, `total`, `shippingInfo` |
| GET | `/myorders` | Get logged in user's orders | Yes | - |
| GET | `/user/:userId` | Get orders for a specific user | Yes (Admin) | URL Param: `userId` |
| GET | `/all` | Get all orders with filtering | Yes (Admin) | Query: `status`, `search`, `dateFrom`, `dateTo` |
| PUT | `/:id/status` | Update order status | Yes (Admin) | URL Param: `id`, Body: `status` |
| DELETE | `/:id` | Cancel order | Yes | URL Param: `id` |

## Coupons
Base URL: `/api/coupons`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all coupons | Yes | - |
| POST | `/` | Create coupon | Yes | Body: `code`, `discount`, `type`, `expiryDate`, `minPurchase`, `usageLimit` |
| POST | `/validate` | Validate coupon code | No | Body: `code`, `subtotal` |
| PUT | `/:id` | Update coupon | Yes | URL Param: `id`, Body: fields to update |
| DELETE | `/:id` | Delete coupon | Yes | URL Param: `id` |

## Support Tickets
Base URL: `/api/tickets`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| POST | `/` | Create a support ticket | Yes | Body: `orderId` (opt), `subject`, `category`, `message` |
| GET | `/my` | Get current user tickets | Yes | - |
| GET | `/admin` | Get all tickets | Yes (Admin) | - |
| PUT | `/:id/respond` | Admin response to ticket | Yes | URL Param: `id`, Body: `adminResponse`, `status`, `priority` |

## Notifications
Base URL: `/api/notifications`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get user notifications | Yes | - |
| PUT | `/:id/read` | Mark notification as read | Yes | URL Param: `id` |
| PUT | `/read-all` | Mark all notifications as read | Yes | - |

## Wishlist
Base URL: `/api/wishlist`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Fetch user's wishlist | Yes | - |
| POST | `/:productId` | Toggle product (add/remove) | Yes | URL Param: `productId` |
| DELETE | `/:productId` | Remove product | Yes | URL Param: `productId` |

## User Profile & Addresses
Base URL: `/api/profile`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get current user's profile | Yes | - |
| PUT | `/` | Update user profile | Yes | Body: `name`, `phone` |
| GET | `/addresses` | Get user addresses | Yes | - |
| POST | `/addresses` | Add new address | Yes | Body: `label`, `street`, `city`, `state`, `zip`, `country`, `isDefault` |
| PUT | `/addresses/:id` | Update address | Yes | URL Param: `id`, Body: address fields |
| PUT | `/addresses/:id/default`| Set address as default | Yes | URL Param: `id` |
| DELETE |`/addresses/:id` | Delete address | Yes | URL Param: `id` |

## User Management (Admin)
Base URL: `/api/admin/users`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get all users | Yes | - |
| POST | `/` | Create User | Yes | Body: `name`, `email`, `password`, `role` |
| GET | `/:id` | Get single user | Yes | URL Param: `id` |
| PUT | `/:id` | Update User | Yes | URL Param: `id`, Body: `name`, `email`, `role`, `status` |
| PUT | `/:id/status` | Update user status | Yes | URL Param: `id`, Body: `status` |
| DELETE | `/:id` | Delete User | Yes | URL Param: `id` |

## Site Configuration
Base URL: `/api/config`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/` | Get site configuration | No | - |
| PUT | `/` | Update site configuration | Yes | Body: `brandName`, `logoUrl`, `heroTitle`, etc. |

## Database Seeding
Base URL: `/api`

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| GET | `/seed` | Seed database with sample products | No | - |
