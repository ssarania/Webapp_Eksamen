import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { GitHubUser } from '../services/githubAuthService'
import { getStoredUser, clearGitHubAuth } from '../services/githubAuthService'

interface AuthContextType {
	user: GitHubUser | null
	isAuthenticated: boolean
	loading: boolean
	logout: () => void
	setUser: (user: GitHubUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<GitHubUser | null>(null)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Check server session first
				const res = await fetch('/api/auth/me', { credentials: 'include' })
				if (res.ok) {
					const data = await res.json()
					if (data?.login) {
						setUser(data)
						setIsAuthenticated(true)
						setLoading(false)
						return
					}
				}
			} catch (err) {
				// ignore
			}

			// Fallback to localStorage
			const storedUser = getStoredUser()
			if (storedUser) {
				setUser(storedUser)
				setIsAuthenticated(true)
			}
			setLoading(false)
		}

		checkAuth()
	}, [])

	const logout = () => {
		clearGitHubAuth()
		setUser(null)
		setIsAuthenticated(false)
	}

	return (
		<AuthContext.Provider value={{ user, isAuthenticated, loading, logout, setUser }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
