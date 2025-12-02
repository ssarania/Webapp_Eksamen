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
                const { accessToken, user } = await exchangeCodeForToken(code);
                
                if (user) {
                    storeToken(accessToken, user);
                }

                // Redirect to home page
                window.location.href = '/';
            } catch (err) {
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
