# Fruitkha

Fruitkha is a full-stack e-commerce web application built with Node.js, Express, EJS, and MongoDB. It includes a customer storefront and an admin panel for managing products, categories, orders, offers, coupons, and reports.

## Features

- User authentication
- Google OAuth login
- OTP verification and password reset
- Product listing and product details
- Cart and wishlist management
- Address management
- Checkout and order placement
- Razorpay payment integration
- Wallet and coupon support
- Admin dashboard and reports
- Product, category, stock, order, offer, and coupon management

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- Passport.js
- Razorpay
- Resend
- Multer
- Cloudinary

## Project Structure

```text
.
|-- app.js
|-- assets/
|-- config/
|-- constant/
|-- controller/
|-- middleware/
|-- model/
|-- router/
|-- utils/
|-- views/
|-- images/
`-- help-documentation/
```

## Environment Variables

Create a `.env` file in the project root and add:

```env
PORT=
MONGO_URL=
secret=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
callbackURL=
key_id=
key_secret=
RESEND_API_KEY=
resetLink=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm start
```

## Scripts

- `npm start` - start the application
- `npm run format` - format the codebase with Prettier
- `npm test` - placeholder test script

## Setup

```bash
npm install
```

Create a `.env` file with the required values, then run:

```bash
npm start
```

## Main Routes

- `/` - home page
- `/login` - user login
- `/signUp` - user registration
- `/cart` - shopping cart
- `/checkout` - checkout page
- `/orders` - order history
- `/profile` - user profile
- `/wishlist` - wishlist
- `/wallet` - wallet
- `/admin` - admin dashboard

## Notes

- MongoDB must be running or accessible through `MONGO_URL`
- Razorpay, Google OAuth, Resend, and Cloudinary require valid credentials
- If Cloudinary is not configured, image uploads fall back to the local `images/` folder
