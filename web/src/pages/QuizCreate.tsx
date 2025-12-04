import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CreateQuizDto } from '../types'
import { quizService, authService } from '../services'
import { useAuth } from '../context/AuthContext'

type Option = { text: string; isCorrect?: boolean }
type Q = { text: string; options: Option[]; explanation?: string }

function IconTrash() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
    )
}

function OptionRow({ option, qi, oi, onText, onSetCorrect, onRemove, disableRemove, hasError, errorMessage }: {
    option: Option
    qi: number
    oi: number
    onText: (text: string) => void
    onSetCorrect: () => void
    onRemove: () => void
    disableRemove: boolean
    hasError?: boolean
    errorMessage?: string
}) {
    return (
        <div>
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                hasError 
                    ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400' 
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}>
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
                    className={`flex-1 bg-white dark:bg-slate-900 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition text-sm ${
                        hasError
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-200'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-200'
                    }`}
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
            {errorMessage && (
                <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            )}
        </div>
    )
}

function QuestionCard({ q, qi, onUpdateText, onAddOption, onUpdateOption, onSetCorrect, onRemoveQuestion, onRemoveOption, onUpdateExplanation, validationErrors }: {
    q: Q
    qi: number
    onUpdateText: (text: string) => void
    onAddOption: () => void
    onUpdateOption: (oi: number, text: string) => void
    onSetCorrect: (oi: number) => void
    onRemoveQuestion: () => void
    onRemoveOption: (oi: number) => void
    onUpdateExplanation: (text: string) => void
    validationErrors: string[]
}) {
    // Find all errors for this question
    const questionErrors = validationErrors.filter(err => err.startsWith(`Question ${qi + 1}:`))
    const isThisQuestionInError = questionErrors.length > 0

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 space-y-4 transform transition hover:shadow-xl ${
            isThisQuestionInError ? 'ring-2 ring-red-400' : ''
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Question {qi + 1}</label>
                    <input
                        value={q.text}
                        onChange={e => onUpdateText(e.target.value)}
                        placeholder="Enter your question"
                        className={`mt-1 w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 text-sm transition ${
                            validationErrors.some(e => e.startsWith(`Question ${qi + 1}: Enter question text`))
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-200'
                                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-200'
                        }`}
                    />
                    {validationErrors.find(e => e.startsWith(`Question ${qi + 1}: Enter question text`)) && (
                        <p className="mt-1 text-xs text-red-600">Enter question text</p>
                    )}
                </div>
                <div className="ml-2 flex-shrink-0">
                    <button type="button" onClick={onRemoveQuestion} className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:shadow transition">
                        Delete
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {q.options.map((o, oi) => {
                    // Check if this option has an error
                    const optionError = questionErrors.find(err => err.endsWith(`Option ${oi + 1}`))
                    // Extract just the "Fill in Option X" part
                    const errorMessage = optionError?.split(': ')[1]
                    return (
                        <OptionRow
                            key={oi}
                            option={o}
                            qi={qi}
                            oi={oi}
                            onText={text => onUpdateOption(oi, text)}
                            onSetCorrect={() => onSetCorrect(oi)}
                            onRemove={() => onRemoveOption(oi)}
                            disableRemove={q.options.length <= 2}
                            hasError={!!optionError}
                            errorMessage={errorMessage}
                        />
                    )
                })}
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mt-2">Explanation (shown after quiz is completed)</label>
                <textarea
                    value={q.explanation ?? ''}
                    onChange={e => onUpdateExplanation(e.target.value)}
                    placeholder="Explanation (shown after quiz is completed)"
                    className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
            </div>
        </div>
    )
}

export default function QuizCreate() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const [questions, setQuestions] = useState<Q[]>([
        { text: '', options: [{ text: '', isCorrect: true }, { text: '' }], explanation: '' }
    ])
    const [errors, setErrors] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        setCheckingAuth(false)
    }, [user])

    function addQuestion() {
        setQuestions(s => [...s, { text: '', options: [{ text: '', isCorrect: true }, { text: '' }], explanation: '' }])
    }

    function removeQuestion(i: number) {
        setQuestions(s => s.filter((_, idx) => idx !== i))
    }

    function updateQuestion(i: number, patch: Partial<Q>) {
        setQuestions(s => s.map((q, idx) => idx === i ? { ...q, ...patch } : q))
    }

    function addOption(qi: number) {
        setErrors([])
        setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: [...q.options, { text: '' }] } : q))
    }

    function setCorrect(qi: number, oi: number) {
        setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) } : q))
    }

    function updateOption(qi: number, oi: number, text: string) {
        setErrors([])
        setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? { ...o, text } : o) } : q))
    }

    function removeOption(qi: number, oi: number) {
        setErrors([])
        setQuestions(s => s.map((q, i) => i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q))
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        const newErrors: string[] = []
        if (!title.trim()) newErrors.push('Title: Please enter a quiz title')
        if (!questions.length) return setErrors(['Add at least one question'])
        for (let qi = 0; qi < questions.length; qi++) {
            const q = questions[qi]
            if (!q.text.trim()) newErrors.push(`Question ${qi + 1}: Enter question text`)
            if (!q.options || q.options.length < 2) return setErrors(['Each question needs at least two options'])
            for (let oi = 0; oi < q.options.length; oi++) {
                if (!q.options[oi].text.trim()) newErrors.push(`Question ${qi + 1}: Fill in Option ${oi + 1}`)
            }
            if (q.options.filter(x => x.isCorrect).length !== 1) return setErrors(['Each question must have exactly one correct option'])
        }
        if (newErrors.length > 0) return setErrors(newErrors)

        const dto: CreateQuizDto = {
            title: title.trim(),
            description: description.trim(),
            isPublic: isPublic,
            questions: questions.map(q => ({ text: q.text, explanation: q.explanation ?? '', options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) }))
        }
		try {
			setSaving(true)
			const created = await quizService.createQuiz(dto)
			navigate(`/quizzes/${created.id}`)
		} catch (err: any) {
			setErrors([String(err)])
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
                                            className={`mt-1 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-sm transition ${
                                                errors.some(e => e.startsWith('Title:'))
                                                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-200'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-200'
                                            }`}
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                        />
                                        {errors.find(e => e.startsWith('Title:')) && (
                                            <p className="mt-1 text-xs text-red-600">Please enter a quiz title</p>
                                        )}
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
                                                onAddOption={() => addOption(qi)}
                                                onUpdateOption={(oi, text) => updateOption(qi, oi, text)}
                                                onSetCorrect={(oi) => setCorrect(qi, oi)}
                                                onRemoveQuestion={() => removeQuestion(qi)}
                                                onRemoveOption={(oi) => removeOption(qi, oi)}
                                                onUpdateExplanation={(text) => updateQuestion(qi, { explanation: text })}
                                                validationErrors={errors}
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
                                    {checkingAuth ? (
                                        <button disabled className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-slate-500 rounded-xl transition">Checking auth…</button>
                                    ) : user ? (
                                        <button type="submit" disabled={saving} className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition disabled:opacity-60">
                                            {saving ? 'Saving…' : 'Save quiz'}
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => authService.initiateGitHubLogin('/quiz-creation/create')} className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition">
                                                Sign in with GitHub
                                            </button>
                                            <button disabled className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl opacity-50 cursor-not-allowed">Save quiz</button>
                                        </div>
                                    )}
                            </div>

                            {errors.length > 0 && !errors[0].includes('Question') && (
                                <div className="text-red-600">{errors[0]}</div>
                            )}
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
