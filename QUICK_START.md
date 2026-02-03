# PlaceHub Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection string)
- npm or yarn

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd e:\BYTS\BytsPhase2\byts_phase2\backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create or update `.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/placehub
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 4. Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

Expected output:
```
MongoDB connected
Server running on port 5000
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd e:\BYTS\BytsPhase2\byts_phase2\frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Testing the Integration

### 1. Access the Application
Open your browser and navigate to: `http://localhost:5173`

### 2. Create a User Account
1. Click on "Sign Up"
2. Enter a college email (must end with .edu, .ac.in, or .college.com)
3. Create a password
4. Complete profile setup

### 3. Test Features

#### Student Features
- ✅ Dashboard - View experiences and opportunities
- ✅ Share Experience - Share placement experiences
- ✅ Mentorship - Request or offer mentorship
- ✅ Messages - Direct messaging with other users
- ✅ Meetings - Schedule and join meetings
- ✅ Q&A Forum - Ask and answer questions
- ✅ Profile - View and edit profile

#### Admin Features (Requires admin role in database)
- ✅ Admin Dashboard - Analytics and statistics
- ✅ Student Management - View and manage students
- ✅ Placed Students - Track placed students
- ✅ Problem Management - Handle reported issues

## Creating an Admin User

Since there's no admin signup route, you need to manually set a user as admin in MongoDB:

### Using MongoDB Compass or Shell
```javascript
// Connect to your database
use placehub

// Find the user by email
db.users.findOne({ email: "your@email.com" })

// Update user role to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)

// Verify the change
db.users.findOne({ email: "your@email.com" })
```

After setting the role, log out and log back in to get the admin token.

## API Testing

### Using curl or Postman

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@college.edu",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@college.edu",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

#### 3. Get User Profile (Authenticated)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Create Profile
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "rollNumber": "CS001",
    "year": "4th Year",
    "branch": "Computer Science"
  }'
```

## Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution**: 
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

#### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**:
- Change PORT in .env file
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill -9
  ```

#### JWT Secret Error
```
Error: JWT_SECRET is not defined
```
**Solution**: Add JWT_SECRET to .env file

### Frontend Issues

#### Module Not Found
```
Error: Cannot find module 'recharts'
```
**Solution**:
```bash
cd frontend
npm install recharts
```

#### Vite Build Error
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### CORS Error
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS
```
**Solution**: Backend already has CORS enabled. If issue persists, check backend server is running.

## Project Structure

```
byts_phase2/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, logging, etc.
│   ├── websocket/       # WebSocket for real-time features
│   ├── .env            # Environment variables
│   ├── server.js       # Entry point
│   └── package.json    # Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    ├── package.json     # Dependencies
    └── vite.config.js   # Vite configuration
```

## Available Routes

### Public Routes
- `/login` - User login
- `/signup` - User registration

### Protected Routes (Requires Authentication)
- `/home` - Dashboard
- `/profile` - User profile
- `/edit-profile` - Edit profile
- `/share-experience` - Share placement experience
- `/mentorship` - Mentorship page
- `/messages` - Direct messages
- `/meetings` - Meeting management
- `/questions` - Q&A forum
- `/about` - About page

### Admin Routes (Requires Admin Role)
- `/admin` - Admin dashboard

### Under Development
- `/materials` - Study materials
- `/analytics` - Analytics
- `/opportunities` - Job opportunities
- `/contact` - Contact page

## Next Steps

1. **Customize Branding**: Update logo, colors, and branding in the frontend
2. **Email Configuration**: Set up email service for notifications
3. **File Upload**: Configure file storage for profile pictures and documents
4. **Video Meetings**: Integrate video calling service (e.g., Jitsi, Zoom API)
5. **Notifications**: Implement real-time notifications
6. **Analytics**: Set up analytics tracking
7. **Deployment**: Deploy to production server

## Support

For issues or questions:
1. Check the INTEGRATION_SUMMARY.md file
2. Review the INTERACTION_MODULE_README.md for interaction features
3. Check the PROFILE_FEATURE_GUIDE.md for profile features

## License

This project is part of the BYTS Hackathon.
