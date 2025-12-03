/**
 * Services Index
 * Central export point for all API services
 */

export * from './authService'
export * from './quizService'
export * from './attemptService'

export { default as authService } from './authService'
export { default as quizService } from './quizService'
export { default as attemptService } from './attemptService'

// Legacy exports for backward compatibility
export { default as api } from './quizService'
export { default as attemptsApi } from './attemptService'
