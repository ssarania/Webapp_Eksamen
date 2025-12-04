import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { quizService, attemptService } from '../services'
import type { QuizSummary } from '../types'
import { useAuth } from '../context/AuthContext'


interface Attempt {
	id: number
	quizId: number
	quizTitle: string
	score: number
	total: number
	timestamp: string
}

interface QuizAttempt {
	id: number
	userId: number
	userName?: string
	score: number
	totalQuestions: number
	percentage: number
	attemptedAt: string
	completedAt?: string | null
}

export default function Dashboard() {
	const { user } = useAuth()
	const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
	const [attempts, setAttempts] = useState<Attempt[]>([])
	const [quizAttemptsMap, setQuizAttemptsMap] = useState<Record<number, QuizAttempt[]>>({})
	const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null)
	

	useEffect(() => {
		async function loadData() {
			try {
				const quizList = await quizService.getMyQuizzes()
				setQuizzes(quizList)
				
				// Load attempts for each quiz (excluding own attempts)
				const attemptsMap: Record<number, QuizAttempt[]> = {}
				for (const quiz of quizList) {
					try {
						const quizAttempts = await attemptService.getQuizAttempts(quiz.id)
						// Filter out attempts by current user
						attemptsMap[quiz.id] = quizAttempts.filter(attempt => attempt.userId !== user?.id)
					} catch (err) {
						console.error(`Failed to load attempts for quiz ${quiz.id}:`, err)
						attemptsMap[quiz.id] = []
					}
				}
				setQuizAttemptsMap(attemptsMap)
				
				// Load user attempts if logged in
				if (user) {
					try {
						const attemptRecords = await attemptService.getUserAttempts(user.id)
						// Map API response to Dashboard Attempt interface
						const mappedAttempts = attemptRecords.map(record => ({
							id: record.id,
							quizId: record.quizId,
							quizTitle: record.quizTitle,
							score: record.score,
							total: record.totalQuestions,
							timestamp: record.completedAt || record.attemptedAt
						}))
						setAttempts(mappedAttempts)
					} catch (err) {
						console.error('Failed to load attempts:', err)
						// Don't fail the whole dashboard if attempts fail
						setAttempts([])
					}
				} else {
					setAttempts([])
				}
			} catch (err) {
				console.error('Failed to load dashboard data:', err)
			}
		}
		loadData()
	}, [user])

	const handleDeleteQuiz = async (quizId: number) => {
		if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
			return
		}

		try {
			setDeletingQuizId(quizId)
			await quizService.deleteQuiz(quizId)
			setQuizzes(quizzes.filter(q => q.id !== quizId))
		} catch (err) {
			console.error('Failed to delete quiz:', err)
			alert('Failed to delete quiz. Please try again.')
		} finally {
			setDeletingQuizId(null)
		}
	}

	const totalQuizzes = quizzes.length
	const totalAttempts = attempts.length
	const recent = attempts.slice(0, 15)
	const displayedQuizzes = quizzes.slice(0, 15)
	
	// Get total attempts on user's quizzes from other people
	const othersAttemptsCount = Object.values(quizAttemptsMap).reduce((sum, attempts) => sum + attempts.length, 0)

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-12 relative overflow-hidden">
			{/* Animated Background Blobs */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{/* Blob 1 - Blue */}
				<div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
				{/* Blob 2 - Purple */}
				<div className="absolute top-1/2 -left-32 w-80 h-80 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
				{/* Blob 3 - Pink */}
				<div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
			</div>

			<div className="max-w-6xl mx-auto px-4 relative z-10">
				{/* Header Section */}
				<div className="animate-fade-in-up mb-12">
					<h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
						Dashboard
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-300">Welcome back! Here's your learning overview.</p>
				</div>

				{/* Statistics Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{/* Quizzes Card */}
					<div className="group animate-fade-in-up delay-100">
						<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-default">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<div className="relative">
								<div className="flex items-center justify-between mb-4">
									<div className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Quizzes Created</div>
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
											<path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
										</svg>
									</div>
								</div>
								<div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
									{totalQuizzes}
								</div>
								<p className="text-sm text-slate-500 dark:text-slate-400">Total quizzes in your library</p>
							</div>
						</div>
					</div>

					{/* Attempts Card */}
					<div className="group animate-fade-in-up delay-200">
						<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-default">
							<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<div className="relative">
								<div className="flex items-center justify-between mb-4">
									<div className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Your Attempts</div>
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
											<path d="M7 3a1 1 0 000 2h6a1 1 0 000-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
										</svg>
									</div>
								</div>
								<div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
									{totalAttempts}
								</div>
								<p className="text-sm text-slate-500 dark:text-slate-400">Quiz attempts completed</p>
							</div>
						</div>
					</div>

					{/* Others Attempts Card */}
					<div className="group animate-fade-in-up delay-300">
						<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-default">
							<div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<div className="relative">
								<div className="flex items-center justify-between mb-4">
									<div className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Attempts on Your Quizzes</div>
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-md">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
											<path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" opacity="0.15" />
										</svg>
									</div>
								</div>
								<div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
									{othersAttemptsCount}
								</div>
								<p className="text-sm text-slate-500 dark:text-slate-400">Attempts by other users on your quizzes</p>
							</div>
						</div>
					</div>
				</div>

				{/* Content Sections Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Recent Attempts Section */}
					<div className="animate-fade-in-up delay-300">
						<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
							<div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 px-8 py-6 border-b border-slate-100 dark:border-slate-700">
								<h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
										📝
									</div>
									Recent Activity
								</h2>
								<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Your latest quiz performance</p>
							</div>

							<div className="p-6">
								{recent.length === 0 ? (
									<div className="py-12 text-center">
										<div className="text-6xl mb-3">🧘</div>
										<p className="text-slate-500 dark:text-slate-400">No attempts yet</p>
										<p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Take a quiz to get started!</p>
									</div>
								) : (
									<>
										<div className="max-h-96 overflow-y-auto pr-2">
											<ul className="space-y-3">
												{recent.map((a, idx) => (
													<li key={a.id} className="group/item animate-fade-in-up" style={{ animationDelay: `${100 + idx * 50}ms` }}>
														<div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md hover:translate-x-1 border border-slate-100 dark:border-slate-600">
															<div className="flex items-start justify-between">
																<div className="flex-1">
																	<p className="font-semibold text-slate-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
																		{a.quizTitle}
																	</p>
																	<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
																		{new Date(a.timestamp).toLocaleString()}
																	</p>
																</div>
																<div className="text-right">
																	<div className="flex items-center gap-2">
																		<div className="text-right">
																			<p className="font-bold text-slate-900 dark:text-white">
																				{a.score}/{a.total}
																			</p>
																			<p className="text-xs text-slate-500 dark:text-slate-400">
																				{Math.round((a.score / a.total) * 100)}%
																			</p>
																		</div>
																		<div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
																			a.score === a.total
																				? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
																				: a.score >= a.total * 0.7
																				? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
																				: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
																		}`}>
																			{a.score === a.total ? '✓' : `${Math.round((a.score / a.total) * 100)}%`}
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</li>
												))}
											</ul>
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Your Quizzes Section */}
					<div className="animate-fade-in-up delay-400">
						<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
							<div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 px-8 py-6 border-b border-slate-100 dark:border-slate-700">
								<h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
										📚
									</div>
									Your Quizzes
								</h2>
								<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Quizzes you've created</p>
							</div>

							<div className="p-6">
								{quizzes.length === 0 ? (
									<div className="py-12 text-center">
										<div className="text-6xl mb-3">🎨</div>
										<p className="text-slate-500 dark:text-slate-400">No quizzes yet</p>
										<p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first quiz to get started!</p>
									</div>
								) : (
									<div className="max-h-96 overflow-y-auto pr-2">
										<ul className="space-y-3">
											{displayedQuizzes.map((q, idx) => (
												<li key={q.id} className="group/item animate-fade-in-up" style={{ animationDelay: `${100 + idx * 50}ms` }}>
													<div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md hover:translate-x-1 border border-slate-100 dark:border-slate-600">
														<div className="flex items-start justify-between">
															<div className="flex-1">
																<Link to={`/quizzes/${q.id}`} className="font-semibold text-slate-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors hover:underline">
																	{q.title}
																</Link>
																<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
																	{q.questionCount} question{q.questionCount !== 1 ? 's' : ''}
																</p>
															</div>
															<div className="text-right flex flex-col items-end gap-2">
																<div>
																	<p className="text-xs text-slate-500 dark:text-slate-400">
																		{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recently'}
																	</p>
																	<div className="mt-2 inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
																		Ready
																	</div>
																</div>
																<div className="flex gap-1">
																	<Link
																		to={`/quizzes/${q.id}/edit`}
																		className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 rounded transition"
																		title="Edit quiz"
																	>
																		✏️ Edit
																	</Link>
																	<button
																		onClick={() => handleDeleteQuiz(q.id)}
																		disabled={deletingQuizId === q.id}
																		className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
																		title="Delete quiz"
																	>
																		{deletingQuizId === q.id ? '⌛ Deleting...' : '🗑️ Delete'}
																	</button>
																</div>
															</div>
														</div>
														
														{/* Attempts count on this quiz */}
														{(quizAttemptsMap[q.id] || []).length > 0 && (
															<div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-500 flex items-center gap-2">
																<span className="text-lg">👥</span>
																<span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
																	Attempts by others: {(quizAttemptsMap[q.id] || []).length}
																</span>
															</div>
														)}
													</div>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<style>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(24px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes blob {
					0%, 100% {
						transform: translate(0, 0) scale(1);
					}
					33% {
						transform: translate(30px, -50px) scale(1.1);
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
					}
				}

				.animate-blob {
					animation: blob 7s infinite;
				}

				.animation-delay-2000 {
					animation-delay: 2s;
				}

				.animation-delay-4000 {
					animation-delay: 4s;
				}

				.animate-fade-in-up {
					animation: fadeInUp 500ms ease-out forwards;
					opacity: 0;
				}

				.delay-100 { animation-delay: 100ms; }
				.delay-200 { animation-delay: 200ms; }
				.delay-300 { animation-delay: 300ms; }
				.delay-400 { animation-delay: 400ms; }
			`}</style>
		</div>
	)
}
