import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LiquidEther from '@/components/Liquid'


export default function Home() {
	const { isAuthenticated } = useAuth()
	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
			{/* Hero Section */}
			<div className="fixed inset-0 pointer-events-none z-0">
				<LiquidEther
					colors={['#5227FF', '#FF9FFC', '#B19EEF']}
					mouseForce={20}
					cursorSize={100}
					isViscous={false}
					viscous={30}
					iterationsViscous={32}
					iterationsPoisson={32}
					resolution={0.5}
					isBounce={false}
					autoDemo={true}
					autoSpeed={0.5}
					autoIntensity={1.2}
					takeoverDuration={0.25}
					autoResumeDelay={3000}
					autoRampDuration={0.6}
				/>
			</div>
			<section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
				{/* Background Gradient Blob */}
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 blur-3xl" />
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full opacity-30 blur-3xl" />
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

					<div className="grid md:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<div className="space-y-8 animate-fade-in-up">
							{/* Badge */}
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/60 dark:bg-blue-900/30 rounded-full border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
								<span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
									{isAuthenticated ? 'Welcome back to QuizApp' : 'Welcome to QuizApp'}
								</span>
							</div>

							{/* Headline */}
							<div className="space-y-4">
								<h1 className="text-5xl md:text-6xl font-bold leading-tight drop-shadow-lg">
									<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
										Learning is fun
									</span>
									<br />
									<span className="text-slate-900 dark:text-white drop-shadow-lg">
										with QuizApp
									</span>
								</h1>
								<p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed max-w-lg font-medium drop-shadow-md">
									{isAuthenticated
										? 'Continue your learning journey. Browse quizzes, create new ones, or check your dashboard.'
										: 'Create, share, and take engaging quizzes right from your browser. Built for students, educators, and anyone who loves learning.'}
								</p>
							</div>

							{/* CTA Buttons */}
							<div className="flex flex-col sm:flex-row gap-4 pt-4">
								<Link
									to="/quizzes"
									className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
								>
									<span>Browse Quizzes</span>
									<svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</Link>

								{isAuthenticated && (
									<Link
										to="/quiz-creation/create"
										className="group inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
									>
										<span>Create Quiz</span>
										<svg className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
									</Link>
								)}
							</div>
						</div>

						{/* Right Illustration */}
						<div className="relative hidden md:flex items-center justify-center animate-fade-in-scale">
							<div className="relative w-full h-96">
								{/* Floating Card 1 */}

								<div className="absolute top-0 left-0 w-48 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl transform -rotate-6 animate-float opacity-90 p-6 flex flex-col justify-between">
									<div className="w-10 h-10 bg-white/30 rounded-lg" />
									<div className="space-y-2">
										<div className="h-2 bg-white/40 rounded w-24" />
										<div className="h-2 bg-white/30 rounded w-16" />
									</div>
								</div>

								{/* Floating Card 2 */}
								<div className="absolute top-20 right-0 w-48 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl transform rotate-6 animate-float-slow opacity-90 p-6 flex flex-col justify-between" style={{ animationDelay: '1s' }}>
									<div className="w-10 h-10 bg-white/30 rounded-lg" />
									<div className="space-y-2">
										<div className="h-2 bg-white/40 rounded w-28" />
										<div className="h-2 bg-white/30 rounded w-20" />
									</div>
								</div>

								{/* Floating Card 3 */}
								<div className="absolute bottom-0 left-12 w-48 h-32 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl transform -rotate-3 animate-float opacity-90 p-6 flex flex-col justify-between" style={{ animationDelay: '0.5s' }}>
									<div className="w-10 h-10 bg-white/30 rounded-lg" />
									<div className="space-y-2">
										<div className="h-2 bg-white/40 rounded w-24" />
										<div className="h-2 bg-white/30 rounded w-16" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 md:py-28 relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Section Header */}
					<div className="text-center mb-16 space-y-4 animate-fade-in">
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white drop-shadow-lg">
							Why choose QuizApp?
						</h2>
						<p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto font-medium drop-shadow-md">
							Packed with powerful features designed to make learning and teaching engaging and effortless.
						</p>
					</div>

					{/* Feature Cards */}
					<div className="grid md:grid-cols-3 gap-8">
						{/* Feature 1 */}
						<div className="group relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
							<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-blue-500/50 flex flex-col">
								{/* Icon */}
								<div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
									✏️
								</div>

							{/* Content */}
							<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 drop-shadow-md">
								Feature-rich Editor
							</h3>
							<p className="text-slate-700 dark:text-slate-300 leading-relaxed flex-grow font-medium drop-shadow-sm">
									Add questions and options dynamically. Choose correct answers, add questions and preview everything before publishing.
								</p>

								{/* Hover Arrow */}
								<div className="mt-auto pt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
									Learn more
									<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</div>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="group relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
							<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-purple-500/50 flex flex-col">
								{/* Icon */}
								<div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
									💾
								</div>

								{/* Content */}
								<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 drop-shadow-md">
									Local-First
								</h3>
								<p className="text-slate-700 dark:text-slate-300 leading-relaxed flex-grow font-medium drop-shadow-sm">
									All quizzes and attempts are stored in your browser's localStorage under "My Quizzes". No server needed. Perfect for classrooms, students and demos.
								</p>

								{/* Hover Arrow */}
								<div className="mt-auto pt-6 flex items-center text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
									Learn more
									<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</div>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="group relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
							<div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-indigo-500/50 flex flex-col">
								{/* Icon */}
								<div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
									🚀
								</div>

								{/* Content */}
								<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 drop-shadow-md">
									Easy to Extend
								</h3>
								<p className="text-slate-700 dark:text-slate-300 leading-relaxed flex-grow font-medium drop-shadow-sm">
									Built with React + TypeScript and ASP.NET Core 8. Clean architecture ready for scale.
								</p>

								{/* Hover Arrow */}
								<div className="mt-auto pt-6 flex items-center text-indigo-600 dark:text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
									Learn more
									<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 relative overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
				</div>

				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in">
					<h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white drop-shadow-lg">
						{isAuthenticated ? 'Ready to continue your learning?' : 'Ready to get started?'}
					</h2>
					<p className="text-xl text-slate-700 dark:text-slate-200 max-w-2xl mx-auto font-medium drop-shadow-md">
						{isAuthenticated
							? 'Your learning tools are ready. Start exploring quizzes or create your own.'
							: 'Join thousands of students and educators already using QuizApp to create amazing learning experiences.'}
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Link
							to="/quizzes"
							className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
						>
							Browse Quizzes
						</Link>
						{isAuthenticated && (
							<Link
								to="/quiz-creation/create"
								className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
							>
								Create Your Quiz
							</Link>
						)}
					</div>
				</div>
			</section>

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

				@keyframes fadeInScale {
					from {
						opacity: 0;
						transform: scale(0.95);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}

				@keyframes float {
					0%, 100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}

				@keyframes floatSlow {
					0%, 100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-15px);
					}
				}

				.animate-fade-in-up {
					animation: fadeInUp 0.8s ease-out;
				}

				.animate-fade-in-scale {
					animation: fadeInScale 0.8s ease-out;
				}

				.animate-float {
					animation: float 6s ease-in-out infinite;
				}

				.animate-float-slow {
					animation: floatSlow 7s ease-in-out infinite;
				}

				.animate-fade-in {
					animation: fadeInUp 0.8s ease-out;
				}
			`}</style>
		</div>
	)
}
