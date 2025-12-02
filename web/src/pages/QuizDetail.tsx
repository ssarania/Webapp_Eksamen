import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getQuizById, saveAttempt } from '../lib/storage'
import type { QuizDetail as QuizDetailType } from '../types'

export default function QuizDetail() {
	const { id } = useParams()
	const [quiz, setQuiz] = useState<QuizDetailType | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [answers, setAnswers] = useState<Record<number, number | null>>({})
	const [submitted, setSubmitted] = useState(false)
	const [score, setScore] = useState<number | null>(null)

	useEffect(() => {
		if (!id) return
		const q = getQuizById(id)
		if (!q) setError('Quiz not found')
		setQuiz(q)
	}, [id])

	if (!quiz) return <div className="text-slate-600">Loading or not found</div>

	function selectOption(questionId: number, optionId: number) {
		setAnswers(a => ({ ...a, [questionId]: optionId }))
	}

	function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!quiz) return
		let correct = 0
		quiz.questions.forEach(q => {
			const selected = answers[q.id] ?? null
			const found = q.options.find(o => o.isCorrect)
			if (found && selected === found.id) correct += 1
		})
		setScore(correct)
		setSubmitted(true)

		saveAttempt({ quizId: quiz.id, quizTitle: quiz.title, score: correct, total: quiz.questions.length, answers: quiz.questions.map(q => ({ questionId: q.id, selectedOptionId: answers[q.id] ?? null })) })
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{quiz.title}</h1>
					<p className="text-sm text-slate-500">{quiz.description}</p>
				</div>
				<Link to="/quizzes" className="text-sm text-blue-600">Back to list</Link>
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				{quiz.questions.map((q, i) => (
					<fieldset key={q.id} className="bg-white p-4 rounded shadow">
						<legend className="font-medium">{i + 1}. {q.text}</legend>
						<div className="mt-2 space-y-2">
							{q.options.map(o => (
								<label key={o.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${submitted ? (o.isCorrect ? 'bg-green-50' : '') : 'hover:bg-slate-50'}`}>
									<input name={`q-${q.id}`} type="radio" checked={answers[q.id] === o.id} disabled={submitted} onChange={() => selectOption(q.id, o.id)} />
									<span className="text-sm">{o.text}</span>
								</label>
							))}
						</div>
					</fieldset>
				))}

				{!submitted && <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit answers</button>}

				{submitted && score !== null && (
					<div className="bg-white p-4 rounded shadow">
						<h3 className="font-semibold">Results</h3>
						<p className="mt-2">You scored <span className="font-bold">{score}</span> out of {quiz.questions.length} ({Math.round((score / quiz.questions.length) * 100)}%)</p>
						<div className="mt-3 flex gap-3">
							<Link to="/quizzes" className="text-sm text-blue-600">Back to quizzes</Link>
							<button type="button" onClick={() => { setSubmitted(false); setAnswers({}); setScore(null) }} className="text-sm text-slate-600">Retake</button>
						</div>
					</div>
				)}
			</form>
		</div>
	)
}
