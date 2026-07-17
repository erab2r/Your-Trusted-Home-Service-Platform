# Your Trusted Home Service Platform

Live API: https://your-trusted-home-service-platform.vercel.app

This project is a backend API for a home service booking platform where customers can discover services, book appointments, make payments, and leave reviews. Technicians can manage their profiles, services, and availability, while admins oversee platform operations.

## Features

- User authentication with JWT and refresh tokens
- Customer, technician, and admin role-based access
- Service and category management
- Technician availability and booking flow
- Stripe-based payment checkout and webhook handling
- Review system for completed bookings

## Tech Stack

- Node.js + Express.js
- TypeScript
- Prisma + PostgreSQL
- Stripe
- Zod, JWT, CORS, cookie-parser

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env` file and add the required environment variables:
   ```env
   DATABASE_URL=your_postgres_connection_string
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   APP_URL=http://localhost:5000
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```
3. Run Prisma migrations
   ```bash
   npx prisma migrate dev
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

## Base URLs

- Local: http://localhost:5000/api
- Production: https://your-trusted-home-service-platform.vercel.app/api

## Main API Modules

- Auth: `/api/auth`
- Users: `/api/users`
- Technicians: `/api/technicians`
- Categories: `/api/categories`
- Services: `/api/services`
- Availability: `/api/availabilities`
- Bookings: `/api/bookings`
- Payments: `/api/payments`
- Reviews: `/api/reviews`
- Admin: `/api/admin`

## Project Structure

- `src/modules` — feature-based modules for auth, users, services, bookings, payments, and more
- `prisma/` — Prisma schema and migrations
- `postman/` — Postman collection for API testing
- `scripts/` — Stripe webhook helper

## Testing

A ready-to-import Postman collection is available at:

- [postman/home-service-platform.postman_collection.json](postman/home-service-platform.postman_collection.json)

Use the auth endpoints first to obtain a token, then continue with the rest of the flow.

## Build and Run

```bash
npm run build
npm run start
```

## API Overview

- Authentication uses JWT tokens. Send them in the `Authorization` header as `Bearer <token>`.
- Main modules are grouped under `/api/auth`, `/api/users`, `/api/technicians`, `/api/categories`, `/api/services`, `/api/availabilities`, `/api/bookings`, `/api/payments`, `/api/reviews`, and `/api/admin`.
- For end-to-end testing, import the Postman collection from [postman/home-service-platform.postman_collection.json](postman/home-service-platform.postman_collection.json).
- For Stripe payments, make sure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are configured correctly.


## 8. Quick notes for Postman

- Save the `accessToken` from login as a variable like `{{accessToken}}`.
- Add an `Authorization` header with the value `Bearer {{accessToken}}`.
- Replace placeholder IDs such as `<categoryId>`, `<serviceId>`, `<availabilityId>`, and `<bookingId>` with actual IDs returned by previous requests.
- Some endpoints return `meta` information for pagination.
- Errors are returned through the app's global error handler in a standard response format.

## 9. Import directly into Postman

A ready-to-import collection is available at [postman/home-service-platform.postman_collection.json](postman/home-service-platform.postman_collection.json).

How to use it:
1. Open Postman.
2. Click Import.
3. Select the file [postman/home-service-platform.postman_collection.json](postman/home-service-platform.postman_collection.json).
4. The collection will load with base URLs and variables.
5. Update the `baseUrl` variable if your server runs on a different port.
6. Run the auth requests first so the token variables are populated automatically.
