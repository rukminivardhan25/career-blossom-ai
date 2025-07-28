# CareerNav Sign-In Troubleshooting Guide

## Current Issues Identified

1. **Backend Server Not Running**: The backend server isn't starting due to missing configuration
2. **Missing Environment Files**: Both frontend and backend need proper environment configuration
3. **Database Connection**: PostgreSQL database needs to be set up and running

## Step-by-Step Fix

### 1. Set Up Backend Environment

Create a file named `.env` in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/careernav_db"

# JWT Configuration
JWT_SECRET=careernav-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# OpenAI Configuration (optional for now)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important**: Replace `your_password` with your actual PostgreSQL password.

### 2. Set Up Frontend Environment

Create a file named `.env` in the root folder with:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

You need PostgreSQL installed and running. Create a database named `careernav_db`:

```sql
CREATE DATABASE careernav_db;
```

### 4. Initialize Database Schema

Run these commands in the backend folder:

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Start Backend Server

```bash
cd backend
npm start
```

### 6. Start Frontend

In a new terminal:

```bash
npm run dev
```

## Quick Test

1. Open your browser to `http://localhost:5173`
2. Try to sign up with a new account
3. Check the browser console (F12) for any error messages
4. Check the backend terminal for any error messages

## Common Error Messages

- **"Unable to connect to the remote server"**: Backend isn't running
- **"Database connection failed"**: PostgreSQL isn't running or credentials are wrong
- **"JWT_SECRET is required"**: Missing .env file in backend
- **"CORS error"**: Frontend URL mismatch in backend .env

## Need Help?

If you're still having issues, please provide:
1. Any error messages from the browser console
2. Any error messages from the backend terminal
3. Whether PostgreSQL is installed and running
4. The contents of your .env files (without sensitive data) 