import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import User from '../models/User.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          return done(null, user)
        }

        // Check if email already exists
        const email = profile.emails[0].value
        user = await User.findOne({ email })

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id
          await user.save()
          return done(null, user)
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
          profileCompleted: false,
        })

        done(null, user)
      } catch (error) {
        done(error, null)
      }
    }
  )
)

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ githubId: profile.id })

        if (user) {
          return done(null, user)
        }

        // Get primary email from GitHub
        const email = profile.emails && profile.emails.length > 0 
          ? profile.emails[0].value 
          : `${profile.username}@github.user`

        // Check if email already exists
        user = await User.findOne({ email })

        if (user) {
          // Link GitHub account to existing user
          user.githubId = profile.id
          await user.save()
          return done(null, user)
        }

        // Create new user
        user = await User.create({
          githubId: profile.id,
          email,
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
          profileCompleted: false,
        })

        done(null, user)
      } catch (error) {
        done(error, null)
      }
    }
  )
)

export default passport
