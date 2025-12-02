import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CreateQuizDto } from '../types'
import { createQuiz as createLocalQuiz } from '../lib/storage'
import api from '../services/api'

type Option = { text: string; isCorrect?: boolean }
type Q = { text: string; options: Option[] }

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
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-200"
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
                className="p-2 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-40"
                aria-label="Remove option"
            >
                <IconTrash />
            </button>
        </div>
    )
}

function QuestionCard({ q, qi, onUpdateText, onAddOption, onUpdateOption, onSetCorrect, onRemoveQuestion, onRemoveOption }: {
    q: Q
    qi: number
    onUpdateText: (text: string) => void
    onAddOption: () => void
    onUpdateOption: (oi: number, text: string) => void
    onSetCorrect: (oi: number) => void
    onRemoveQuestion: () => void
    onRemoveOption: (oi: number) => void
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 space-y-4 transform transition hover:shadow-xl">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Question {qi + 1}</label>
                    <input
                        value={q.text}
                        onChange={e => onUpdateText(e.target.value)}
                        placeholder="Enter your question"
                        className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm transition"
                    />
                </div>
                <div className="ml-2 flex-shrink-0">
                    <button type="button" onClick={onRemoveQuestion} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:shadow transition">
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
                <button
                    type="button"
                    onClick={onAddOption}
                    disabled={q.options.length >= 4}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:shadow-md transition text-sm"
                >
                    + Add option
                </button>
                <div className="text-sm text-slate-500">{q.options.length} options</div>
            </div>
        </div>
    )
}

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
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-gradient-to-r from-white/40 via-blue-50/60 to-white/40 dark:from-slate-900/40 dark:via-slate-900/30 rounded-3xl p-8 shadow-2xl">
                    <div className="max-w-3xl mx-auto">
                        <header className="text-center mb-6">
                            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Create a new Quiz</h1>
                            <p className="mt-2 text-slate-600">Design questions, add options, and create your quiz in minutes</p>
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
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Questions</h2>
                                    <div>
                                        <button type="button" onClick={addQuestion} className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-2xl transition text-sm">
                                            + Add question
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {questions.map((q, qi) => (
                                        <div key={qi} className="animate-fade-in-up">
                                            <QuestionCard
                                                q={q}
                                                qi={qi}
                                                onUpdateText={text => updateQuestion(qi, { text })}
                                                onAddOption={() => addOption(qi)}
                                                onUpdateOption={(oi, text) => updateOption(qi, oi, text)}
                                                onSetCorrect={(oi) => setCorrect(qi, oi)}
                                                onRemoveQuestion={() => removeQuestion(qi)}
                                                onRemoveOption={(oi) => removeOption(qi, oi)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="flex items-center gap-4">
                                <div className="flex-1" />
                                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition disabled:opacity-60">
                                    {saving ? 'Saving…' : 'Save quiz'}
                                </button>
                            </div>

                            {error && <div className="text-red-600">{error}</div>}
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
