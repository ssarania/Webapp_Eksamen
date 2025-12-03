import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { initiateGitHubLogin } from '../services/githubAuthService';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';

const DEFAULT_PROFILE_PICTURES = [
  { id: 'scholar', emoji: '🎓' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'brain', emoji: '🧠' },
]

export default function GitHubAuthButton({ className }: { className?: string }) {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedProfilePicture] = useState<string | null>(() => {
        return localStorage.getItem('selected_profile_picture')
    })

    useEffect(() => {
        if (showConfirm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showConfirm]);

    const handleLogin = () => {
        initiateGitHubLogin();
    };

    const handleLogoutClick = () => {
        setShowConfirm(true);
    };

    const confirmLogout = async () => {
        setShowConfirm(false);
        try {
            await fetch('/auth/signout', { method: 'POST', credentials: 'include' });
        } catch { /* ignore */ }
        logout();
        navigate('/');
    };

    const cancelLogout = () => {
        setShowConfirm(false);
    };

    const getProfilePictureEmoji = () => {
        if (selectedProfilePicture) {
            const picture = DEFAULT_PROFILE_PICTURES.find(p => p.id === selectedProfilePicture)
            return picture?.emoji || '👤'
        }
        return null
    }

    if (loading) return <div>Loading...</div>;

    // Confirmation Modal
    const ConfirmDialog = () => (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-hidden">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-sm w-full">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Sign Out?
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Are you sure you want to sign out? You'll need to sign in again to access your quizzes and dashboard.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={cancelLogout}
                        className="cursor-pointer px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmLogout}
                        className="cursor-pointer px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );

    // If a className is provided, render the button using that className
    // so callers (Navbar/MobileMenu) can preserve the existing UI styles.
    if (className) {
        return (
            <>
                {showConfirm && (
                    <Modal>
                        <ConfirmDialog />
                    </Modal>
                )}
                <div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                {selectedProfilePicture ? (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm">
                                        {getProfilePictureEmoji()}
                                    </div>
                                ) : (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.login}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <div className="text-sm">
                                    <div className="font-medium">{user.login}</div>
                                </div>
                            </Link>
                            <button onClick={handleLogoutClick} className="cursor-pointer text-sm px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLogin} className={className + " cursor-pointer"}>
                            Sign In
                        </button>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            {showConfirm && (
                <Modal>
                    <ConfirmDialog />
                </Modal>
            )}
            <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                {user ? (
                    <div>
                        <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            {selectedProfilePicture ? (
                                <div style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #9333ea)', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                    {getProfilePictureEmoji()}
                                </div>
                            ) : (
                                <img
                                    src={user.avatar_url}
                                    alt={user.login}
                                    style={{ width: 40, height: 40, borderRadius: '50%' }}
                                />
                            )}
                            <span>Signed in as <b>{user.login}</b></span>
                            {user.name && <span> ({user.name})</span>}
                        </Link>
                        <Link to="/profile" style={{ marginLeft: 12, padding: '5px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                            Profile
                        </Link>
                        <button
                            onClick={handleLogoutClick}
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
        </>
    );
}
