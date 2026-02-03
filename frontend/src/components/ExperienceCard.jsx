import { ArrowRight, Star, FileText, Layers, CheckCircle, XCircle, Calendar, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

function ExperienceCard({ experience }) {
    const {
        _id,
        companyName,
        roleAppliedFor,
        batch,
        outcome,
        difficultyRating,
        roundsCount,
        materialsCount,
        overallExperienceRating,
    } = experience

    // Color mapping based on outcome
    const getOutcomeStyles = () => {
        switch (outcome) {
            case 'selected':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'not-selected':
                return 'bg-red-50 text-red-700 border-red-200'
            case 'in-process':
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group animate-in fade-in zoom-in-50 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        {companyName.charAt(0)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOutcomeStyles()} flex items-center gap-1`}>
                        {outcome === 'selected' ? <CheckCircle size={12} /> : outcome === 'not-selected' ? <XCircle size={12} /> : <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                        {outcome === 'selected' ? 'Selected' : outcome === 'not-selected' ? 'Not Selected' : 'In Process'}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1" title={companyName}>
                    {companyName}
                </h3>
                <p className="text-gray-600 font-medium mb-3 flex items-center gap-2 line-clamp-1" title={roleAppliedFor}>
                    <Briefcase size={16} className="text-gray-400" />
                    {roleAppliedFor}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                        <Calendar size={12} /> Batch {batch}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-medium">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" /> {difficultyRating}/5 Difficulty
                    </span>
                </div>
            </div>

            {/* Stats/Body */}
            <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5" title={`${roundsCount} Rounds`}>
                        <Layers size={16} className="text-secondary" />
                        <span className="font-semibold">{roundsCount}</span>
                        <span className="hidden sm:inline">Rounds</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`${materialsCount} Materials`}>
                        <FileText size={16} className="text-accent" />
                        <span className="font-semibold">{materialsCount}</span>
                        <span className="hidden sm:inline">Resources</span>
                    </div>
                </div>

                {/* Optional: Overall Rating if available */}
                {overallExperienceRating && (
                    <div className="flex items-center gap-1 text-gray-400 font-medium" title="Overall Experience Rating">
                        <span className="text-gray-700">{overallExperienceRating}</span>/5
                    </div>
                )}
            </div>

            {/* Footer / CTA */}
            <div className="p-4 border-t border-gray-100">
                <Link
                    to={`/experiences/${experience._id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:shadow-md group/btn"
                >
                    Read Experience
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}

export default ExperienceCard
