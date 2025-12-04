/**
 * GitHub OAuth2 Configuration
 * Get these values from https://github.com/settings/developers -> OAuth Apps
 */

export const githubOAuthConfig = {
	clientId: 'Ov23li6GxfGz0TAJZgrv', // GitHub OAuth App Client ID
	// Redirect to backend's callback endpoint which handles the OAuth exchange
	redirectUri: `${window.location.origin}/auth/github/callback`,
	scope: 'user:email',
	authorizationUrl: 'https://github.com/login/oauth/authorize',
	tokenUrl: 'https://github.com/login/oauth/access_token',
}

/**
 * Build the GitHub authorization URL
 * The actual OAuth flow is handled by the backend
 */
export const getGitHubAuthUrl = () => {
	const params = new URLSearchParams({
		client_id: githubOAuthConfig.clientId,
		redirect_uri: githubOAuthConfig.redirectUri,
		scope: githubOAuthConfig.scope,
		allow_signup: 'true',
	})
	return `${githubOAuthConfig.authorizationUrl}?${params.toString()}`
}
