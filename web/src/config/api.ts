/**
 * API Configuration
 * Centralized API endpoint configuration for both development and production environments.
 */

const getApiBase = (): string => {
	// In development, Vite proxy will forward /api requests to the backend
	if (import.meta.env.DEV) {
		return '/api'
	}

	// In production, determine the base URL from environment variables
	const apiUrl = import.meta.env.VITE_API_URL

	if (!apiUrl) {
		// Fallback: assume API is at the same origin
		return `${window.location.origin}/api`
	}

	return apiUrl
}

export const API_BASE = getApiBase()
export const AUTH_BASE = import.meta.env.DEV ? '/auth' : `${import.meta.env.VITE_AUTH_URL || API_BASE.replace('/api', '/auth')}`

// API timeout in milliseconds
export const API_TIMEOUT = 30000

export default {
	API_BASE,
	AUTH_BASE,
	API_TIMEOUT,
}
