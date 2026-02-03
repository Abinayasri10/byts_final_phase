import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http';

import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import experienceRoutes from './routes/experienceRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import mentorshipRoutes from './routes/mentorshipRoutes.js'
import meetingRoutes from './routes/meetingRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import setupWebSocket from './websocket/socket.js';
import anonQuestionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import sessionRoutes from './routes/session.routes.js';
import { startArchiveScheduler } from './utils/archiveScheduler.js';
import opportunityRoutes from './routes/opportunityRoutes.js'
import passwordResetRoutes from './routes/passwordResetRoutes.js'
import { requestLogger } from './middlewares/loggerMiddleware.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Apply logger after basic parsing but before routes
app.use(requestLogger)

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/mentorship', mentorshipRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/password-reset', passwordResetRoutes)

// Anon-Chat Routes
app.use('/api/anon-questions', anonQuestionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})

const server = http.createServer(app);
setupWebSocket(server);

// Start auto-archive scheduler
startArchiveScheduler();
// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
