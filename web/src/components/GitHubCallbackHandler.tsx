import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storeUser } from '../services/githubAuthService';

export default function GitHubCallbackHandler() {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');

            if (!code) {
                setError('No authorization code provided');
                setLoading(false);
                return;
            }

            try {
                // Exchange code for token
                const response = await fetch('/api/auth/github/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    const detail = await response.text();
                    throw new Error(`Failed to authenticate: ${detail}`);
                }

                const data = await response.json();
                console.log('Authentication successful:', data);
                
                // Store user info for display (authentication is via secure cookie)
                if (data.user) {
                    console.log('Storing user info:', data.user);
                    storeUser(data.user);
                }

                console.log('Redirecting to home...');
                // Redirect to home page
                window.location.href = '/';
            } catch (err) {
                console.error('Authentication error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
                setLoading(false);
            }
        };

        handleCallback();
    }, [searchParams]);

    if (loading) return <div>Signing you in...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return null;
}
