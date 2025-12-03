// GitHub OAuth2 Service
// Handles the OAuth flow: authorization, token exchange, and user data fetching

import { githubOAuthConfig } from '../githubOAuthConfig';

export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    email: string | null;
}

const GITHUB_USER_KEY = 'github_user';

// Get stored user info from localStorage (display purposes only)
export const getStoredUser = (): GitHubUser | null => {
    const user = localStorage.getItem(GITHUB_USER_KEY);
    return user ? JSON.parse(user) : null;
};

// Store user info in localStorage (display purposes only)
export const storeUser = (user: GitHubUser) => {
    localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(user));
};

// Clear stored user data
export const clearGitHubAuth = () => {
    localStorage.removeItem(GITHUB_USER_KEY);
};

// Initiate GitHub login
export const initiateGitHubLogin = () => {
    const authUrl = `${githubOAuthConfig.authorizationUrl}?${new URLSearchParams({
        client_id: githubOAuthConfig.clientId,
        redirect_uri: githubOAuthConfig.redirectUri,
        scope: githubOAuthConfig.scope,
        allow_signup: 'true',
    }).toString()}`;

    window.location.href = authUrl;
};
