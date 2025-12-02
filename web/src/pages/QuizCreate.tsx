import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CreateQuizDto } from '../types'
import { createQuiz as createLocalQuiz } from '../lib/storage'
import api from '../services/api'

type Option = { text: string; isCorrect?: boolean }
type Q = { text: string; options: Option[] }

export default function QuizCreate() {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [questions, setQuestions] = useState<Q[]>([
		{ text: 'Untitled question', options: [{ text: 'Option 1', isCorrect: true }, { text: 'Option 2' }] }
	])
	const [error, setError] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const navigate = useNavigate()

	function addQuestion() {
		setQuestions(s => [...s, { text: '', options: [{ text: '', isCorrect: true }, { text: '' }] }])
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
			isPublic: false,
			questions: questions.map(q => ({ text: q.text, options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) }))
		}
		try {
			setSaving(true)
			// Try server-side create, fall back to local storage
			try {
				const created = await api.createQuiz(dto)
				navigate(`/quizzes/${created.id}`)
			} catch {
				const created = createLocalQuiz(dto as any)
				navigate(`/quizzes/${created.id}`)
			}
		} catch (err: any) {
			setError(String(err))
		} finally { setSaving(false) }
	}

	return (
		<div className="space-y-6">
			<header className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold">Create a new quiz</h1>
					<p className="text-slate-600">Build interactive quizzes with questions and options. Save locally in your browser.</p>
				</div>
			</header>

			<form onSubmit={onSubmit} className="space-y-6">
				<div className="bg-white p-4 rounded shadow">
					<label className="block text-sm font-medium">Title</label>
					<input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
					<label className="block text-sm font-medium mt-3">Description (optional)</label>
					<textarea className="mt-1 w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
				</div>

				<div className="space-y-4">
					{questions.map((q, qi) => (
						<div key={qi} className="bg-white p-4 rounded shadow">
							<div className="flex justify-between items-start">
								<div className="w-full">
									<label className="text-sm font-medium">Question {qi + 1}</label>
									<input className="mt-1 w-full border rounded px-3 py-2" value={q.text} onChange={e => updateQuestion(qi, { text: e.target.value })} />
								</div>
								<div className="ml-3">
									<button type="button" onClick={() => removeQuestion(qi)} className="text-sm text-red-600">Remove</button>
								</div>
							</div>

							<div className="mt-3 space-y-2">
								{q.options.map((o, oi) => (
									<div key={oi} className="flex items-center gap-2">
										<input type="radio" checked={!!o.isCorrect} onChange={() => setCorrect(qi, oi)} />
										<input className="flex-1 border rounded px-2 py-1" value={o.text} onChange={e => updateOption(qi, oi, e.target.value)} />
									</div>
								))}
								<div>
									<button type="button" onClick={() => addOption(qi)} className="text-sm text-blue-600">+ Add option</button>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="flex gap-3">
					<button type="button" onClick={addQuestion} className="px-4 py-2 bg-slate-100 rounded">+ Add question</button>
					<div className="flex-1" />
					<button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving…' : 'Save quiz'}</button>
				</div>

				{error && <div className="text-red-600">{error}</div>}
			</form>
		</div>
	)
}
