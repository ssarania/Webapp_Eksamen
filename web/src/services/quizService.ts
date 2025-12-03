/**
 * Quiz API Service
 * Handles all quiz-related API operations including CRUD operations for quizzes and questions.
 */

import { fetchApi } from '../lib/apiClient'
import type { QuizSummary, QuizDetail, CreateQuizDto } from '../types'

/**
 * Fetch all public quizzes
 */
export async function getQuizzes(): Promise<QuizSummary[]> {
	return fetchApi<QuizSummary[]>('/quizzes')
}

/**
 * Fetch quizzes created by the current user
 */
export async function getMyQuizzes(): Promise<QuizSummary[]> {
	return fetchApi<QuizSummary[]>('/quizzes/my')
}

/**
 * Fetch a single quiz by ID
 * @param id - Quiz ID
 * @param includeAnswers - Whether to include correct answers (needed for grading)
 */
export async function getQuizById(id: string | number, includeAnswers = false): Promise<QuizDetail> {
	const query = includeAnswers ? '?includeAnswers=true' : ''
	return fetchApi<QuizDetail>(`/quizzes/${id}${query}`)
}

/**
 * Create a new quiz
 */
export async function createQuiz(dto: CreateQuizDto): Promise<{ id: number; title: string }> {
	return fetchApi<{ id: number; title: string }>('/quizzes', {
		method: 'POST',
		body: JSON.stringify(dto),
	})
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(id: number, dto: Partial<CreateQuizDto>): Promise<void> {
	return fetchApi<void>(`/quizzes/${id}`, {
		method: 'PUT',
		body: JSON.stringify(dto),
	})
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(id: number): Promise<void> {
	return fetchApi<void>(`/quizzes/${id}`, { 
		method: 'DELETE' 
	})
}

export default {
	getQuizzes,
	getMyQuizzes,
	getQuizById,
	createQuiz,
	updateQuiz,
	deleteQuiz,
}
