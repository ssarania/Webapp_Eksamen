/**
 * Attempts API wrapper
 * Provides functions for submitting and retrieving quiz attempts
 */

export interface SubmitAttemptPayload {
	quizId: number
	userId: number
	answers: Array<{
		questionId: number
		selectedOptionId: number
	}>
}

export interface SubmitAttemptResponse {
	id: number
	score: number
	totalQuestions: number
	percentage: number
	message?: string
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

async function submitAttempt(payload: SubmitAttemptPayload): Promise<SubmitAttemptResponse> {
	const response = await fetch('/api/attempts', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		throw new Error(`Failed to submit attempt: ${response.statusText}`)
	}

	return response.json()
}

async function getUserAttempts(userId: number): Promise<AttemptRecord[]> {
	const response = await fetch(`/api/attempts?userId=${userId}`, {
		credentials: 'include',
	})

	if (!response.ok) {
		throw new Error(`Failed to get user attempts: ${response.statusText}`)
	}

	return response.json()
}

const attemptsApi = { submitAttempt, getUserAttempts }
export default attemptsApi