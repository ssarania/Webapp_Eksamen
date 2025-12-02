import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, loading } = useAuth()

	if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
	if (!isAuthenticated) return <Navigate to="/" replace />

	return <>{children}</>
}
