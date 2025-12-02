// GitHub OAuth2 Configuration
// Get these values from https://github.com/settings/developers -> OAuth Apps -> New OAuth App

export const githubOAuthConfig = {
    clientId: 'Ov23li6GxfGz0TAJZgrv', // Provided when you create an OAuth app on GitHub
    // For server-side callback flow the redirect should point to the backend
    // Make sure your GitHub OAuth app sets this callback URL too
        redirectUri: 'http://localhost:5093/auth/github/callback',
    scope: 'user:email', // Scopes: user:email, read:user, etc.
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
};

// Build the authorization URL
export const getGitHubAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: githubOAuthConfig.clientId,
        redirect_uri: githubOAuthConfig.redirectUri,
        scope: githubOAuthConfig.scope,
        allow_signup: 'true',
    });
    return `${githubOAuthConfig.authorizationUrl}?${params.toString()}`;
};
