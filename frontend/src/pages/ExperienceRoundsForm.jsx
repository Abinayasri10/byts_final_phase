'use client';

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import { ChevronRight, Plus, Trash2, AlertCircle, Save, ArrowLeft, Minus, CheckCircle } from 'lucide-react'
import { experienceAPI } from '../services/api'
import { GLOBAL_PLATFORMS } from '../constants/companies'

function ExperienceRoundsForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rounds, setRounds] = useState([])
  const [showAddRoundModal, setShowAddRoundModal] = useState(false)
  const [activeRoundTab, setActiveRoundTab] = useState(0)

  // Get experience ID passed from previous step
  const experienceId = location.state?.experienceId

  const roundTypes = [
    { value: 'online-assessment', label: 'Online Assessment' },
    { value: 'technical-interview', label: 'Technical Interview' },
    { value: 'hr-interview', label: 'HR Interview' },
    { value: 'group-discussion', label: 'Group Discussion' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'other', label: 'Other' },
  ]

  // Redirect if no ID (or try to load draft)
  useEffect(() => {
    const checkDraftOrRedirect = async () => {
      if (experienceId) {
        loadRounds(experienceId) // Load specific rounds if ID provided
      } else {
        // Try to fetch latest draft if no ID passed in state
        try {
          const res = await experienceAPI.getDraft();
          if (res.data.success && res.data.draft) {
            const draft = res.data.draft;
            navigate('/share-experience/rounds', { state: { experienceId: draft._id }, replace: true });
          } else {
            // No draft, go to start
            setError('Missing experience details. Redirecting to start...')
            setTimeout(() => navigate('/share-experience/metadata'), 2000)
          }
        } catch (err) {
          setError('Missing experience details. Redirecting to start...')
          setTimeout(() => navigate('/share-experience/metadata'), 2000)
        }
      }
    }

    checkDraftOrRedirect();
  }, [experienceId])

  const loadRounds = async (idToLoad) => {
    const targetId = idToLoad || experienceId;
    if (!targetId) return;

    try {
      const res = await experienceAPI.getById(targetId)
      if (res.data.success && res.data.experience.rounds) {
        setRounds(res.data.experience.rounds)
      }
    } catch (err) {
      console.error("Failed to load rounds", err)
    }
  }

  // Auto-save logic
  useEffect(() => {
    if (rounds.length > 0 && experienceId) {
      const timer = setTimeout(() => {
        saveRounds(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [rounds, experienceId])

  const saveRounds = async (silent = false) => {
    if (!experienceId) return

    try {
      await experienceAPI.saveRounds(experienceId, rounds)
      if (!silent) {
        setSuccess('Rounds saved!')
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      console.error("Save Error:", err);
      if (!silent) setError(err.response?.data?.message || 'Failed to save rounds')
    }
  }

  const addRound = (type) => {
    const newRound = {
      id: Date.now(),
      type,
      title: `${roundTypes.find((r) => r.value === type)?.label || type} ${rounds.filter((r) => r.type === type).length + 1}`,
      details: {},
      saved: false,
    }
    setRounds([...rounds, newRound])
    setActiveRoundTab(rounds.length)
    setShowAddRoundModal(false)
  }

  const deleteRound = (id) => {
    if (window.confirm('Are you sure you want to delete this round?')) {
      setRounds(rounds.filter((r) => r.id !== id))
      setActiveRoundTab(Math.max(0, activeRoundTab - 1))
    }
  }

  const updateRound = (id, updates) => {
    setRounds(rounds.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (rounds.length === 0) {
      setError('Please add at least one round')
      return
    }

    setLoading(true)
    try {
      await saveRounds(false)
      setSuccess('Rounds saved! Proceeding to materials...')
      setTimeout(() => {
        navigate('/share-experience/materials', { state: { experienceId } })
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rounds')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side - Progress Bar */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-primary mb-6">Progress</h3>

                  {/* Step 1 - Completed */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-green-600 block">Metadata</span>
                        <span className="text-xs text-green-500">Completed</span>
                      </div>
                    </div>
                    <div className="ml-5 pl-5 border-l-2 border-green-500 h-8"></div>
                  </div>

                  {/* Step 2 - Active */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold shadow-md ring-4 ring-accent ring-opacity-20 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-primary block">Rounds</span>
                        <span className="text-xs text-secondary">In Progress</span>
                      </div>
                    </div>
                    <div className="ml-5 pl-5 border-l-2 border-accent h-8"></div>
                  </div>

                  {/* Step 3 - Inactive */}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500 block">Materials</span>
                        <span className="text-xs text-gray-400">Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-600 uppercase">Overall</span>
                      <span className="text-xs font-bold text-primary">67%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-2/3 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form (75% width) */}
            <div className="lg:col-span-9">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-3">Phase 2: Round-by-Round Details</h1>
                <p className="text-gray-600 text-lg">
                  Document each round of the placement process with specific details and insights.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl flex gap-3 shadow-md animate-in fade-in-50">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-6 p-5 bg-green-50 border-l-4 border-green-500 rounded-xl shadow-md animate-in fade-in-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <p className="text-green-700 font-bold">{success}</p>
                  </div>
                </div>
              )}

              {rounds.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 relative">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent opacity-5"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary opacity-5"></div>
                  </div>

                  <div className="relative z-20 text-center py-20 px-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-secondary mx-auto mb-6 flex items-center justify-center">
                      <Plus size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-3">No Rounds Added Yet</h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                      Start by adding your first interview round to document your placement experience.
                    </p>
                    <button
                      onClick={() => setShowAddRoundModal(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-2xl transition-all shadow-lg hover:scale-105"
                    >
                      <Plus size={24} />
                      Add First Round
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Round Tabs and Content */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent opacity-5"></div>
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary opacity-5"></div>
                    </div>

                    {/* Round Tabs */}
                    <div className="relative z-20 flex overflow-x-auto border-b-2 border-gray-200 bg-gradient-to-r from-background to-white">
                      {rounds.map((round, index) => (
                        <button
                          key={round.id}
                          type="button"
                          onClick={() => setActiveRoundTab(index)}
                          className={`px-6 py-4 font-bold whitespace-nowrap transition-all relative ${activeRoundTab === index
                              ? 'text-primary bg-white'
                              : 'text-gray-600 hover:bg-background hover:text-primary'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>Round {index + 1}</span>
                          </div>
                          {activeRoundTab === index && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Active Round Content */}
                    {rounds[activeRoundTab] && (
                      <div className="relative z-20">
                        <RoundForm
                          round={rounds[activeRoundTab]}
                          onUpdate={(updates) => updateRound(rounds[activeRoundTab].id, updates)}
                          onDelete={() => deleteRound(rounds[activeRoundTab].id)}
                          roundTypes={roundTypes}
                        />
                      </div>
                    )}
                  </div>

                  {/* Add Round Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddRoundModal(true)}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all shadow-md hover:shadow-lg"
                  >
                    <Plus size={24} />
                    Add Another Round
                  </button>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => navigate('/share-experience/metadata', { state: { experienceId } })}
                      className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-bold hover:border-gray-400 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => saveRounds(false)}
                      className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all shadow-md hover:shadow-lg"
                    >
                      <Save size={20} />
                      Save Progress
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105"
                    >
                      {loading ? 'Processing...' : (
                        <>
                          Next: Add Materials <ChevronRight size={24} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Add Round Modal */}
              {showAddRoundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-100 relative overflow-hidden animate-in fade-in-50 zoom-in-95">
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent opacity-10"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary opacity-10"></div>

                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold text-primary mb-6">Select Round Type</h2>
                      <div className="space-y-3 mb-6">
                        {roundTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => addRound(type.value)}
                            className="w-full text-left px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-secondary hover:bg-background transition-all font-bold text-gray-700 hover:text-primary shadow-sm hover:shadow-md"
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowAddRoundModal(false)}
                        className="w-full px-6 py-4 rounded-xl bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-all shadow-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function RoundForm({ round, onUpdate, onDelete, roundTypes }) {
  const roundType = roundTypes.find((r) => r.value === round.type)?.label || round.type

  return (
    <div className="p-8 lg:p-10 space-y-8">
      {/* Round Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-primary mb-4">{roundType}</h3>
          <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Round Title</label>
            <input
              type="text"
              value={round.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
              placeholder="Enter round title"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="ml-4 p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-md hover:shadow-lg border-2 border-red-200 hover:border-red-300"
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Conditional Fields Based on Round Type */}
      {round.type === 'online-assessment' && <OnlineAssessmentFields round={round} onUpdate={onUpdate} />}
      {round.type === 'technical-interview' && <TechnicalInterviewFields round={round} onUpdate={onUpdate} />}
      {round.type === 'hr-interview' && <HRInterviewFields round={round} onUpdate={onUpdate} />}
      {round.type === 'group-discussion' && <GDFields round={round} onUpdate={onUpdate} />}
      {round.type === 'case-study' && <CaseStudyFields round={round} onUpdate={onUpdate} />}
      {round.type === 'other' && <OtherRoundFields round={round} onUpdate={onUpdate} />}

      {/* General Notes */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">General Notes & Tips</label>
        <textarea
          value={round.details.notes || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, notes: e.target.value } })}
          placeholder="Add any important notes, tips, or insights about this round that would help others..."
          rows="5"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

function OnlineAssessmentFields({ round, onUpdate }) {
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false)

  const adjustCount = (field, amount) => {
    const currentVal = parseInt(round.details[field] || 0)
    const newVal = Math.max(0, currentVal + amount)
    const easy = field === 'questionsEasy' ? newVal : (round.details.questionsEasy || 0)
    const medium = field === 'questionsMedium' ? newVal : (round.details.questionsMedium || 0)
    const hard = field === 'questionsHard' ? newVal : (round.details.questionsHard || 0)

    onUpdate({
      details: {
        ...round.details,
        [field]: newVal,
        questionBreakdown: `${easy} Easy, ${medium} Medium, ${hard} Hard`
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform */}
        <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Platform</label>
          <div className="relative">
            <input
              type="text"
              value={round.details.platform || ''}
              onChange={(e) => {
                onUpdate({ details: { ...round.details, platform: e.target.value } })
                setShowPlatformDropdown(true)
              }}
              onFocus={() => setShowPlatformDropdown(true)}
              onBlur={() => setTimeout(() => setShowPlatformDropdown(false), 200)}
              placeholder="e.g., HackerRank, LeetCode"
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
              autoComplete="off"
            />
            {showPlatformDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-accent rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {(() => {
                  const filtered = GLOBAL_PLATFORMS.filter(p =>
                    p.toLowerCase().includes((round.details.platform || '').toLowerCase())
                  );
                  return (
                    <>
                      {filtered.map(p => (
                        <button
                          key={p}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            onUpdate({ details: { ...round.details, platform: p } })
                            setShowPlatformDropdown(false)
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-background transition-all font-medium border-b border-gray-100 last:border-b-0"
                        >
                          {p}
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <div className="px-5 py-3 text-gray-400 text-sm italic">Type to add new platform</div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Duration (minutes)</label>
          <input
            type="number"
            value={round.details.duration || ''}
            onChange={(e) => onUpdate({ details: { ...round.details, duration: e.target.value } })}
            placeholder="e.g., 90"
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Question Breakdown</label>
        <div className="grid grid-cols-3 gap-4">
          {/* Easy */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 flex flex-col items-center shadow-sm">
            <span className="text-green-700 font-bold mb-3 text-sm uppercase tracking-wide">Easy</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustCount('questionsEasy', -1)}
                className="w-9 h-9 rounded-full bg-white border-2 border-green-300 text-green-700 flex items-center justify-center hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-bold text-gray-800 min-w-[2rem] text-center">
                {round.details.questionsEasy || 0}
              </span>
              <button
                type="button"
                onClick={() => adjustCount('questionsEasy', 1)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Medium */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-5 flex flex-col items-center shadow-sm">
            <span className="text-yellow-700 font-bold mb-3 text-sm uppercase tracking-wide">Medium</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustCount('questionsMedium', -1)}
                className="w-9 h-9 rounded-full bg-white border-2 border-yellow-300 text-yellow-700 flex items-center justify-center hover:bg-yellow-50 transition-all shadow-sm hover:shadow-md"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-bold text-gray-800 min-w-[2rem] text-center">
                {round.details.questionsMedium || 0}
              </span>
              <button
                type="button"
                onClick={() => adjustCount('questionsMedium', 1)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-white flex items-center justify-center hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Hard */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 flex flex-col items-center shadow-sm">
            <span className="text-red-700 font-bold mb-3 text-sm uppercase tracking-wide">Hard</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustCount('questionsHard', -1)}
                className="w-9 h-9 rounded-full bg-white border-2 border-red-300 text-red-700 flex items-center justify-center hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-bold text-gray-800 min-w-[2rem] text-center">
                {round.details.questionsHard || 0}
              </span>
              <button
                type="button"
                onClick={() => adjustCount('questionsHard', 1)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Difficulty Level</label>
        <select
          value={round.details.difficulty || 'medium'}
          onChange={(e) => onUpdate({ details: { ...round.details, difficulty: e.target.value } })}
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium bg-white shadow-sm"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  )
}

function TechnicalInterviewFields({ round, onUpdate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interview Mode */}
        <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Interview Mode</label>
          <select
            value={round.details.mode || 'virtual'}
            onChange={(e) => onUpdate({ details: { ...round.details, mode: e.target.value } })}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium bg-white shadow-sm"
          >
            <option value="virtual">Virtual</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        {/* Panel Type */}
        <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Panel Type</label>
          <input
            type="text"
            value={round.details.panelType || ''}
            onChange={(e) => onUpdate({ details: { ...round.details, panelType: e.target.value } })}
            placeholder="e.g., 1:1, 2:1"
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Topics Covered */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Topics Covered</label>
        <textarea
          value={round.details.topics || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, topics: e.target.value } })}
          placeholder="e.g., DSA, DBMS, System Design"
          rows="3"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Interview Questions */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Interview Questions</label>
        <textarea
          value={round.details.questions || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, questions: e.target.value } })}
          placeholder="List the questions asked, one per line"
          rows="5"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

function HRInterviewFields({ round, onUpdate }) {
  return (
    <div className="space-y-6">
      {/* Duration */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Duration (minutes)</label>
        <input
          type="number"
          value={round.details.duration || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, duration: e.target.value } })}
          placeholder="e.g., 30"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* HR Questions Asked */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">HR Questions Asked</label>
        <textarea
          value={round.details.questions || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, questions: e.target.value } })}
          placeholder="e.g., Tell me about yourself, Why this company?, Career goals?"
          rows="4"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Answers that Worked */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Answers that Worked</label>
        <textarea
          value={round.details.answers || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, answers: e.target.value } })}
          placeholder="Share what answers/approaches worked well"
          rows="4"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Red Flags to Avoid */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Red Flags to Avoid</label>
        <textarea
          value={round.details.redFlags || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, redFlags: e.target.value } })}
          placeholder="Things to avoid saying or doing"
          rows="3"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

function GDFields({ round, onUpdate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format */}
        <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Format</label>
          <input
            type="text"
            value={round.details.format || ''}
            onChange={(e) => onUpdate({ details: { ...round.details, format: e.target.value } })}
            placeholder="e.g., 8 people, 10 minutes"
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
          />
        </div>

        {/* Topic */}
        <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Topic</label>
          <input
            type="text"
            value={round.details.topic || ''}
            onChange={(e) => onUpdate({ details: { ...round.details, topic: e.target.value } })}
            placeholder="What was discussed?"
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Evaluation Criteria</label>
        <textarea
          value={round.details.criteria || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, criteria: e.target.value } })}
          placeholder="How were candidates evaluated?"
          rows="3"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Your Reflection */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Your Reflection</label>
        <textarea
          value={round.details.reflection || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, reflection: e.target.value } })}
          placeholder="How did you perform? What worked?"
          rows="3"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

function CaseStudyFields({ round, onUpdate }) {
  return (
    <div className="space-y-6">
      {/* Duration */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Duration (minutes)</label>
        <input
          type="number"
          value={round.details.duration || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, duration: e.target.value } })}
          placeholder="e.g., 120"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Problem Statement */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Problem Statement</label>
        <textarea
          value={round.details.problem || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, problem: e.target.value } })}
          placeholder="Describe the case study problem"
          rows="4"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Your Approach */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Your Approach</label>
        <textarea
          value={round.details.approach || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, approach: e.target.value } })}
          placeholder="How did you solve it?"
          rows="4"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

function OtherRoundFields({ round, onUpdate }) {
  return (
    <div className="space-y-6">
      {/* Round Description */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Round Description</label>
        <textarea
          value={round.details.description || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, description: e.target.value } })}
          placeholder="Describe what happened in this round"
          rows="4"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>

      {/* Key Takeaways */}
      <div className="bg-gradient-to-br from-background to-white rounded-xl p-5 border border-gray-200 hover:border-accent transition-all">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Key Takeaways</label>
        <textarea
          value={round.details.takeaways || ''}
          onChange={(e) => onUpdate({ details: { ...round.details, takeaways: e.target.value } })}
          placeholder="What did you learn?"
          rows="3"
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all font-medium placeholder-gray-400 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

export default ExperienceRoundsForm