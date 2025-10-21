# API Testing Guide

## Quick Test Sequence

### 1. Create a User
```http
POST http://localhost:5093/api/UsersApi
Content-Type: application/json

{
  "name": "Alice Johnson"
}
```

Response:
```json
{
  "id": 1,
  "name": "Alice Johnson"
}
```

### 2. Create Another User
```http
POST http://localhost:5093/api/UsersApi
Content-Type: application/json

{
  "name": "Bob Smith"
}
```

### 3. Create a Quiz with Questions
```http
POST http://localhost:5093/api/QuizzesApi
Content-Type: application/json

{
  "title": "General Knowledge Quiz",
  "description": "Test your knowledge on various topics",
  "authorId": 1,
  "questions": [
    {
      "text": "What is the capital of France?",
      "options": [
        { "text": "London", "isCorrect": false },
        { "text": "Berlin", "isCorrect": false },
        { "text": "Paris", "isCorrect": true },
        { "text": "Madrid", "isCorrect": false }
      ]
    },
    {
      "text": "Which planet is known as the Red Planet?",
      "options": [
        { "text": "Venus", "isCorrect": false },
        { "text": "Mars", "isCorrect": true },
        { "text": "Jupiter", "isCorrect": false }
      ]
    },
    {
      "text": "What is 12 × 12?",
      "options": [
        { "text": "124", "isCorrect": false },
        { "text": "144", "isCorrect": true },
        { "text": "156", "isCorrect": false },
        { "text": "164", "isCorrect": false }
      ]
    }
  ]
}
```

### 4. View Quiz (without answers - for taking)
```http
GET http://localhost:5093/api/QuizzesApi/1
```

Response shows questions and options but NOT which is correct.

### 5. Submit a Quiz Attempt
```http
POST http://localhost:5093/api/AttemptsApi
Content-Type: application/json

{
  "quizId": 1,
  "userId": 2,
  "answers": [
    { "questionId": 1, "selectedOptionId": 3 },
    { "questionId": 2, "selectedOptionId": 5 },
    { "questionId": 3, "selectedOptionId": 10 }
  ]
}
```

Response:
```json
{
  "id": 1,
  "score": 3,
  "totalQuestions": 3,
  "percentage": 100.0,
  "message": "Quiz completed! You scored 3 out of 3"
}
```

### 6. View Attempt Details
```http
GET http://localhost:5093/api/AttemptsApi/1
```

Shows which questions were answered correctly/incorrectly.

### 7. View Leaderboard
```http
GET http://localhost:5093/api/AttemptsApi/leaderboard/1?limit=10
```

### 8. List All Attempts by User
```http
GET http://localhost:5093/api/AttemptsApi?userId=2
```

### 9. List All Attempts for a Quiz
```http
GET http://localhost:5093/api/AttemptsApi?quizId=1
```

### 10. View Quiz with Answers (for review/admin)
```http
GET http://localhost:5093/api/QuizzesApi/1?includeAnswers=true
```

## Validation Rules

### Quiz Creation
- Must have at least 1 question
- Each question must have 2-4 options
- Each question must have exactly 1 correct answer
- Author must exist in database

### Attempt Submission
- Must answer ALL questions in the quiz
- Cannot submit answer for question not in quiz
- Cannot select option not belonging to that question
- User and Quiz must exist

## Error Responses

### 400 Bad Request
```json
{
  "error": "Each question must have 2-4 options"
}
```

### 404 Not Found
```json
{
  "error": "Quiz with ID 99 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred while creating the quiz"
}
```

## Using Swagger UI

1. Start app: `dotnet run`
2. Open browser: `http://localhost:5093/swagger`
3. Click on any endpoint to expand
4. Click "Try it out"
5. Fill in the request body/parameters
6. Click "Execute"
7. View response below

The Swagger UI provides:
- Interactive testing
- Request/response schemas
- Example values
- Validation feedback
- Easy copying of cURL commands
