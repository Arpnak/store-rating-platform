# ⭐ RateMyStore — FullStack Store Rating Platform

A full-stack web application that enables users to discover and rate stores on a 1–5 star scale. Built with **Express.js**, **PostgreSQL**, and **React**.

---

## 📐 Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Frontend | React 18, React Router v6 |
| Backend  | Express.js           |
| Database | PostgreSQL           |
| Auth     | JWT (jsonwebtoken)   |
| Styling  | Vanilla CSS (dark theme, glassmorphism) |

---

## 👥 User Roles

| Role             | Capabilities |
|------------------|--------------|
| **Admin**        | Dashboard stats, add/view users & stores, filter, view user details |
| **Normal User**  | Register, browse & search stores, submit or update ratings, manage profile |
| **Store Owner**  | View own store with average rating and review count |

---

## 🗂 Project Structure

```
store-rating-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # DB pool, config, setup script
│   │   ├── controllers/     # authController, adminController, storeController, ratingController
│   │   ├── middleware/      # authMiddleware, validationMiddleware
│   │   ├── routes/          # authRoutes, adminRoutes, storeRoutes, ratingRoutes
│   │   ├── app.js           # Express app (cors, helmet, rate-limiting, routes)
│   │   └── server.js        # Entry point with DB health check
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios client + service layer
    │   ├── components/      # Reusable UI (StarRating, Navbar, Sidebar, ProtectedRoute)
    │   ├── contexts/        # AuthContext (session management)
    │   ├── pages/
    │   │   ├── admin/       # Dashboard, UserList, UserDetail, AddUser, AddStore, StoreList
    │   │   ├── user/        # HomePage (store grid + rating modal), ProfilePage
    │   │   └── store/       # StoreOwnerDashboard
    │   ├── styles/          # global.css (design system)
    │   └── App.jsx          # Router with lazy loading + ProtectedRoute
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14

### 1. Clone the repo

```bash
git clone https://github.com/Arpnak/store-rating-platform.git
cd store-rating-platform
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and a strong JWT_SECRET
npm run db:setup      # Creates tables + seeds admin account
npm run dev           # Starts on http://localhost:5000
```

**Default admin credentials** (created by setup script):
```
Email:    admin@platform.com
Password: Admin@1234
```
> ⚠️ Change the admin password after first login in production.

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit REACT_APP_API_URL if backend is on a different host/port
npm start             # Opens http://localhost:3000
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint                   | Access      |
|--------|----------------------------|-------------|
| POST   | `/api/auth/login`          | Public      |
| POST   | `/api/auth/register`       | Public      |
| GET    | `/api/auth/me`             | Authenticated |
| PATCH  | `/api/auth/change-password`| Authenticated |

### Admin
| Method | Endpoint                   | Access |
|--------|----------------------------|--------|
| GET    | `/api/admin/dashboard`     | Admin  |
| GET    | `/api/admin/users`         | Admin  |
| GET    | `/api/admin/users/:id`     | Admin  |
| POST   | `/api/admin/users`         | Admin  |
| POST   | `/api/admin/stores`        | Admin  |

### Stores
| Method | Endpoint                   | Access           |
|--------|----------------------------|------------------|
| GET    | `/api/stores`              | All authenticated|
| GET    | `/api/stores/my-store`     | Store Owner      |

### Ratings
| Method | Endpoint                   | Access      |
|--------|----------------------------|-------------|
| POST   | `/api/ratings`             | Normal User |
| PATCH  | `/api/ratings/:storeId`    | Normal User |

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (12 rounds)
- Route protection via **JWT middleware**
- Role-based access control on every route
- **Helmet.js** security headers
- **Rate limiting** on auth (20 req/15 min) and general (200 req/15 min)
- Input validation with **express-validator**

---

## 📋 Password Policy

All passwords must:
- Be at least **8 characters**
- Contain at least one **uppercase letter**
- Contain at least one **special character**

---

## 📄 License

MIT
