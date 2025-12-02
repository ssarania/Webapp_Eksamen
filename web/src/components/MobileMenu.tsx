import { Link } from 'react-router-dom'
import { Button } from './ui/button'

interface NavLink {
	label: string
	path: string
}

interface MobileMenuProps {
	isOpen: boolean
	onClose: () => void
	navLinks: NavLink[]
	isActive: (path: string) => boolean
}

export default function MobileMenu({
	isOpen,
	onClose,
	navLinks,
	isActive,
}: MobileMenuProps) {
	return (
		<>
			{/* Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden"
					onClick={onClose}
					style={{
						animation: 'fadeIn 200ms ease-out',
					}}
				/>
			)}

			{/* Mobile Menu */}
			<div
				className={`fixed top-16 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-white/20 dark:border-slate-700/50 z-30 md:hidden transition-all duration-300 ease-out overflow-hidden ${
					isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
				}`}
				style={{
					transitionProperty: 'max-height, opacity',
					transitionDuration: '300ms',
					transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				<div className="px-4 py-4 space-y-3">
					{navLinks.map((link) => {
						const active = isActive(link.path)
						return (
							<Link
								key={link.path}
								to={link.path}
								onClick={onClose}
								className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
									active
										? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
										: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
								}`}
							>
								{link.label}
							</Link>
						)
					})}

					{/* Sign In Button - Mobile */}
					<Button
						variant="default"
						size="sm"
						className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 mt-4"
					>
						Sign In
					</Button>
				</div>
			</div>

			<style>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
			`}</style>
		</>
	)
}
