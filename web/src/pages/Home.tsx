import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card'

export default function Home() {
	return (
		<div className="container">
			<Card>
				<CardHeader>
					<CardTitle>Welcome to QuizApp</CardTitle>
					<CardDescription>This React version mirrors the .NET views. Use the navigation to explore quizzes, create content and manage users.</CardDescription>
				</CardHeader>
			</Card>
		</div>
	)
}
