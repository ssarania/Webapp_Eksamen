import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import type { QuizDetail as QuizDetailType } from '../types'

// Floating background accent shapes
function FloatingShapes() {
	return (
		<div className="absolute inset-0 pointer-events-none overflow-hidden">
			<div className="absolute -top-16 -left-16 w-64 h-64 bg-gradient-to-br from-blue-300/30 to-purple-400/20 rounded-2xl blur-3xl transform rotate-12 animate-float" />
			<div className="absolute bottom-10 right-6 w-40 h-40 bg-gradient-to-tr from-pink-300/20 to-blue-300/10 rounded-2xl blur-2xl transform -rotate-6 animate-float" style={{ animationDelay: '2s' }} />
		</div>
	)
}

function ProgressBar({ value, max }: { value: number; max: number }) {
	const pct = Math.round((value / Math.max(1, max)) * 100)
	return (
		<div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
			<div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500" style={{ width: `${pct}%` }} />
		</div>
	)
}

function OptionCard({ text, selected, disabled, onClick, correct, submitted }: { text: string; selected: boolean; disabled?: boolean; onClick: () => void; correct?: boolean; submitted?: boolean }) {
	const base = 'p-4 rounded-xl border transition transform cursor-pointer select-none'
	const selectedCls = selected ? 'scale-98 shadow-xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50' : 'hover:shadow-md hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
	const resultCls = submitted ? (correct ? 'bg-green-50 border-green-400' : (selected ? 'bg-red-50 border-red-400' : 'opacity-70')) : ''
	return (
		<div
			onClick={disabled ? undefined : onClick}
			role="button"
			tabIndex={0}
			className={`${base} ${selectedCls} ${resultCls}`}
		>
			<div className="text-sm text-slate-900 dark:text-white">{text}</div>
		</div>
	)
}

function QuestionCard({ question, index, total, selectedOptionId, onSelect, submitted }: { question: any; index: number; total: number; selectedOptionId: number | null | undefined; onSelect: (optionId: number) => void; submitted: boolean }) {
	return (
		<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-3xl transform transition duration-300">
			<div className="mb-4">
				<div className="text-xs text-slate-400">Question {index + 1} of {total}</div>
				<h3 className="text-lg font-semibold text-slate-900 dark:text-white">{question.text}</h3>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
				{question.options.map((o: any) => (
					<OptionCard
						key={o.id}
						text={o.text}
						selected={selectedOptionId === o.id}
						onClick={() => onSelect(o.id)}
						disabled={submitted}
						correct={o.isCorrect}
						submitted={submitted}
					/>
				))}
			</div>
		</div>
	)
}

export default function QuizDetail() {
	const { id } = useParams()
	const [quiz, setQuiz] = useState<QuizDetailType | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [answers, setAnswers] = useState<Record<number, number | null>>({})
	const [submitted, setSubmitted] = useState(false)
	const [score, setScore] = useState<number | null>(null)
	const [current, setCurrent] = useState(0)
	const [togglingPublic, setTogglingPublic] = useState(false)

	useEffect(() => {
		if (!id) {
			setError('No quiz ID provided')
			return
		}
		let mounted = true

	async function fetchQuiz() {
		try {
			// Fetch from API
			const q = await api.getQuizById(id as string)
			if (mounted) setQuiz(q)
		} catch (err) {
			// API failed - show error
			if (mounted) setError('Failed to load quiz')
		}
	}		fetchQuiz()
		return () => { mounted = false }
	}, [id])

	if (error) return <div className="min-h-[120px] flex items-center justify-center text-red-600">{error}</div>
	if (!quiz) return <div className="min-h-[200px] flex items-center justify-center text-slate-600">Loading or not found</div>

	function selectOption(questionId: number, optionId: number) {
		setAnswers(a => ({ ...a, [questionId]: optionId }))
	}

	function goNext() {
		if (!quiz) return
		if (current >= quiz.questions.length - 1) return
		setCurrent(c => Math.min(quiz.questions.length - 1, c + 1))
	}

	function goPrev() {
		setCurrent(c => Math.max(0, c - 1))
	}

	function onSubmit(e?: React.FormEvent) {
		if (e) e.preventDefault()
		if (!quiz) return
		let correct = 0
		quiz.questions.forEach((q: any) => {
			const selected = answers[q.id] ?? null
			const found = q.options.find((o: any) => o.isCorrect)
			if (found && selected === found.id) correct += 1
		})
		setScore(correct)
		setSubmitted(true)
	}

	async function togglePublic() {
		if (!quiz) return
		setTogglingPublic(true)
		try {
			const newIsPublic = !(quiz.isPublic ?? false)
			await api.updateQuiz(quiz.id, { isPublic: newIsPublic })
			setQuiz({ ...quiz, isPublic: newIsPublic })
		} catch (err) {
			alert('Failed to update quiz visibility. Please try again.')
		} finally {
			setTogglingPublic(false)
		}
	}

	const total = quiz.questions.length
    

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-12 relative overflow-hidden">
			<FloatingShapes />

		<div className="max-w-5xl mx-auto px-4 relative z-10">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{quiz.title}</h1>
					<p className="text-sm text-slate-500">{quiz.description}</p>
					{quiz.isOwned && (
						<button
							onClick={togglePublic}
							disabled={togglingPublic}
							className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-50"
							title={quiz.isPublic ? 'Make this quiz private' : 'Make this quiz public'}
						>
							<span className={`px-3 py-1 rounded-full text-xs font-medium ${
								quiz.isPublic 
									? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
									: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
							}`}>
								{quiz.isPublic ? '🌐 Public' : '🔒 Private'}
							</span>
						</button>
					)}
				</div>
				<div className="flex items-center gap-3">
					{quiz.isOwned && (
						<Link to={`/quizzes/${quiz.id}/edit`} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-sm font-medium">
							✏️ Edit
						</Link>
					)}
					<Link to="/quizzes" className="text-sm text-blue-600">Back</Link>
				</div>
			</div>				<div className="flex flex-col items-center">
					<div className="w-full mb-6">
						<ProgressBar value={current + 1} max={total} />
					</div>

					{!submitted && (
						<form onSubmit={onSubmit} className="w-full flex flex-col items-center gap-6">
							<div className="w-full flex justify-center">
								<QuestionCard
									question={quiz.questions[current]}
									index={current}
									total={total}
									selectedOptionId={answers[quiz.questions[current].id] ?? null}
									onSelect={(oid) => selectOption(quiz.questions[current].id, oid)}
									submitted={false}
								/>
							</div>

							<div className="w-full max-w-3xl flex items-center justify-between gap-4">
								<button type="button" onClick={goPrev} disabled={current === 0} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm disabled:opacity-50">
									← Previous
								</button>

								<div className="flex-1 text-center text-sm text-slate-600">Question {current + 1} / {total}</div>

								{current < total - 1 ? (
									<button type="button" onClick={goNext} disabled={answers[quiz.questions[current].id] == null} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md disabled:opacity-50">
										Next →
									</button>
								) : (
									<button type="submit" disabled={answers[quiz.questions[current].id] == null} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md disabled:opacity-50">
										Submit
									</button>
								)}
							</div>
						</form>
					)}

					{submitted && score !== null && (
						<div className="w-full flex flex-col items-center gap-6">
							<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-3xl text-center animate-fade-in-up">
								<div className="flex items-center justify-center gap-6">
									<div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
										{Math.round((score / total) * 100)}%
									</div>
									<div className="text-left">
										<div className="text-sm text-slate-500">You scored</div>
										<div className="text-2xl font-semibold">{score} of {total} correct</div>
									</div>
								</div>

								<div className="mt-6 space-y-3 text-left">
									{quiz.questions.map((q: any) => {
										const sel = answers[q.id] ?? null
										const correct = q.options.find((o: any) => o.isCorrect)
										const isRight = !!(correct && sel === correct.id)
										return (
											<div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
												<div className={`w-6 h-6 rounded-full flex items-center justify-center ${isRight ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{isRight ? '✓' : '✕'}</div>
												<div className="flex-1">
													<div className="font-medium">{q.text}</div>
													{isRight ? (
														// Correct: show only explanation (if any)
														q.explanation ? (
															<div className="mt-1 text-sm text-slate-600">{q.explanation}</div>
														) : null
													) : (
														// Wrong: show your answer, correct answer, and explanation (if any)
														<div className="mt-1 space-y-1 text-sm text-slate-600">
															<div><strong>Your answer:</strong> {q.options.find((o: any) => o.id === sel)?.text ?? '—'}</div>
															<div><strong>Correct answer:</strong> {correct?.text ?? '—'}</div>
															{q.explanation ? <div className="mt-1">{q.explanation}</div> : null}
														</div>
													)}
												</div>
											</div>
										)
									})}
								</div>

								<div className="mt-6 flex items-center justify-center gap-4">
									<button onClick={() => { setSubmitted(false); setAnswers({}); setScore(null); setCurrent(0) }} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">Retake</button>
									<Link to="/quizzes" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">Back to quizzes</Link>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<style>{`\n                @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-18px) } }\n                .animate-float { animation: float 6s ease-in-out infinite; }\n                @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }\n                .animate-fade-in-up { animation: fadeInUp 360ms ease-out; }\n            `}</style>
		</div>
	)
}
