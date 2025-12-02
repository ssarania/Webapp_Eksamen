import { useEffect, useState } from 'react'
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
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded shadow">
					<div className="text-sm text-slate-500">Quizzes</div>
					<div className="text-2xl font-bold">{totalQuizzes}</div>
				</div>
				<div className="bg-white p-4 rounded shadow">
					<div className="text-sm text-slate-500">Attempts</div>
					<div className="text-2xl font-bold">{totalAttempts}</div>
				</div>
				<div className="bg-white p-4 rounded shadow">
					<div className="text-sm text-slate-500">Recent activity</div>
					<div className="text-lg">{recent.length} items</div>
				</div>
			</div>

			<section className="grid md:grid-cols-2 gap-4">
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold">Recent attempts</h3>
					<ul className="mt-3 space-y-2 text-sm">
						{recent.length === 0 && <li className="text-slate-600">No attempts yet</li>}
						{recent.map(a => (
							<li key={a.id} className="flex justify-between">
								<div>
									<div className="font-medium">{a.quizTitle}</div>
									<div className="text-xs text-slate-500">{new Date(a.timestamp).toLocaleString()}</div>
								</div>
								<div className="text-sm">{a.score}/{a.total}</div>
							</li>
						))}
					</ul>
				</div>

				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold">Your quizzes</h3>
					<ul className="mt-3 space-y-2 text-sm">
						{quizzes.slice(0, 6).map(q => (
							<li key={q.id} className="flex justify-between">
								<div>
									<div className="font-medium">{q.title}</div>
									<div className="text-xs text-slate-500">{q.questionCount} questions</div>
								</div>
								<div className="text-xs text-slate-500">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}</div>
							</li>
						))}
						{quizzes.length === 0 && <li className="text-slate-600">No quizzes yet</li>}
					</ul>
				</div>
			</section>
		</div>
	)
}
