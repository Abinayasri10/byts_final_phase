import { Link } from 'react-router-dom'
// Component for pages under construction
import { Construction, ArrowLeft } from 'lucide-react'
import MainLayout from '../components/MainLayout'

const UnderDevelopmentPage = () => {
    return (
        <MainLayout>
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 text-yellow-500 animate-pulse">
                    <Construction size={48} />
                </div>

                <h1 className="text-4xl font-bold text-primary mb-4">Under Construction</h1>

                <p className="text-xl text-gray-600 max-w-lg mb-8">
                    We're working hard to bring you this feature. Stay tuned for updates!
                </p>

                <Link
                    to="/home"
                    className="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-secondary transition shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>
            </div>
        </MainLayout>
    )
}

export default UnderDevelopmentPage
