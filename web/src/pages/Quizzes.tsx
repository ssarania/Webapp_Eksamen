import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { deleteQuiz as deleteLocalQuiz, getQuizSummaries } from '../lib/storage'
import type { QuizSummary } from '../types'

export default function Quizzes() {
	const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
	const [filter, setFilter] = useState('')
	const [sort, setSort] = useState<'new' | 'alpha'>('new')
	const [page, setPage] = useState(1)
	const pageSize = 6

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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Quizzes</h1>
				<Link to="/quiz-create" className="px-4 py-2 bg-blue-600 text-white rounded">Create quiz</Link>
			</div>

			<div className="flex gap-3 items-center">
				<input className="border rounded px-3 py-2 flex-1" placeholder="Search quizzes by title, author or description" value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }} />
				<select value={sort} onChange={e => setSort(e.target.value as any)} className="border rounded px-2 py-2">
					<option value="new">Newest</option>
					<option value="alpha">A → Z</option>
				</select>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{pageItems.length === 0 && <div className="text-slate-600">No quizzes found.</div>}
				{pageItems.map(q => (
					<article key={q.id} className="bg-white p-4 rounded shadow">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold text-lg">{q.title}</h3>
								<p className="text-sm text-slate-500">{q.description}</p>
								<div className="mt-2 text-xs text-slate-500">{q.questionCount} questions • {q.authorName ?? 'Unknown'}</div>
							</div>
							<div className="ml-3 flex flex-col gap-2">
								<Link to={`/quizzes/${q.id}`} className="text-sm text-blue-600">Open</Link>
								<button onClick={() => handleDelete(q.id)} className="text-sm text-red-600">Delete</button>
							</div>
						</div>
					</article>
				))}
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-slate-600">Showing {filtered.length} result(s)</div>
				<div className="flex items-center gap-2">
					<button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
					<div className="px-3">{page}/{totalPages}</div>
					<button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Next</button>
				</div>
			</div>
		</div>
	)
}
