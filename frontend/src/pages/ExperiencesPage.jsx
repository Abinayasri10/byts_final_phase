import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import ExperienceCard from '../components/ExperienceCard'
import { experienceAPI } from '../services/api'
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

// Debounce helper
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

function ExperiencesPage() {
    const [experiences, setExperiences] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Options for filters
    const [companyOptions, setCompanyOptions] = useState([])
    const [roleOptions, setRoleOptions] = useState([]) // Optional usage

    // Filter States
    const [filters, setFilters] = useState({
        batch: [],
        company: [],
        outcome: [],
        search: '', // Not strictly in API params but can filter frontend or pass to backend if enhanced
        difficulty: '',
    })

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        pages: 1
    })

    // Load initial filter options (Companies, etc.)
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await experienceAPI.getOptions()
                if (res.data.success) {
                    setCompanyOptions(res.data.companies || [])
                    setRoleOptions(res.data.roles || [])
                }
            } catch (err) {
                console.error("Failed to load options", err)
            }
        }
        fetchOptions()
    }, [])

    // Fetch Data Function
    const fetchExperiences = async (page = 1) => {
        try {
            setLoading(page === 1)
            setLoadingMore(page > 1)

            const queryParams = {
                page,
                limit: pagination.limit,
                batch: filters.batch.join(','),
                company: filters.company.join(','),
                outcome: filters.outcome.join(','),
                difficulty: filters.difficulty,
                search: filters.search
            }

            const res = await experienceAPI.browse(queryParams)

            if (res.data.success) {
                setExperiences(res.data.experiences)
                setPagination(res.data.pagination)
            }
        } catch (err) {
            console.error("Error fetching experiences:", err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const debouncedSearch = useDebounce(filters.search, 500)

    // Effect to re-fetch when filters change (reset to page 1)
    useEffect(() => {
        fetchExperiences(1)
    }, [filters.batch, filters.company, filters.outcome, filters.difficulty, debouncedSearch])

    // Pagination Handler
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchExperiences(newPage)
        }
    }

    // Filter Toggle Helpers
    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category]
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value]
            return { ...prev, [category]: updated }
        })
    }

    const clearFilters = () => {
        setFilters({
            batch: [],
            company: [],
            outcome: [],
            search: '',
            difficulty: ''
        })
    }

    return (
        <MainLayout>
            <div className="bg-background min-h-screen">
                {/* Header Banner */}
                <div className="bg-primary text-white py-12 px-4 shadow-lg">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-4">Placement Experiences</h1>
                        <p className="text-xl opacity-90 max-w-2xl">
                            Discover insights from seniors who have cracked top companies.
                            Browse through {pagination.total} verified experiences.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Filter size={20} /> Filters
                                </h3>
                                <button onClick={clearFilters} className="text-xs text-secondary hover:underline font-medium">
                                    Reset
                                </button>
                            </div>

                            {/* Batch Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wider">Batch</h4>
                                <div className="space-y-2">
                                    {['2023', '2024', '2025'].map(batch => (
                                        <label key={batch} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.batch.includes(batch) ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white group-hover:border-secondary'}`}>
                                                {filters.batch.includes(batch) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={filters.batch.includes(batch)}
                                                onChange={() => toggleFilter('batch', batch)}
                                            />
                                            <span className={`text-sm ${filters.batch.includes(batch) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{batch}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Outcome Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wider">Outcome</h4>
                                <div className="space-y-2">
                                    {['selected', 'not-selected', 'in-process'].map(outcome => (
                                        <label key={outcome} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.outcome.includes(outcome) ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white group-hover:border-secondary'}`}>
                                                {filters.outcome.includes(outcome) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                onChange={() => toggleFilter('outcome', outcome)}
                                                checked={filters.outcome.includes(outcome)}
                                            />
                                            <span className={`text-sm capitalize ${filters.outcome.includes(outcome) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                {outcome.replace('-', ' ')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Company Filter (Multi-select) */}
                            <div className="mb-6">
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {companyOptions.map(company => (
                                        <label key={company} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.company.includes(company) ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white group-hover:border-secondary'}`}>
                                                {filters.company.includes(company) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                onChange={() => toggleFilter('company', company)}
                                                checked={filters.company.includes(company)}
                                            />
                                            <span className={`text-sm truncate ${filters.company.includes(company) ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{company}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <div className="flex-1">
                        {/* Search Top Bar (Visual Only for now) */}
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by role, company, or skills..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <RefreshCw className="animate-spin mb-4" size={32} />
                                <p>Loading experiences...</p>
                            </div>
                        ) : experiences.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No experiences found</h3>
                                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria.</p>
                                <button onClick={clearFilters} className="text-secondary font-semibold hover:underline">
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {experiences.map(exp => (
                                        <ExperienceCard key={exp._id} experience={exp} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="font-semibold text-gray-700">
                                            Page {pagination.page} of {pagination.pages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default ExperiencesPage
