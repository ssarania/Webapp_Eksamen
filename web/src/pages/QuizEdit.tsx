import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { CreateQuizDto } from '../types'
import { quizService } from '../services'

type Option = { text: string; isCorrect?: boolean }
type Q = { text: string; explanation?: string; options: Option[] }

function IconTrash() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
			<path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4h6v2" />
		</svg>
	)
}

function OptionRow({ option, qi, oi, onText, onSetCorrect, onRemove, disableRemove }: {
	option: Option
	qi: number
	oi: number
	onText: (text: string) => void
	onSetCorrect: () => void
	onRemove: () => void
	disableRemove: boolean
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
			<input
				type="radio"
				name={`correct-${qi}`}
				checked={!!option.isCorrect}
				onChange={onSetCorrect}
				className="cursor-pointer w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-200"
				aria-label={`Select correct option ${oi + 1}`}
			/>
			<input
				value={option.text}
				onChange={e => onText(e.target.value)}
				placeholder={`Option ${oi + 1}`}
				className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
			/>
			<button
				type="button"
				onClick={onRemove}
				disabled={disableRemove}
				className="cursor-pointer p-2 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-40"
				aria-label="Remove option"
			>
				<IconTrash />
			</button>
		</div>
	)
}

function QuestionCard({ q, qi, onUpdateText, onUpdateExplanation, onAddOption, onUpdateOption, onSetCorrect, onRemoveQuestion, onRemoveOption }: {
	q: Q
	qi: number
	onUpdateText: (text: string) => void
	onUpdateExplanation: (explanation: string) => void
	onAddOption: () => void
	onUpdateOption: (oi: number, text: string) => void
	onSetCorrect: (oi: number) => void
	onRemoveQuestion: () => void
	onRemoveOption: (oi: number) => void
}) {
	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 space-y-4 transform transition hover:shadow-xl">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 space-y-3">
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Question {qi + 1}</label>
						<input
							value={q.text}
							onChange={e => onUpdateText(e.target.value)}
							placeholder="Enter your question"
							className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm transition"
						/>
					</div>
				</div>
				<div className="ml-2 flex-shrink-0">
					<button type="button" onClick={onRemoveQuestion} className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:shadow transition">
						Delete
					</button>
				</div>
			</div>

			<div className="space-y-3">
				{q.options.map((o, oi) => (
					<OptionRow
						key={oi}
						option={o}
						qi={qi}
						oi={oi}
						onText={text => onUpdateOption(oi, text)}
						onSetCorrect={() => onSetCorrect(oi)}
						onRemove={() => onRemoveOption(oi)}
						disableRemove={q.options.length <= 2}
					/>
				))}
			</div>

			<div className="flex items-center justify-between">
				{q.options.length < 4 && (
					<button
						type="button"
						onClick={onAddOption}
						disabled={q.options.length >= 4}
						className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:shadow-md transition text-sm"
					>
						+ Add option
					</button>
				)}
				<div className="text-sm text-slate-500">{q.options.length} options</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Explanation (optional)</label>
				<textarea
					value={q.explanation || ''}
					onChange={e => onUpdateExplanation(e.target.value)}
					placeholder="Explain the correct answer (shown after quiz submission)"
					className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm transition"
					rows={2}
				/>
			</div>
		</div>
	)
}

export default function QuizEdit() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [isPublic, setIsPublic] = useState(false)
	const [questions, setQuestions] = useState<Q[]>([
		{ text: 'Untitled question', explanation: '', options: [{ text: 'Option 1', isCorrect: true }, { text: 'Option 2' }] }
	])
	const [error, setError] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

		async function loadQuiz() {
			if (!id) return
			try {
				const quiz = await quizService.getQuizById(id, true)
				if (mounted) {
					setTitle(quiz.title || '')
					setDescription(quiz.description || '')
					setIsPublic(quiz.isPublic ?? false)
					if (quiz.questions && quiz.questions.length > 0) {
						setQuestions(
							quiz.questions.map(q => ({
								text: q.text,
								explanation: q.explanation || '',
								options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect ?? false }))
							}))
						)
					}
				}
			} catch (err) {
				if (mounted) {
					setError('Failed to load quiz')
					console.error('Error loading quiz:', err)
				}
			} finally {
				if (mounted) setLoading(false)
			}
		}

		loadQuiz()
		return () => { mounted = false }
	}, [id])

	function addQuestion() {
		setQuestions(s => [...s, { text: '', explanation: '', options: [{ text: '', isCorrect: true }, { text: '' }] }])
	}

	function removeQuestion(i: number) {
		setQuestions(s => s.filter((_, idx) => idx !== i))
	}

	function updateQuestion(i: number, patch: Partial<Q>) {
		setQuestions(s => s.map((q, idx) => idx === i ? { ...q, ...patch } : q))
	}

	function addOption(qi: number) {
		setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: [...q.options, { text: '' }] } : q))
	}

	function setCorrect(qi: number, oi: number) {
		setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) } : q))
	}

	function updateOption(qi: number, oi: number, text: string) {
		setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? { ...o, text } : o) } : q))
	}

	function removeOption(qi: number, oi: number) {
		setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q))
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		if (!title.trim()) return setError('Please enter a quiz title')
		if (!questions.length) return setError('Add at least one question')
		for (const q of questions) {
			if (!q.text.trim()) return setError('All questions must have text')
			if (!q.options || q.options.length < 2) return setError('Each question needs at least two options')
			if (q.options.filter(x => x.isCorrect).length !== 1) return setError('Each question must have exactly one correct option')
		}

		const dto: CreateQuizDto = {
			title: title.trim(),
			description: description.trim(),
			isPublic: isPublic,
			questions: questions.map(q => ({ 
				text: q.text, 
				explanation: q.explanation?.trim() || '',
				options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) 
			}))
		}

		try {
			setSaving(true)
			if (id) {
				await quizService.updateQuiz(parseInt(id), dto)
				navigate(`/quizzes/${id}`)
			}
		} catch (err: any) {
			setError('Failed to save quiz. Please try again.')
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-12 flex items-center justify-center">
				<div className="text-slate-600">Loading quiz...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-12">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-gradient-to-r from-white/40 via-blue-50/60 to-white/40 dark:from-slate-900/40 dark:via-slate-900/30 rounded-3xl p-8 shadow-2xl">
					<div className="max-w-3xl mx-auto">
						<header className="text-center mb-6">
							<h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Edit Quiz</h1>
							<p className="mt-2 text-slate-600">Update your quiz questions and settings</p>
						</header>

						<form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-6">
							<section className="space-y-4">
								<h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quiz Details</h2>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
										<input
											className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
											value={title}
											onChange={e => setTitle(e.target.value)}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description (optional)</label>
										<textarea
											className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
											value={description}
											onChange={e => setDescription(e.target.value)}
										/>
									</div>

									<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
										<div>
											<label className="text-sm font-medium text-slate-700 dark:text-slate-200">Make this quiz public</label>
											<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Public quizzes can be seen and taken by anyone. Private quizzes are only visible to you.</p>
										</div>
										<button
											type="button"
											onClick={() => setIsPublic(!isPublic)}
											className={`ml-4 flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
												isPublic ? 'bg-green-600' : 'bg-slate-300'
											}`}
										>
											<span
												className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
													isPublic ? 'translate-x-6' : 'translate-x-1'
												}`}
											/>
										</button>
									</div>
								</div>
							</section>

							<section className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-slate-900 dark:text-white">Questions</h2>
								</div>

								<div className="space-y-4">
									{questions.map((q, qi) => (
										<div key={qi} className="animate-fade-in-up">
											<QuestionCard
												q={q}
												qi={qi}
												onUpdateText={text => updateQuestion(qi, { text })}
												onUpdateExplanation={explanation => updateQuestion(qi, { explanation })}
												onAddOption={() => addOption(qi)}
												onUpdateOption={(oi, text) => updateOption(qi, oi, text)}
												onSetCorrect={(oi) => setCorrect(qi, oi)}
												onRemoveQuestion={() => removeQuestion(qi)}
												onRemoveOption={(oi) => removeOption(qi, oi)}
											/>
										</div>
									))}
									<div>
										<button type="button" onClick={addQuestion} className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-2xl transition text-sm">
											+ Add question
										</button>
									</div>
								</div>
							</section>

							<div className="flex items-center gap-4">
								<div className="flex-1" />
								<button type="button" onClick={() => navigate(-1)} className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition">
									Cancel
								</button>
								<button type="submit" disabled={saving} className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition disabled:opacity-60">
									{saving ? 'Saving…' : 'Save Changes'}
								</button>
							</div>

							{error && <div className="text-red-600 text-sm">{error}</div>}
						</form>
					</div>
				</div>
			</div>

			<style>{`
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(12px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in-up { animation: fadeInUp 320ms ease-out; }
			`}</style>
		</div>
	)
}
