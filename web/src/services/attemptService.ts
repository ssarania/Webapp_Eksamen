/**
 * Quiz Attempt API Service
 * Handles quiz attempt submissions and retrieval of attempt history.
 */

import { fetchApi } from '../lib/apiClient'

export interface QuizAnswer {
	questionId: number
	selectedOptionId: number | null
}

export interface SubmitAttemptPayload {
	quizId: number
	userId: number
	answers: QuizAnswer[]
}

export interface SubmitAttemptResponse {
	id: number
	score: number
	totalQuestions: number
	percentage: number
}

export interface AttemptRecord {
	id: number
	quizId: number
	quizTitle: string
	userId: number
	userName?: string
	score: number
	totalQuestions: number
	percentage: number
	attemptedAt: string
	completedAt?: string | null
}

/**
 * Submit a quiz attempt with answers
 */
export async function submitAttempt(payload: SubmitAttemptPayload): Promise<SubmitAttemptResponse> {
	return fetchApi<SubmitAttemptResponse>('/attempts', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

/**
 * Get all attempts for a specific user
 */
export async function getUserAttempts(userId: number): Promise<AttemptRecord[]> {
	return fetchApi<AttemptRecord[]>(`/attempts?userId=${userId}`)
}

/**
 * Get all attempts for a specific quiz
 */
export async function getQuizAttempts(quizId: number): Promise<AttemptRecord[]> {
	return fetchApi<AttemptRecord[]>(`/attempts?quizId=${quizId}`)
}

export default {
	submitAttempt,
	getUserAttempts,
	getQuizAttempts,
}
