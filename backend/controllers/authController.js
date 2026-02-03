import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body

    // Validate email domain (college email)
    if (!email.includes('@') || !email.match(/\.(edu|ac\.in|college\.com)$/i)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid college email address',
      })
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      })
    }

    // Create new user
    const user = new User({ email, password })
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      userId: user._id,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('Login attempt:', { email, passwordProvided: !!password });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    console.log('✅ User found:', { id: user._id, email: user.email });

    // Compare password
    const isPasswordValid = await user.comparePassword(password)
    console.log('🔑 Password validation:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password');
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Generate token
    const token = generateToken(user._id)

    console.log('✅ Login successful for:', email);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      userId: user._id,
      profileCompleted: user.profileCompleted,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}