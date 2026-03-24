# MERN Rental & Property Management System

A full-stack MERN project for landlords and tenants with role-based authentication, property management, rental applications, rent tracking, lease uploads, and notifications.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer
- Frontend: React, Vite, React Router, Axios, Chart.js, React Hot Toast

## Features

- Landlord and tenant registration/login
- Role-protected routes and middleware
- Property CRUD with image uploads
- Application flow with approval and auto-rejection logic
- Rent creation, payment simulation, and payment verification
- Tenant management and tenant removal flow
- Lease PDF uploads and tenant-side document viewing
- Notification center for applications and rent updates

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/rental_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```
