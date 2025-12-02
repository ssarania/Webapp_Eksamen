import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MobileMenu from './MobileMenu'
import GitHubAuthButton from './GitHubAuthButton'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const location = useLocation()
	const { isAuthenticated } = useAuth()

	const navLinks = isAuthenticated 
		? [
				{ label: 'Home', path: '/' },
				{ label: 'Quizzes', path: '/quizzes' },
				{ label: 'Create', path: '/quiz-creation/create' },
				{ label: 'Dashboard', path: '/dashboard' },
				{ label: 'Profile', path: '/profile' },
		  ]
		: [
				{ label: 'Home', path: '/' },
				{ label: 'Quizzes', path: '/quizzes' },
		  ]

	const isActive = (path: string) => location.pathname === path

	return (
		<>
			{/* Main Navbar */}
			<nav className="fixed top-0 w-full z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/20 dark:border-slate-700/50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo Section */}
						<Link
							to="/"
							className="flex-shrink-0 flex items-center gap-2 group"
						>
							<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
								<span className="text-white font-bold text-sm">Q</span>
							</div>
							<span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
								QuizApp
							</span>
						</Link>

						{/* Desktop Navigation Links */}
						<div className="hidden md:block">
							<div className="ml-10 flex items-center gap-1">
								{navLinks.map((link) => {
									const active = isActive(link.path)
									return (
										<Link
											key={link.path}
											to={link.path}
											className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${
												active
													? 'text-blue-600 dark:text-blue-400'
													: 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
											}`}
										>
											{link.label}
											{/* Underline animation */}
											<span
												className={`absolute bottom-1 left-3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ${
													active ? 'right-3' : 'right-3 group-hover:left-1 group-hover:right-1'
												}`}
											/>
										</Link>
									)
								})}
							</div>
						</div>

						{/* Right Section - Sign In + Mobile Toggle */}
						<div className="flex items-center gap-3">
							{/* Sign In Button - Desktop */}
							<div className="hidden sm:inline-flex">
								<GitHubAuthButton className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 px-4 py-2 rounded-md" />
							</div>

							{/* Mobile Menu Toggle */}
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
								aria-label="Toggle menu"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									{isMobileMenuOpen ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									)}
								</svg>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Menu */}
			<MobileMenu
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				navLinks={navLinks}
				isActive={isActive}
			/>

			{/* Spacer to prevent content overlap */}
			<div className="h-16" />
		</>
	)
}
