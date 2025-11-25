import { useState } from 'react'
import { createQuiz } from '../services/api'
import type { CreateQuizDto, CreateQuestionDto } from '../types'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

export default function QuizCreate() {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [authorId, setAuthorId] = useState(1)
	const [questions, setQuestions] = useState<CreateQuestionDto[]>([
		{ text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
	])
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	const addQuestion = () => setQuestions(prev => [...prev, { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }])

	const updateQuestion = (index: number, q: Partial<CreateQuestionDto>) => {
		setQuestions(prev => prev.map((old, i) => i === index ? { ...old, ...q } : old))
	}

	const addOption = (qIndex: number) => {
		setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q))
	}

	const setCorrect = (qIndex: number, oIndex: number) => {
		setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIndex })) } : q))
	}

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		if (!title.trim()) return setError('Title is required')
		// minimal validation for questions
		for (const q of questions) {
			if (!q.text.trim()) return setError('Each question needs text')
			if (!q.options || q.options.length < 2) return setError('Each question needs at least two options')
			if (q.options.filter(o => o.isCorrect).length !== 1) return setError('Each question must have exactly one correct option')
		}

		const dto: CreateQuizDto = { title: title.trim(), description: description.trim(), authorId, questions }
		try {
			setSaving(true)
			const res = await createQuiz(dto)
			navigate(`/quizzes/${res.id}`)
		} catch (err: any) {
			setError(err?.body?.error || String(err))
		} finally { setSaving(false) }
	}

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Create quiz</h2>
			<form onSubmit={submit} className="space-y-4">
				<Card>
					<CardHeader>
						<div className="grid gap-3">
							<div>
								<label className="block text-sm">Title</label>
								<Input value={title} onChange={e => setTitle(e.target.value)} className="w-full" />
							</div>
							<div>
								<label className="block text-sm">Description</label>
								<Input value={description} onChange={e => setDescription(e.target.value)} className="w-full" />
							</div>
							<div>
								<label className="block text-sm">Author ID (temporary)</label>
								<Input type="number" value={authorId} onChange={e => setAuthorId(Number(e.target.value))} className="w-32" />
							</div>
						</div>
					</CardHeader>
				</Card>

				<div>
					<h3 className="font-medium">Questions</h3>
					<div className="space-y-4 mt-2">
						{questions.map((q, qi) => (
							<Card key={qi} className="p-3">
								<Input value={q.text} onChange={e => updateQuestion(qi, { text: e.target.value })} placeholder={`Question ${qi + 1}`} className="mb-2" />
								<div className="space-y-2">
									{q.options.map((o, oi) => (
										<div key={oi} className="flex items-center space-x-2">
											<input type="radio" checked={o.isCorrect} onChange={() => setCorrect(qi, oi)} />
											<Input value={o.text} onChange={e => {
												const newOptions = q.options.map((oo, oj) => oj === oi ? { ...oo, text: e.target.value } : oo)
												updateQuestion(qi, { options: newOptions })
											}} placeholder={`Option ${oi + 1}`} className="flex-1" />
										</div>
									))}
									<div>
										<Button type="button" variant="secondary" onClick={() => addOption(qi)}>Add option</Button>
									</div>
								</div>
							</Card>
						))}
						<div>
							<Button type="button" onClick={addQuestion}>Add question</Button>
						</div>
					</div>
				</div>

				{error && <div className="text-red-600">{error}</div>}

				<div>
					<Button disabled={saving}>{saving ? 'Saving…' : 'Create quiz'}</Button>
				</div>
			</form>
		</div>
	)
}
