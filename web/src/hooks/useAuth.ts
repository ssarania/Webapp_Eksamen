import { useState, useEffect } from 'react'
import type { GitHubUser } from '../services/githubAuthService'
import { getStoredUser, clearGitHubAuth } from '../services/githubAuthService'

export function useAuth() {
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

	return { user, isAuthenticated, loading, logout }
}
