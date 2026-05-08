# 🏠 RentEase — Smart Rental Management Platform

> A full-stack web application that digitises the entire rental lifecycle — from property discovery and lease management to rent collection, maintenance tracking, and real-time communication.

---

## 📌 About the Project

RentEase is a role-based rental management platform built on the **MERN stack**. It brings together three types of users — **Tenants**, **Landlords**, and **Admins** — each with a dedicated dashboard tailored to their needs.

| Role | What they can do |
|------|-----------------|
| 🧑‍💼 **Tenant** | Browse properties, manage lease, pay rent, raise maintenance tickets, chat with landlord |
| 🏢 **Landlord** | List properties, manage tenants, collect payments, handle maintenance, view portfolio analytics |
| ⚙️ **Admin** | Approve/reject listings, audit payments, monitor platform-wide stats, manage users |

---

## 🚀 Features

- **Smart Match Algorithm** — Scores every property against a tenant's preferences (budget, location, bedrooms, amenities, furnished) and ranks listings by compatibility percentage
- **Role-Based Dashboards** — Three fully separate dashboards with role-specific routes and protected navigation
- **Real-Time Messaging** — Socket.io powered live chat between tenants and landlords
- **Interactive Maps** — Property locations rendered on OpenStreetMap via Leaflet.js
- **Analytics & Charts** — Revenue trends, occupancy rates, and payment history visualised with Recharts
- **Property Approval Workflow** — All landlord listings require admin approval before going live
- **Automated Background Jobs** — node-cron handles monthly payment generation, daily overdue detection, and rent reminders automatically
- **Cloud Image Hosting** — Property photos uploaded and served via Cloudinary CDN
- **CSV Export** — Landlords can export full payment history as a downloadable spreadsheet
- **JWT Authentication** — Stateless auth with access tokens (15 min) + refresh tokens (7 days)
- **Stripe Integration** — Online rent payment processing

---

## 🛠️ Tech Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool & dev server |
| React Router | v6 | Client-side routing |
| Tailwind CSS | 3.4 | Styling |
| Recharts | 2.13 | Charts & analytics |
| React-Leaflet | 4.2 | Interactive maps |
| Axios | 1.7 | HTTP client |
| Socket.io-client | 4.8 | Real-time messaging |
| Lucide React | 0.46 | Icons |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Node.js | — | Runtime |
| Express | 4.21 | Web framework |
| Mongoose | 8.8 | MongoDB ODM |
| JWT (jsonwebtoken) | 9.0 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Socket.io | 4.8 | Real-time communication |
| node-cron | 3.0 | Scheduled background jobs |
| Cloudinary | 2.5 | Image hosting |
| Multer | 1.4 | File upload handling |
| Stripe | 17.3 | Payment processing |
| Nodemailer | 6.9 | Email notifications |
| express-validator | 7.2 | Input validation |

### Database
- **MongoDB** — NoSQL document database
- **Collections:** `users` · `properties` · `leases` · `payments` · `maintenancerequests` · `messages` · `notifications` · `reviews` · `platformsettings`

---

## 📁 Project Structure

```
RentEase/
├── client/                        # React Frontend
│   ├── public/
│   └── src/
│       ├── api/
│       │   └── axios.js           # Axios instance with JWT interceptor
│       ├── components/
│       │   └── layout/
│       │       ├── DashboardHeader.jsx
│       │       ├── DashboardSidebar.jsx
│       │       └── MapPreview.jsx
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state
│       ├── layouts/
│       │   └── DashboardShell.jsx # Shared dashboard layout
│       ├── nav/
│       │   └── dashboardNav.jsx   # Sidebar nav config for all roles
│       ├── pages/
│       │   ├── auth/              # Login, Register
│       │   ├── home/              # Public landing page
│       │   ├── tenant/            # 8 tenant pages
│       │   ├── landlord/          # 12 landlord pages
│       │   └── admin/             # 8 admin pages
│       ├── routes/
│       │   └── ProtectedRoute.jsx # Role-based route guard
│       └── App.jsx
│
└── server/                        # Node.js Backend
    ├── scripts/
    │   ├── seedAdmin.js
    │   └── seedData.js
    └── src/
        ├── config/
        │   ├── cloudinary.js
        │   └── db.js
        ├── jobs/
        │   └── cron.js            # Scheduled tasks
        ├── middleware/
        │   ├── auth.js            # JWT verify + role check
        │   ├── errorHandler.js
        │   └── upload.js          # Multer config
        ├── models/                # 9 Mongoose schemas
        ├── routes/                # 8 Express route files
        ├── services/
        │   ├── email.service.js
        │   └── smartMatch.service.js
        ├── utils/
        │   └── jwt.js
        └── index.js               # Server entry point
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or a MongoDB Atlas connection string
- A Cloudinary account (free tier works)
- A Stripe account (test mode)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/rentease.git
cd rentease
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/rentease

JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_your_stripe_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
# Create the admin account
npm run seed:admin

# Populate demo data (properties, tenants, leases, payments)
npm run seed:data
```

### 4. Start the Backend

```bash
npm run dev       # Development (nodemon)
npm start         # Production
```

Backend runs on **http://localhost:5000**

### 5. Set Up the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the Frontend

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔑 Default Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentease.com | admin123 |
| Landlord | landlord@rentease.com | password123 |
| Tenant | tenant@rentease.com | password123 |

---

## 🗺️ Dashboard Overview

### Tenant Dashboard (8 pages)
`Home` · `Browse Properties` · `My Lease` · `Maintenance` · `Analytics` · `Messages` · `Notifications` · `Profile`

### Landlord Dashboard (12 pages)
`Home` · `My Properties` · `Tenants` · `Maintenance` · `Payments` · `Messages` · `Acknowledgements` · `Notifications` · `Profile` · `Analytics` · `Map View` · `Inventory`

### Admin Dashboard (8 pages)
`Home` · `Users` · `Properties` · `Lease Management` · `Payments` · `Maintenance` · `Analytics` · `Settings`

---

## 🔐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

GET    /api/properties
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id

GET    /api/leases/tenant/mine
GET    /api/leases/landlord/mine
POST   /api/leases

GET    /api/payments/tenant/analytics
GET    /api/payments/landlord/mine
PUT    /api/payments/:id/manual-confirm

GET    /api/maintenance/tenant/mine
GET    /api/maintenance/landlord/mine
POST   /api/maintenance

GET    /api/messages/conversations
POST   /api/messages

GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/properties
PUT    /api/admin/properties/:id/approve
GET    /api/admin/leases
GET    /api/admin/payments
GET    /api/admin/maintenance
GET    /api/admin/reports
```

---

## 🤖 Smart Match Algorithm

The Smart Match feature scores every property out of 100 based on how well it fits the tenant's saved preferences:

| Criterion | Max Points | Logic |
|-----------|-----------|-------|
| Budget | 30 | Full points if within range, half if ≤10% above max |
| Location | 25 | Exact city match against preferred cities list |
| Bedrooms | 15 | Exact match = 15, ±1 = 7 |
| Amenities | 20 | Proportional to overlap count |
| Furnished | 10 | Exact preference match |

Scores are shown as colour-coded badges: 🟢 ≥80% · 🔵 ≥60% · 🟡 ≥40% · ⚫ <40%

---

## ⏰ Automated Cron Jobs

| Schedule | Task |
|----------|------|
| `0 0 1 * *` — 1st of every month | Generate monthly payment records for all active leases |
| `0 8 * * *` — Daily at 8:00 AM | Flag pending payments past due date as overdue |
| `0 9 * * *` — Daily at 9:00 AM | Send rent reminder emails via Nodemailer |


---

<p align="center">Made with ❤️ by Team RentEase · MIT, Anna University</p>
