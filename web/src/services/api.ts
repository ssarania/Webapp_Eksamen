import type { QuizSummary, QuizDetail, CreateQuizDto } from '../types'
import { getStoredToken } from './githubAuthService'

const base = 'http://localhost:5093/api'

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
	const headers: HeadersInit = { 'Content-Type': 'application/json' }
	
	// Add Bearer token if available
	const token = getStoredToken()
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}
	
	const res = await fetch(url, {
		headers,
		credentials: 'include',
		...options,
	})

	if (!res.ok) {
		const text = await res.text()
		let body: any = text
		try { body = JSON.parse(text) } catch { }
		throw { status: res.status, body }
	}

	if (res.status === 204) return {} as T
	return (await res.json()) as T
}

export async function getQuizzes(): Promise<QuizSummary[]> {
	return fetchJson<QuizSummary[]>(`${base}/quizzes`)
}

export async function getQuizById(id: string | number): Promise<QuizDetail> {
	return fetchJson<QuizDetail>(`${base}/quizzes/${id}`)
}

export async function createQuiz(dto: CreateQuizDto) {
	return fetchJson<{ id: number; title: string }>(`${base}/quizzes`, {
		method: 'POST',
		body: JSON.stringify(dto),
	})
}

export async function updateQuiz(id: number, dto: Partial<CreateQuizDto>) {
	return fetchJson<void>(`${base}/quizzes/${id}`, {
		method: 'PUT',
		body: JSON.stringify(dto),
	})
}

export async function deleteQuiz(id: number) {
	return fetchJson<void>(`${base}/quizzes/${id}`, { method: 'DELETE' })
}

export default { getQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz }
