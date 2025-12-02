import { useState, useEffect } from 'react';
import type { GitHubUser } from '../services/githubAuthService';
import {
    initiateGitHubLogin,
    getStoredUser,
    clearGitHubAuth,
} from '../services/githubAuthService';

export default function GitHubAuthButton({ className }: { className?: string }) {
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // First try server-side session
        const fetchMe = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.login) {
                        setUser({
                            id: data.id,
                            login: data.login,
                            name: data.name ?? null,
                            avatar_url: data.avatar_url ?? '',
                            email: data.email ?? null,
                        });
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                // ignore
            }

            // Fallback to client-side stored user
            const storedUser = getStoredUser();
            if (storedUser) {
                setUser(storedUser);
            }
            setLoading(false);
        };

        fetchMe();
    }, []);

    const handleLogin = () => {
        initiateGitHubLogin();
    };

    const handleLogout = async () => {
        try {
            await fetch('/auth/signout', { method: 'POST', credentials: 'include' });
        } catch { /* ignore */ }
        clearGitHubAuth();
        setUser(null);
    };

    if (loading) return <div>Loading...</div>;

    // If a className is provided, render the button using that className
    // so callers (Navbar/MobileMenu) can preserve the existing UI styles.
    if (className) {
        return (
            <div>
                {user ? (
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar_url}
                            alt={user.login}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="text-sm">
                            <div className="font-medium">{user.login}</div>
                        </div>
                        <button onClick={handleLogout} className="ml-2 text-sm px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                            Sign out
                        </button>
                    </div>
                ) : (
                    <button onClick={handleLogin} className={className}>
                        Sign In
                    </button>
                )}
            </div>
        );
    }

    return (
        <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            {user ? (
                <div>
                    <img
                        src={user.avatar_url}
                        alt={user.login}
                        style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '10px' }}
                    />
                    <span>Signed in as <b>{user.login}</b></span>
                    {user.name && <span> ({user.name})</span>}
                    <button
                        onClick={handleLogout}
                        style={{ marginLeft: 12, padding: '5px 10px' }}
                    >
                        Sign out
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleLogin}
                    style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Sign in with GitHub
                </button>
            )}
        </div>
    );
}
