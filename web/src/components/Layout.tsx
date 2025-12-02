import type { ReactNode } from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
			<Navbar />

			<main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="w-full">{children}</div>
			</main>

			<footer className="border-t border-slate-200 dark:border-slate-700 text-sm py-6 mt-12 text-center text-slate-600 dark:text-slate-400">
				© {new Date().getFullYear()} QuizApp — Modern Quiz Application
			</footer>
		</div>
	)
}
