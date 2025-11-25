import { Link } from 'react-router-dom'
import type { QuizSummary } from '../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function QuizCard({ quiz, onDelete }: { quiz: QuizSummary; onDelete?: (id: number) => void }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{quiz.title}</CardTitle>
				<CardDescription>{quiz.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">By {quiz.authorName ?? 'Unknown'}</div>
					<Badge variant="secondary">{quiz.questionCount} questions</Badge>
				</div>
			</CardContent>
			<CardFooter>
				<div className="ml-auto flex gap-2">
					<Link to={`/quizzes/${quiz.id}`}>
						<Button variant="ghost" size="sm">View</Button>
					</Link>
					{onDelete && (
						<Button variant="destructive" size="sm" onClick={() => onDelete(quiz.id)}>Delete</Button>
					)}
				</div>
			</CardFooter>
		</Card>
	)
}
