import type { QuizSummary, QuizDetail, CreateQuizDto } from '../types'
import { fetchApi } from '../lib/apiClient'

export async function getQuizzes(): Promise<QuizSummary[]> {
	return fetchApi<QuizSummary[]>('/quizzes')
}

export async function getMyQuizzes(): Promise<QuizSummary[]> {
	return fetchApi<QuizSummary[]>('/quizzes/my')
}

export async function getQuizById(id: string | number, includeAnswers = false): Promise<QuizDetail> {
	const query = includeAnswers ? '?includeAnswers=true' : ''
	return fetchApi<QuizDetail>(`/quizzes/${id}${query}`)
}

export async function createQuiz(dto: CreateQuizDto) {
	return fetchApi<{ id: number; title: string }>('/quizzes', {
		method: 'POST',
		body: JSON.stringify(dto),
	})
}

export async function updateQuiz(id: number, dto: Partial<CreateQuizDto>) {
	return fetchApi<void>(`/quizzes/${id}`, {
		method: 'PUT',
		body: JSON.stringify(dto),
	})
}

export async function deleteQuiz(id: number) {
	return fetchApi<void>(`/quizzes/${id}`, { method: 'DELETE' })
}

export default { getQuizzes, getMyQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz }
