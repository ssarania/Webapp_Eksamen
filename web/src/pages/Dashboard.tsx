import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuizSummaries, loadAttempts } from '../lib/storage'

export default function Dashboard() {
	const [quizzes, setQuizzes] = useState(() => getQuizSummaries())
	const [attempts, setAttempts] = useState(() => loadAttempts())

	useEffect(() => {
		setQuizzes(getQuizSummaries())
		setAttempts(loadAttempts())
	}, [])

	const totalQuizzes = quizzes.length
	const totalAttempts = attempts.length
	const recent = attempts.slice(0, 5)

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
									<div className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Attempts</div>
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

					{/* Recent Activity Card */}
					<div className="group animate-fade-in-up delay-300">
						<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-default">
							<div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<div className="relative">
								<div className="flex items-center justify-between mb-4">
									<div className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Recent Activity</div>
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-md">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
											<path fillRule="evenodd" d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" clipRule="evenodd" />
										</svg>
									</div>
								</div>
								<div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
									{recent.length}
								</div>
								<p className="text-sm text-slate-500 dark:text-slate-400">Items in your feed</p>
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
									Recent Attempts
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
									<ul className="space-y-3">
										{quizzes.slice(0, 6).map((q, idx) => (
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
															<Link
																to={`/quizzes/${q.id}/edit`}
																className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 rounded transition"
																title="Edit quiz"
															>
																✏️ Edit
															</Link>
														</div>
													</div>
												</div>
											</li>
										))}
										{quizzes.length > 6 && (
											<li className="text-center pt-2">
												<p className="text-sm text-slate-500 dark:text-slate-400">
													+{quizzes.length - 6} more quiz{quizzes.length - 6 !== 1 ? 'zes' : ''}
												</p>
											</li>
										)}
									</ul>
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
