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

export interface GitHubAuthToken {
    accessToken: string;
    user?: GitHubUser;
}

const GITHUB_TOKEN_KEY = 'github_access_token';
const GITHUB_USER_KEY = 'github_user';

// Check if token exists in localStorage
export const getStoredToken = (): string | null => {
    return localStorage.getItem(GITHUB_TOKEN_KEY);
};

// Store token in localStorage
export const storeToken = (token: string, user: GitHubUser) => {
    localStorage.setItem(GITHUB_TOKEN_KEY, token);
    localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(user));
};

// Get stored user info
export const getStoredUser = (): GitHubUser | null => {
    const user = localStorage.getItem(GITHUB_USER_KEY);
    return user ? JSON.parse(user) : null;
};

// Clear stored data
export const clearGitHubAuth = () => {
    localStorage.removeItem(GITHUB_TOKEN_KEY);
    localStorage.removeItem(GITHUB_USER_KEY);
};

// Fetch user data from GitHub API using access token
export const fetchGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch GitHub user');
    }

    return response.json();
};

// Exchange authorization code for access token (backend should do this for security)
// For this example, we'll call a backend endpoint that does the exchange
export const exchangeCodeForToken = async (code: string): Promise<GitHubAuthToken> => {
    try {
        // Call your backend to exchange code for token
        // Your backend should make the request to GitHub's token endpoint
        // This keeps the clientSecret secure
        const response = await fetch('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            // Try to read error details returned by backend
            let detail = '';
            try { detail = await response.text(); } catch { /* ignore */ }
            throw new Error(`Failed to exchange code for token: ${detail}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Token exchange error:', error);
        throw error;
    }
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
