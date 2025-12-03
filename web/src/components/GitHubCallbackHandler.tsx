import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    exchangeCodeForToken, 
    storeToken, 
} from '../services/githubAuthService';

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
                const response = await exchangeCodeForToken(code);
                console.log('Token exchange response:', response);
                const { accessToken, user } = response;
                
                // Always store the token - this is crucial for API auth
                if (accessToken) {
                    console.log('Storing access token...');
                    localStorage.setItem('github_access_token', accessToken);
                    console.log('Token stored successfully');
                    
                    // Also store user info if available
                    if (user) {
                        console.log('Storing user info:', user);
                        storeToken(accessToken, user);
                    }
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
