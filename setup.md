# CareerNav Setup Guide

This guide will help you set up the complete CareerNav application with both frontend and backend.

## 🚀 Quick Start

### 1. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://username:password@localhost:5432/careernav_db"
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   OPENAI_API_KEY=your-openai-api-key-here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up PostgreSQL database**
   - Create a new database named `careernav_db`
   - Update the DATABASE_URL in your `.env` file

5. **Run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. **Navigate to frontend directory (root)**
   ```bash
   cd ..
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** on your system
2. **Create database**:
   ```sql
   CREATE DATABASE careernav_db;
   ```
3. **Update DATABASE_URL** in backend `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/careernav_db"
   ```

### Option 2: Cloud Database (Recommended)

1. **Use a cloud PostgreSQL service** like:
   - [Supabase](https://supabase.com) (Free tier available)
   - [Neon](https://neon.tech) (Free tier available)
   - [Railway](https://railway.app) (Free tier available)

2. **Get connection string** and update `DATABASE_URL` in backend `.env`

## 🤖 OpenAI Setup

1. **Get OpenAI API key** from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Add to backend `.env`**:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

## 🧪 Testing the Setup

### 1. Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {
#   "success": true,
#   "message": "CareerNav API is running",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "environment": "development"
# }
```

### 2. Test Frontend
- Open http://localhost:5173
- You should see the CareerNav landing page
- Try creating an account

### 3. Test Complete Flow
1. **Create account** at http://localhost:5173
2. **Complete career test**
3. **Fill profile information**
4. **Generate career report**
5. **View dashboard**

## 🔧 Troubleshooting

### Backend Issues

1. **Database connection failed**
   - Check DATABASE_URL in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Port already in use**
   - Change PORT in `.env` to another port (e.g., 5001)
   - Update VITE_API_URL in frontend `.env`

3. **Prisma errors**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

### Frontend Issues

1. **API connection failed**
   - Check VITE_API_URL in `.env`
   - Ensure backend is running
   - Check CORS settings

2. **Build errors**
   ```bash
   npm install
   npm run build
   ```

## 📁 Project Structure

```
career-blossom-ai/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth and validation middleware
│   ├── routes/             # API routes
│   ├── utils/              # AI utilities
│   ├── prisma/             # Database schema
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── services/           # API service
│   └── App.tsx             # Main app component
├── package.json            # Frontend dependencies
└── setup.md               # This file
```

## 🚀 Deployment

### Backend Deployment
1. **Set production environment variables**
2. **Run database migrations**
3. **Deploy to your preferred platform**:
   - [Railway](https://railway.app)
   - [Render](https://render.com)
   - [Heroku](https://heroku.com)
   - [Vercel](https://vercel.com)

### Frontend Deployment
1. **Update VITE_API_URL** to production backend URL
2. **Build the application**:
   ```bash
   npm run build
   ```
3. **Deploy to your preferred platform**:
   - [Vercel](https://vercel.com)
   - [Netlify](https://netlify.com)
   - [GitHub Pages](https://pages.github.com)

## 📞 Support

If you encounter any issues:

1. **Check the logs** in both frontend and backend consoles
2. **Verify environment variables** are set correctly
3. **Ensure all dependencies** are installed
4. **Check database connection** and migrations

## 🎯 Next Steps

After successful setup:

1. **Customize the career assessment questions** in `backend/routes/test.js`
2. **Add more career paths** through the admin panel
3. **Enhance the AI prompts** in `backend/utils/ai.js`
4. **Add more features** like email notifications, file uploads, etc.
5. **Deploy to production** for real users

Happy coding! 🚀 