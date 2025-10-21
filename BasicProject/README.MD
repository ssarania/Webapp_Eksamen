# BasicProject (MVC) - Backend & DAL

This project is a minimal MVC app using .NET 8.0 with a repository-pattern DAL and PostgreSQL.

## Features added in this MVP:
- **EF Core** integration with PostgreSQL (Npgsql)
- **Repository pattern** (generic repo + User/Quiz repos)
- **Async database access** throughout
- **Entities**: User, Quiz, Question, QuestionOption, Attempt, AttemptAnswer (full relations)
- **MVC controllers** and basic Razor views for Users and Quizzes (Index/Create/Edit/Delete)
- **RESTful API** with Swagger/OpenAPI documentation
  - `/api/UsersApi` - CRUD for users
  - `/api/QuizzesApi` - Create quizzes with questions (2-4 options each)
  - `/api/AttemptsApi` - Submit quiz attempts and view results
- **Server-side validation** using data annotations
- **Error handling and logging** via ILogger

Getting started
1. Ensure you have .NET 8 SDK installed.
2. Ensure PostgreSQL is running locally and you have created a database (default connection string expects database `basicproject_db` with user `postgres` / password `postgres`).

Create the database (example using psql):

```bash
createdb -h localhost -p 5432 -U postgres basicproject_db
```

3. Update `appsettings.json` connection string if you use different credentials.

4. Add a migration and update the database (you may need the EF tools):

```bash
dotnet tool install --global dotnet-ef --version 8.0.0
dotnet ef migrations add InitialCreate
dotnet ef database update
```

5. Run the app:

```bash
dotnet run
```

6. Test the API using Swagger UI:
   - Navigate to `http://localhost:5093/swagger` (port may vary, check console output)
   - You'll see interactive documentation for all API endpoints

## API Endpoints

### Users API (`/api/UsersApi`)
- `GET /api/UsersApi` - List all users
- `POST /api/UsersApi` - Create new user
  ```json
  { "name": "John Doe" }
  ```
- `GET /api/UsersApi/{id}` - Get user by ID
- `PUT /api/UsersApi/{id}` - Update user
- `DELETE /api/UsersApi/{id}` - Delete user

### Quizzes API (`/api/QuizzesApi`)
- `GET /api/QuizzesApi` - List all quizzes (with question count)
- `POST /api/QuizzesApi` - Create quiz with questions and options
  ```json
  {
    "title": "Sample Quiz",
    "description": "Test your knowledge",
    "authorId": 1,
    "questions": [
      {
        "text": "What is 2+2?",
        "options": [
          { "text": "3", "isCorrect": false },
          { "text": "4", "isCorrect": true },
          { "text": "5", "isCorrect": false }
        ]
      }
    ]
  }
  ```
- `GET /api/QuizzesApi/{id}` - Get quiz with questions (answers hidden by default)
- `GET /api/QuizzesApi/{id}?includeAnswers=true` - Get quiz with correct answers (for review)
- `PUT /api/QuizzesApi/{id}` - Update quiz metadata
- `DELETE /api/QuizzesApi/{id}` - Delete quiz

### Attempts API (`/api/AttemptsApi`)
- `GET /api/AttemptsApi` - List all attempts (filter by ?userId=X or ?quizId=Y)
- `POST /api/AttemptsApi` - Submit quiz attempt
  ```json
  {
    "quizId": 1,
    "userId": 1,
    "answers": [
      { "questionId": 1, "selectedOptionId": 2 }
    ]
  }
  ```
- `GET /api/AttemptsApi/{id}` - Get attempt details with answers
- `GET /api/AttemptsApi/leaderboard/{quizId}` - Get top scores for a quiz

## Data Model

- **User**: Basic user info (Id, Name)
- **Quiz**: Title, Description, Author, CreatedAt
- **Question**: Text, Order (belongs to Quiz)
- **QuestionOption**: Text, IsCorrect (2-4 per question)
- **Attempt**: Tracks user's quiz attempt with score
- **AttemptAnswer**: Individual answer for each question in an attempt

## Testing Workflow

1. **Create a User**:
   ```bash
   POST /api/UsersApi
   { "name": "Alice" }
   ```

2. **Create a Quiz** (with at least one question):
   ```bash
   POST /api/QuizzesApi
   {
     "title": "Math Quiz",
     "description": "Basic arithmetic",
     "authorId": 1,
     "questions": [
       {
         "text": "What is 5 + 3?",
         "options": [
           { "text": "7", "isCorrect": false },
           { "text": "8", "isCorrect": true },
           { "text": "9", "isCorrect": false }
         ]
       }
     ]
   }
   ```

3. **Take the Quiz**:
   ```bash
   GET /api/QuizzesApi/1  # Get questions (without answers)
   ```

4. **Submit Answers**:
   ```bash
   POST /api/AttemptsApi
   {
     "quizId": 1,
     "userId": 1,
     "answers": [
       { "questionId": 1, "selectedOptionId": 2 }
     ]
   }
   ```

5. **View Results**:
   ```bash
   GET /api/AttemptsApi/1  # See detailed results
   GET /api/AttemptsApi/leaderboard/1  # View leaderboard
   ```

## Notes
- There is no authentication for this MVP
- Each question must have exactly one correct answer
- Each question must have 2-4 options
- Attempts are auto-graded upon submission
- Views are intentionally simple but use Bootstrap for a friendly UI
- For production, secure the connection string and apply proper migrations/deployment strategy

## Next steps (recommended)
- Add unit/integration tests for repositories and controllers
- Add pagination, search/filter on lists
- Add sample seed data or data seeding on startup
- Improve UI/UX with dynamic JavaScript for quiz taking
- Add time limits for quizzes
- Add authentication and authorization
