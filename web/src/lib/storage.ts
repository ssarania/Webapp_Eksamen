import type { QuizDetail, CreateQuizDto, QuizSummary } from '../types'

export interface Attempt {
	id: number
	quizId: number
	quizTitle: string
	score: number
	total: number
	timestamp: string
	answers: { questionId: number; selectedOptionId: number | null }[]
}

const QUIZ_KEY = 'quiz_app.quizzes'
const ATTEMPT_KEY = 'quiz_app.attempts'

function nowIso() { return new Date().toISOString() }

function read<T>(key: string): T | null {
	try {
		const raw = localStorage.getItem(key)
		return raw ? JSON.parse(raw) as T : null
	} catch {
		return null
	}
}

function write<T>(key: string, value: T) {
	localStorage.setItem(key, JSON.stringify(value))
}

export function loadQuizzes(): QuizDetail[] {
	const stored = read<QuizDetail[]>(QUIZ_KEY)
	if (stored && Array.isArray(stored)) return stored
	const sample: QuizDetail[] = [
		{
			id: 1,
			title: 'Sample: Basic JavaScript',
			description: 'A short quiz to test JS basics.',
			authorId: 0,
			authorName: 'System',
			createdAt: nowIso(),
			questions: [
				{
					id: 1, text: 'Which of these is a primitive?', order: 0, options: [
						{ id: 1, text: 'String' },
						{ id: 2, text: 'Array' },
						{ id: 3, text: 'Function' },
					]
				},
				{
					id: 2, text: 'Which keyword declares a constant?', order: 1, options: [
						{ id: 1, text: 'let' },
						{ id: 2, text: 'var' },
						{ id: 3, text: 'const' },
					]
				},
			]
		}
	]
	write(QUIZ_KEY, sample)
	return sample
}

export function saveQuizzes(quizzes: QuizDetail[]) {
	write(QUIZ_KEY, quizzes)
}

export function getQuizSummaries(): QuizSummary[] {
	const q = loadQuizzes()
	return q.map(z => ({ id: z.id, title: z.title, description: z.description ?? '', authorId: z.authorId ?? null, authorName: z.authorName ?? null, createdAt: z.createdAt, questionCount: z.questions?.length ?? 0 }))
}

export function getQuizById(id: number | string): QuizDetail | null {
	const q = loadQuizzes()
	const nid = typeof id === 'string' ? Number(id) : id
	return q.find(x => x.id === nid) ?? null
}

export function createQuiz(dto: CreateQuizDto): QuizDetail {
	const quizzes = loadQuizzes()
	const nextId = quizzes.length ? Math.max(...quizzes.map(q => q.id)) + 1 : 1
	let qNext = 1
	const questions = dto.questions.map((qq): any => {
		const opts = qq.options.map((o, oi) => ({ id: oi + 1, text: o.text, isCorrect: !!o.isCorrect }))
		return { id: qNext++, text: qq.text, order: 0, options: opts, explanation: qq.explanation ?? '' }
	})
	const created: QuizDetail = { id: nextId, title: dto.title, description: dto.description ?? '', authorId: 0, authorName: undefined, createdAt: nowIso(), questions }
	quizzes.push(created)
	saveQuizzes(quizzes)
	return created
}

export function deleteQuiz(id: number) {
	const quizzes = loadQuizzes().filter(q => q.id !== id)
	saveQuizzes(quizzes)
}

export function loadAttempts(): Attempt[] {
	const stored = read<Attempt[]>(ATTEMPT_KEY)
	return stored && Array.isArray(stored) ? stored : []
}

export function saveAttempt(attempt: Omit<Attempt, 'id' | 'timestamp'>) {
	const list = loadAttempts()
	const nextId = list.length ? Math.max(...list.map(a => a.id)) + 1 : 1
	const full: Attempt = { ...attempt, id: nextId, timestamp: nowIso() }
	list.unshift(full)
	write(ATTEMPT_KEY, list)
	return full
}
