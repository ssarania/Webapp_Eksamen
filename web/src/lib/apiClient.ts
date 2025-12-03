/**
 * API Client Utilities
 * Common fetch utilities, error handling, and response parsing for API calls.
 */

import { API_BASE, API_TIMEOUT } from '../config/api'

export interface ApiError {
	status: number
	message: string
	body?: unknown
}

/**
 * Make a typed fetch request to the API
 * Handles authentication, error parsing, and timeouts
 */
export async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		}

		const response = await fetch(url, {
			...options,
			headers,
			credentials: 'include', // Include cookies for session auth
			signal: controller.signal,
		})

		clearTimeout(timeoutId)

		if (!response.ok) {
			let errorBody: unknown = null
			const contentType = response.headers.get('content-type')

			try {
				if (contentType?.includes('application/json')) {
					errorBody = await response.json()
				} else {
					errorBody = await response.text()
				}
			} catch {
				errorBody = response.statusText
			}

			const error: ApiError = {
				status: response.status,
				message: `API Error: ${response.status} ${response.statusText}`,
				body: errorBody,
			}

			throw error
		}

		// Handle 204 No Content
		if (response.status === 204) {
			return {} as T
		}

		const contentType = response.headers.get('content-type')
		if (contentType?.includes('application/json')) {
			return (await response.json()) as T
		}

		return (await response.text()) as T
	} catch (error) {
		clearTimeout(timeoutId)

		if (error instanceof TypeError && error.message === 'Failed to fetch') {
			throw {
				status: 0,
				message: 'Network error: Unable to reach the API server',
				body: error,
			} as ApiError
		}

		if (error instanceof TypeError && error.message.includes('aborted')) {
			throw {
				status: 0,
				message: `Request timeout after ${API_TIMEOUT}ms`,
				body: error,
			} as ApiError
		}

		if (error && typeof error === 'object' && 'status' in error) {
			throw error
		}

		throw {
			status: 0,
			message: 'Unknown error occurred',
			body: error,
		} as ApiError
	}
}

/**
 * Safe JSON stringify that handles circular references
 */
export function safeStringify(obj: unknown): string {
	try {
		return JSON.stringify(obj)
	} catch {
		return '[Circular or non-serializable object]'
	}
}
