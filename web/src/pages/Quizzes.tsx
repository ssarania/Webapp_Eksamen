import { useEffect, useState } from 'react'
import { getQuizzes, deleteQuiz } from '../services/api'
import type { QuizSummary } from '../types'
import QuizCard from '../components/QuizCard'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

export default function Quizzes() {
	const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
	const [filter, setFilter] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		setLoading(true)
		getQuizzes()
			.then(data => setQuizzes(data))
			.catch(err => setError(err?.body?.error || String(err)))
			.finally(() => setLoading(false))
	}, [])

	const onDelete = async (id: number) => {
		if (!confirm('Delete this quiz?')) return
		try {
			await deleteQuiz(id)
			setQuizzes(prev => prev.filter(q => q.id !== id))
		} catch (e: any) {
			alert('Failed to delete: ' + (e?.body?.error || e))
		}
	}

	const filtered = quizzes.filter(q => (q.title + ' ' + (q.authorName ?? '')).toLowerCase().includes(filter.toLowerCase()))

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Quizzes</h2>
				<Link to="/quiz-creation/create">
					<Button>Create quiz</Button>
				</Link>
			</div>

			<Card className="mb-4">
				<CardContent className="p-4">
					<div className={cn('flex gap-2')}>
						<Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search by title or author" />
					</div>
				</CardContent>
			</Card>

			{loading && <div className="text-slate-600">Loading…</div>}
			{error && <div className="text-red-600">Error: {error}</div>}

			<div className="grid gap-3">
				{filtered.map(q => (
					<QuizCard key={q.id} quiz={q} onDelete={onDelete} />
				))}
				{filtered.length === 0 && !loading && <div className="text-slate-600">No quizzes found.</div>}
			</div>
		</div>
	)
}
