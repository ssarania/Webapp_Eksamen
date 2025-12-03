import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { deleteQuiz as deleteLocalQuiz, getQuizSummaries } from '../lib/storage'
import type { QuizSummary } from '../types'

// Floating Background Elements Component
function BackgroundFloaters() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{/* Floating Card 1 */}
			<div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/40 to-blue-500/30 rounded-lg transform -rotate-12 animate-float opacity-60" style={{ animationDelay: '0s' }} />
			{/* Floating Card 2 */}
			<div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-purple-500/30 rounded-lg transform rotate-12 animate-float opacity-50" style={{ animationDelay: '2s' }} />
			{/* Floating Card 3 */}
			<div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-pink-400/40 to-pink-500/30 rounded-lg transform -rotate-6 animate-float opacity-50" style={{ animationDelay: '4s' }} />
		</div>
	)
}

// Individual Quiz Card Component
function QuizCardItem({ q, index, onDelete, onTogglePublic }: { q: QuizSummary; index: number; onDelete: (id: number) => void; onTogglePublic: (id: number, isPublic: boolean) => void }) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const isPublic = q.isPublic ?? false

	return (
		<div
			className="group animate-fade-in-up"
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<article className="relative h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-default">
				{/* Gradient Background on Hover */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50 group-hover:via-purple-50/30 group-hover:to-pink-50 transition-all duration-300 pointer-events-none" />

				<div className="relative p-6 h-full flex flex-col">
					{/* Header with Actions */}
					<div className="flex items-start justify-between gap-3 mb-4">
						<div className="flex-1">
							<h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
								{q.title}
							</h3>
						</div>

						{/* Delete Button: only show for owners */}
						{q.isOwned && (
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
								title="Delete quiz"
								aria-label="Delete quiz"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
							</button>
						)}
					</div>

					{/* Description */}
					{q.description && (
						<p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
							{q.description}
						</p>
					)}

					{/* Metadata */}
					<div className="flex items-center gap-3 mt-auto mb-4 text-xs text-slate-500 dark:text-slate-400">
						<div className="flex items-center gap-1">
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
								<path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
							</svg>
							{q.questionCount} question{q.questionCount !== 1 ? 's' : ''}
						</div>
						<div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
						<span>
							{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recently'}
						</span>
					</div>

					{/* Category Badge */}
					<div className="mb-4 flex items-center gap-2">
						<span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isPublic
							? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300'
							: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/30 dark:to-slate-600/30 text-slate-700 dark:text-slate-300'
							}`}>
							{isPublic ? '🌐 Public' : '🔒 Private'}
						</span>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Link
							to={`/quizzes/${q.id}`}
							className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-center text-sm"
						>
							Open
						</Link>
						{q.isOwned && (
							// <button
							// 	onClick={() => onTogglePublic(q.id, isPublic)}
							// 	className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-sm whitespace-nowrap"
							// 	title={isPublic ? 'Make private' : 'Make public'}
							// >
							// 	Make {isPublic ? 'private 🔒' : 'public 🌐'}
							// </button>
							<Link
								to={`/quizzes/${q.id}/edit`}
								className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-sm whitespace-nowrap text-center"
							>
								Edit Quiz
							</Link>
						)}
					</div>

					{/* Delete Confirmation Modal */}
					{showDeleteConfirm && (
						<div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-50">
							<div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl text-center">
								<p className="text-sm font-medium text-slate-900 dark:text-white mb-4">Delete this quiz?</p>
								<div className="flex gap-2">
									<button
										onClick={() => setShowDeleteConfirm(false)}
										className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
									>
										Cancel
									</button>
									<button
										onClick={() => {
											onDelete(q.id)
											setShowDeleteConfirm(false)
										}}
										className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</article>
		</div>
	)
}

export default function Quizzes() {
	const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
	const [filter, setFilter] = useState('')
	const [sort, setSort] = useState<'new' | 'alpha'>('new')
	const [page, setPage] = useState(1)
	const pageSize = 12

	useEffect(() => {
		let mounted = true
		api.getQuizzes().then(list => { if (mounted) setQuizzes(list) }).catch(() => setQuizzes(getQuizSummaries()))
		return () => { mounted = false }
	}, [])

	async function handleDelete(id: number) {
		if (!confirm('Delete this quiz?')) return
		try {
			await api.deleteQuiz(id)
			setQuizzes(prev => prev.filter(q => q.id !== id))
		} catch {
			// fallback to local delete
			deleteLocalQuiz(id)
			setQuizzes(prev => prev.filter(q => q.id !== id))
		}
	}

	async function handleTogglePublic(id: number, currentIsPublic: boolean) {
		try {
			await api.updateQuiz(id, { isPublic: !currentIsPublic })
			setQuizzes(prev => prev.map(q => q.id === id ? { ...q, isPublic: !currentIsPublic } : q))
		} catch (err) {
			alert('Failed to update quiz visibility. Please try again.')
		}
	}

	const filtered = useMemo(() => {
		const f = (filter || '').toLowerCase()
		let out = quizzes.filter(q => (q.title + ' ' + (q.authorName ?? '') + ' ' + (q.description ?? '')).toLowerCase().includes(f))
		if (sort === 'alpha') out = out.sort((a, b) => a.title.localeCompare(b.title))
		else out = out.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
		return out
	}, [quizzes, filter, sort])

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
	const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-12 relative overflow-hidden">
			{/* Animated Background */}
			<BackgroundFloaters />

			<div className="max-w-7xl mx-auto px-4 relative z-10">
				{/* Hero Header */}
				<div className="mb-12 animate-fade-in-up">
					<h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
						Browse Quizzes
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
						Explore and take quizzes to test your knowledge. Create new quizzes and challenge others to learn.
					</p>
				</div>

				{/* Search & Sort Bar */}
				<div className="mb-12 animate-fade-in-up delay-100">
					<div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30 dark:border-slate-700/30">
						<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
							{/* Search Input */}
							<div className="relative w-full md:flex-1">
								<svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
									<path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
								</svg>
								<input
									type="text"
									placeholder="Search quizzes by title, author or description..."
									value={filter}
									onChange={e => { setFilter(e.target.value); setPage(1) }}
									className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:focus:ring-offset-0 transition-all"
								/>
							</div>

							{/* Sort Dropdown */}
							<select
								value={sort}
								onChange={e => { setSort(e.target.value as 'new' | 'alpha'); setPage(1) }}
								className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-max"
							>
								<option value="new">Newest First</option>
								<option value="alpha">A → Z</option>
							</select>

							{/* Create Quiz Button */}
							<Link
								to="/quiz-creation/create"
								className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 text-center"
							>
								+ Create Quiz
							</Link>
						</div>
					</div>
				</div>

				{/* Quiz Grid or Empty State */}
				{filtered.length === 0 ? (
					<div className="animate-fade-in-up delay-200">
						<div className="text-center py-20">
							<div className="text-6xl mb-4">🎓</div>
							<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No quizzes found</h2>
							<p className="text-slate-600 dark:text-slate-400 mb-8">
								{filter ? 'Try adjusting your search filters.' : 'Be the first to create a quiz!'}
							</p>
							{!filter && (
								<Link
									to="/quiz-creation/create"
									className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
								>
									Create Your First Quiz
								</Link>
							)}
						</div>
					</div>
				) : (
					<>
						{/* Quiz Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
							{pageItems.map((q, idx) => (
								<QuizCardItem key={q.id} q={q} index={idx} onDelete={handleDelete} onTogglePublic={handleTogglePublic} />
							))}
						</div>						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-700">
								<button
									onClick={() => setPage(p => Math.max(1, p - 1))}
									disabled={page === 1}
									className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
								>
									← Previous
								</button>
								<div className="text-sm text-slate-600 dark:text-slate-400">
									Page {page} of {totalPages}
								</div>
								<button
									onClick={() => setPage(p => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
									className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
								>
									Next →
								</button>
							</div>
						)}

						{/* Results Count */}
						<div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
							Showing {pageItems.length} of {filtered.length} quiz{filtered.length !== 1 ? 'zes' : ''}
						</div>
					</>
				)}
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

				@keyframes float {
					0%, 100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}

				.animate-fade-in-up {
					animation: fadeInUp 500ms ease-out forwards;
					opacity: 0;
				}

				.animate-float {
					animation: float 6s ease-in-out infinite;
				}

				.delay-100 { animation-delay: 100ms; }
				.delay-200 { animation-delay: 200ms; }
			`}</style>
		</div>
	)
}
