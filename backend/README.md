# CareerNav Backend API

A comprehensive Node.js/Express backend for the CareerNav career guidance system with JWT authentication, PostgreSQL database, and AI-powered career recommendations.

## 🚀 Features

- **JWT Authentication** with role-based access control (User/Admin)
- **PostgreSQL Database** with Prisma ORM
- **AI-Powered Career Reports** using OpenAI GPT
- **Comprehensive API** for all career guidance features
- **Security Features** including rate limiting, CORS, and input validation
- **Admin Panel** for managing users, reports, and career paths

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- OpenAI API key (for AI features)

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
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
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/careernav_db"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key-here

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The application uses the following main tables:

- **users** - User accounts with authentication
- **profiles** - User profile information
- **test_results** - Career assessment test answers
- **reports** - AI-generated career reports
- **career_paths** - Career path information (managed by admins)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/status` - Check user completion status
- `POST /api/auth/refresh` - Refresh JWT token

### Career Assessment
- `GET /api/test/questions` - Get assessment questions
- `POST /api/test/submit` - Submit test answers
- `GET /api/test/status` - Get test completion status

### User Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update profile
- `PATCH /api/profile` - Update profile fields
- `GET /api/profile/status` - Get profile status

### Career Reports
- `POST /api/report/generate` - Generate AI career report
- `GET /api/report` - Get user's career report
- `POST /api/report/regenerate` - Regenerate career report

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

### Admin (Admin only)
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `GET /api/admin/careers` - List career paths
- `POST /api/admin/careers` - Create career path
- `PUT /api/admin/careers/:id` - Update career path
- `DELETE /api/admin/careers/:id` - Delete career path

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🎯 User Flow

1. **Signup/Login** - User creates account or logs in
2. **Status Check** - System checks completion status
3. **Career Test** - User completes assessment (if not done)
4. **Profile Completion** - User fills profile (if not done)
5. **Report Generation** - AI generates career report
6. **Dashboard** - User views personalized recommendations

## 🛡️ Security Features

- **JWT Authentication** with role-based access
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# Test API endpoints
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"USER"}'
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## 🚀 Deployment

1. **Set up production environment variables**
2. **Run database migrations**
3. **Build and start the application**
   ```bash
   npm start
   ```

## 📚 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 