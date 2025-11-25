import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getQuizById } from '../services/api'
import type { QuizDetail as QuizDetailType } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function QuizDetail() {
	const { id } = useParams()
	const [quiz, setQuiz] = useState<QuizDetailType | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return
		setLoading(true)
		getQuizById(id)
			.then(setQuiz)
			.catch(err => setError(err?.body?.error || String(err)))
			.finally(() => setLoading(false))
	}, [id])

	if (loading) return <div>Loading…</div>
	if (error) return <div className="text-red-600">Error: {error}</div>
	if (!quiz) return <div>No quiz found.</div>

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">{quiz.title}</h2>
				<Link to="/quizzes">
					<Button variant="ghost" size="sm">Back</Button>
				</Link>
			</div>

			<Card className="mb-4">
				<CardHeader>
					<CardTitle>{quiz.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-2 text-slate-600">{quiz.description}</p>
					<p className="text-xs text-muted-foreground mb-4">By {quiz.authorName ?? 'Unknown'}</p>

					<div className="space-y-4">
						{quiz.questions.map(q => (
							<Card key={q.id} className="p-4">
								<div className="font-medium">{q.order != null ? `${q.order + 1}. ` : ''}{q.text}</div>
								<ul className="mt-2 list-disc pl-5 text-sm">
									{q.options.map(o => (
										<li key={o.id}>{o.text}</li>
									))}
								</ul>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
