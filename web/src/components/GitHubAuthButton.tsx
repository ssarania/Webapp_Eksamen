import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { initiateGitHubLogin } from '../services/githubAuthService';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { getGradientForUser } from './ProfilePictureSelector';

const DEFAULT_PROFILE_PICTURES = [
  { id: 'scholar', emoji: '🎓' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'brain', emoji: '🧠' },
]

const COLOR_PRESETS = [
  { id: 'blue-purple', label: 'Blue to Purple', banner: 'from-blue-600 to-purple-600', frame: 'from-blue-600 to-purple-600' },
  { id: 'purple-pink', label: 'Purple to Pink', banner: 'from-purple-600 to-pink-600', frame: 'from-purple-600 to-pink-600' },
  { id: 'green-teal', label: 'Green to Teal', banner: 'from-green-600 to-teal-600', frame: 'from-green-600 to-teal-600' },
  { id: 'orange-red', label: 'Orange to Red', banner: 'from-orange-600 to-red-600', frame: 'from-orange-600 to-red-600' },
  { id: 'indigo-blue', label: 'Indigo to Blue', banner: 'from-indigo-600 to-blue-600', frame: 'from-indigo-600 to-blue-600' },
  { id: 'pink-rose', label: 'Pink to Rose', banner: 'from-pink-600 to-rose-600', frame: 'from-pink-600 to-rose-600' },
]

export default function GitHubAuthButton({ className }: { className?: string }) {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedProfilePicture, setSelectedProfilePicture] = useState<string | null>(() => {
        const stored = localStorage.getItem('selected_profile_picture')
        return stored && stored !== '' ? stored : null
    })
    const [selectedColor, setSelectedColor] = useState<string>(() => {
        return localStorage.getItem('profile_color') || 'blue-purple'
    })

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'selected_profile_picture') {
                setSelectedProfilePicture(e.newValue)
            }
            if (e.key === 'profile_color') {
                setSelectedColor(e.newValue || 'blue-purple')
            }
        }
        const handleColorChanged = () => {
            setSelectedColor(localStorage.getItem('profile_color') || 'blue-purple')
            setSelectedProfilePicture(localStorage.getItem('selected_profile_picture'))
        }
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('profile-color-changed', handleColorChanged)
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('profile-color-changed', handleColorChanged)
        }
    }, [])

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

    const getColorClasses = () => {
        const color = COLOR_PRESETS.find(c => c.id === selectedColor) || COLOR_PRESETS[0]
        return color.frame
    }

    const getProfilePictureEmoji = () => {
        if (selectedProfilePicture) {
            const picture = DEFAULT_PROFILE_PICTURES.find(p => p.id === selectedProfilePicture)
            return picture?.emoji || null
        }
        return null
    }

    const renderAvatar = (size: 'small' | 'medium' = 'small') => {
        const emoji = getProfilePictureEmoji()
        const sizeClasses = size === 'small' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-xl'
        
        if (emoji) {
            // Custom emoji avatar
            return (
                <div key={`header-avatar-${selectedColor}`} className={`${sizeClasses} rounded-full bg-gradient-to-br ${getColorClasses()} flex items-center justify-center transition-all duration-300`}>
                    {emoji}
                </div>
            )
        } else if (user) {
            // Gradient with first letter
            const displayName = user.name || user.login
            const firstLetter = displayName.charAt(0).toUpperCase()
            const gradient = getGradientForUser(displayName)
            
            return (
                <div 
                    className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white transition-all duration-300`}
                    style={{ background: gradient }}
                >
                    {firstLetter}
                </div>
            )
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
                                {renderAvatar('small')}
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
                        <Link to="/profile" className="inline-flex items-center gap-2.5 no-underline text-inherit cursor-pointer">
                            {renderAvatar('medium')}
                            <span>Signed in as <b>{user.login}</b></span>
                            {user.name && <span> ({user.name})</span>}
                        </Link>
                        <Link to="/profile" className="inline-block ml-3 px-2.5 py-1.25 bg-blue-600 text-white no-underline rounded cursor-pointer hover:bg-blue-700 transition-colors">
                            Profile
                        </Link>
                        <button
                            onClick={handleLogoutClick}
                            className="ml-3 px-2.5 py-1.25 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="px-4 py-2 bg-slate-900 text-white border-none rounded cursor-pointer hover:bg-slate-800 transition-colors"
                    >
                        Sign in with GitHub
                    </button>
                )}
            </div>
        </>
    );
}
