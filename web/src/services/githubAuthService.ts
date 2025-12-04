/**
 * GitHub OAuth2 Service (LEGACY - Use authService instead)
 * This service is deprecated. Use the centralized authService for all auth operations.
 *
 * Kept for backward compatibility only. All new code should use authService.ts
 */

import { getGitHubAuthUrl } from '../githubOAuthConfig'

export interface GitHubUser {
	id: number
	login: string
	name: string | null
	avatar_url: string
	email: string | null
}

/**
 * @deprecated Use authService.getCurrentUser() instead
 */
export const getStoredUser = (): GitHubUser | null => {
	// User state is now managed by the backend; localStorage is not used
	return null
}

/**
 * @deprecated User data is managed by the backend
 */
export const storeUser = (_user: GitHubUser) => {
	// No-op: user state is managed by the backend
	console.warn('storeUser is deprecated. User state is managed by the backend.')
}

/**
 * @deprecated User data is managed by the backend
 */
export const clearGitHubAuth = () => {
	// No-op: user state is managed by the backend
	console.warn('clearGitHubAuth is deprecated. Use authService.logout() instead.')
}

/**
 * @deprecated Use authService.initiateGitHubLogin() instead
 */
export const initiateGitHubLogin = () => {
	window.location.href = getGitHubAuthUrl()
}
