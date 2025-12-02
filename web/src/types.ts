export interface QuizSummary {
	id: number
	title: string
	description?: string | null
	authorId?: number | null
	authorName?: string | null
	isPublic?: boolean
	createdAt?: string
	questionCount: number
}

export interface Option {
	id: number
	text: string
	isCorrect?: boolean | null
}

export interface Question {
	id: number
	text: string
	order?: number
	options: Option[]
	explanation?: string | null
}

export interface QuizDetail {
	id: number
	title: string
	description?: string | null
	authorId?: number | null
	authorName?: string | null
	isPublic?: boolean
	isOwned?: boolean
	createdAt?: string
	questions: Question[]
}

export interface CreateOptionDto {
	text: string
	isCorrect: boolean
}

export interface CreateQuestionDto {
	text: string
	options: CreateOptionDto[]
	explanation?: string
}

export interface CreateQuizDto {
	title: string
	description?: string
	isPublic?: boolean
	questions: CreateQuestionDto[]
}
