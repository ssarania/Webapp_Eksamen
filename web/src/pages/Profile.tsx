import { useEffect, useState } from 'react'
import { getStoredUser } from '../services/githubAuthService'
import type { GitHubUser } from '../services/githubAuthService'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfilePictureSelector, { DEFAULT_PROFILE_PICTURES } from '../components/ProfilePictureSelector'
import { Modal } from '../components/Modal'

const COLOR_PRESETS = [
  { id: 'blue-purple', label: 'Blue to Purple', banner: 'from-blue-600 to-purple-600', frame: 'from-blue-600 to-purple-600' },
  { id: 'purple-pink', label: 'Purple to Pink', banner: 'from-purple-600 to-pink-600', frame: 'from-purple-600 to-pink-600' },
  { id: 'green-teal', label: 'Green to Teal', banner: 'from-green-600 to-teal-600', frame: 'from-green-600 to-teal-600' },
  { id: 'orange-red', label: 'Orange to Red', banner: 'from-orange-600 to-red-600', frame: 'from-orange-600 to-red-600' },
  { id: 'indigo-blue', label: 'Indigo to Blue', banner: 'from-indigo-600 to-blue-600', frame: 'from-indigo-600 to-blue-600' },
  { id: 'pink-rose', label: 'Pink to Rose', banner: 'from-pink-600 to-rose-600', frame: 'from-pink-600 to-rose-600' },
]

export default function Profile() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showColorSelector, setShowColorSelector] = useState(false)
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<string | null>(() => {
    return localStorage.getItem('selected_profile_picture')
  })
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    return localStorage.getItem('profile_color') || 'blue-purple'
  })
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data && data.login) {
            setUser({
              id: data.id,
              login: data.login,
              name: data.name ?? null,
              avatar_url: data.avatar_url ?? '',
              email: data.email ?? null,
            })
            return
          }
        }
      } catch (err) {
        // fallback to client-side storage
        setUser(getStoredUser())
      }
    }

    fetchMe()
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/auth/signout', { method: 'POST', credentials: 'include' })
    } catch { /* ignore */ }
    logout()
    navigate('/')
  }

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true)
  }

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false)
    await handleSignOut()
  }

  const cancelSignOut = () => {
    setShowSignOutConfirm(false)
  }

  const handleProfilePictureSelect = (pictureId: string) => {
    setSelectedProfilePicture(pictureId)
    localStorage.setItem('selected_profile_picture', pictureId)
  }

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId)
    localStorage.setItem('profile_color', colorId)
    window.dispatchEvent(new Event('profile-color-changed'))
  }

  const getColorClasses = () => {
    const color = COLOR_PRESETS.find(c => c.id === selectedColor) || COLOR_PRESETS[0]
    return {
      banner: color.banner,
      frame: color.frame,
      label: color.label,
    }
  }

  const getProfilePictureEmoji = () => {
    if (selectedProfilePicture) {
      const picture = DEFAULT_PROFILE_PICTURES.find(p => p.id === selectedProfilePicture)
      return picture?.emoji || '👤'
    }
    return user?.avatar_url ? null : '👤'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Profile
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Manage your account and GitHub authentication</p>
        </div>

        {/* User Profile Card */}
        {user ? (
          <div className="animate-fade-in-up delay-100 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Header Gradient */}
              <div className={`h-32 bg-gradient-to-r ${getColorClasses().banner}`} />

              {/* Content */}
              <div className="px-8 pb-8">
                {/* Avatar and Info - Overlap */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
                  {/* Avatar Container */}
                  <div className="relative group">
                    {selectedProfilePicture ? (
                      <div key={`avatar-${selectedColor}`} className={`w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br ${getColorClasses().frame} flex items-center justify-center text-7xl transition-all duration-300`}>
                        {getProfilePictureEmoji()}
                      </div>
                    ) : (
                      <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg object-cover"
                      />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 pt-4">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {user.name || user.login}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                      @{user.login}
                    </p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 text-blue-600 dark:text-blue-400">
                            <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                            <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 text-purple-600 dark:text-purple-400">
                          <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">GitHub ID</p>
                          <p className="text-slate-900 dark:text-white font-medium">{user.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleSignOutClick}
                    className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up delay-100 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-12 text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Not Signed In</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8">
                You are not signed in with GitHub. Sign in to access your profile and manage your account.
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}

        {/* Color Selector Section - REMOVED, now using modal instead */}

        {/* Profile Picture Selector Section */}
        {user && (
          <div className="animate-fade-in-up delay-300 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 px-8 py-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm">
                        🎨
                      </div>
                      Profile Customization
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Customize your quiz app avatar and theme</p>
                  </div>
                  <button
                    onClick={() => setShowColorSelector(!showColorSelector)}
                    className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    🎨 Change Color
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Current Profile Picture</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-7xl">{getProfilePictureEmoji() || '👤'}</div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">
                        {selectedProfilePicture ? (
                          <>
                            {DEFAULT_PROFILE_PICTURES.find(p => p.id === selectedProfilePicture)?.name}
                            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                              ({DEFAULT_PROFILE_PICTURES.find(p => p.id === selectedProfilePicture)?.description})
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">No custom picture selected</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                  <ProfilePictureSelector
                    selectedPicture={selectedProfilePicture}
                    onSelect={handleProfilePictureSelect}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Data Section */}
        {user && (
          <div className="animate-fade-in-up delay-400">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 px-8 py-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
                    📊
                  </div>
                  Account Data
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Your GitHub profile information</p>
              </div>

              {/* Content */}
              <div className="p-8">
                <pre className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 text-sm text-slate-700 dark:text-slate-300 overflow-x-auto border border-slate-200 dark:border-slate-700 font-mono">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Selector Modal */}
      {showColorSelector && (
        <Modal>
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  🎨 Choose a Theme Color
                </h2>
                <button
                  onClick={() => setShowColorSelector(false)}
                  className="cursor-pointer text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  ×
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Select a color theme for your profile banner and picture frame:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      handleColorSelect(color.id)
                      setShowColorSelector(false)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedColor === color.id
                        ? 'border-blue-600 dark:border-blue-400 shadow-lg scale-105 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`h-16 bg-gradient-to-r ${color.banner} rounded-lg mb-3`} />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{color.label}</p>
                    {selectedColor === color.id && (
                      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowColorSelector(false)}
                  className="cursor-pointer px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <Modal>
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
                  onClick={cancelSignOut}
                  className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>
    </div>
  )
}
