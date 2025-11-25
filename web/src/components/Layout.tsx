import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
			<header className="bg-white dark:bg-slate-800 border-b">
				<div className="container flex items-center justify-between h-16">
					<div className="flex items-center gap-6">
						<Link to="/" className="font-bold text-xl">QuizApp</Link>
						<nav className="hidden sm:flex space-x-4 text-sm">
							<Link to="/quizzes" className="hover:underline">Quizzes</Link>
							<Link to="/quiz-creation/create" className="hover:underline">Create</Link>
							<Link to="/dashboard" className="hover:underline">Dashboard</Link>
							<Link to="/users" className="hover:underline">Users</Link>
						</nav>
					</div>

					<div className="flex items-center gap-3">
						<Link to="/quizzes" className="text-sm text-slate-600 hidden sm:block">Browse</Link>
						<Button variant="outline" size="sm">Sign in</Button>
						<Badge className="ml-2">v1.0</Badge>
					</div>
				</div>
			</header>

			<main className="container py-8">
				{children}
			</main>

			<footer className="border-t text-sm py-6 mt-12 text-center">
				© {new Date().getFullYear()} QuizApp — converted to React + Tailwind
			</footer>
		</div>
	)
}
