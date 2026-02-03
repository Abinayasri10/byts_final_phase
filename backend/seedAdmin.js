import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

// Define User schema inline for seeding
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    preferences: {
        adminDashboardView: { type: String, default: 'overview' },
        adminDashboardSubView: { type: String, default: null },
        theme: { type: String, default: 'light' }
    }
})

const User = mongoose.model('User', userSchema)

async function seedAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin' })

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists')

            // Update password if needed
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash('admin@123', salt)

            await User.updateOne(
                { email: 'admin' },
                {
                    password: hashedPassword,
                    role: 'admin',
                    profileCompleted: true
                }
            )
            console.log('✅ Admin user updated successfully')
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash('admin@123', salt)

            const adminUser = new User({
                email: 'admin',
                password: hashedPassword,
                role: 'admin',
                profileCompleted: true,
                preferences: {
                    adminDashboardView: 'overview',
                    adminDashboardSubView: null,
                    theme: 'light'
                }
            })

            await adminUser.save()
            console.log('✅ Admin user created successfully')
        }

        console.log('\n📋 Admin Credentials:')
        console.log('   Email: admin')
        console.log('   Password: admin@123')
        console.log('   Role: admin')
        console.log('\n🎯 You can now login with these credentials!')

    } catch (error) {
        console.error('❌ Error seeding admin user:', error)
    } finally {
        await mongoose.connection.close()
        console.log('\n✅ Database connection closed')
        process.exit(0)
    }
}

// Run the seed function
seedAdminUser()
