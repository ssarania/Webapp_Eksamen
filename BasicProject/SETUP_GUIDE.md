# Setup Guide for Running the Project on Different Devices

## Prerequisites

1. **.NET 8.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **PostgreSQL** access (either local or remote)
3. **Visual Studio Code** or **Visual Studio 2022** (optional but recommended)

## Database Setup Options

### Option 1: Using the Existing Remote Database (Recommended for Testing)

The project is already configured to use a remote PostgreSQL database. No additional setup needed if you have internet access and the remote server is accessible.

**Connection String Location:** `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=138.201.196.41;Port=6713;Database=postgres;Username=postgres;Password=..."
  }
}
```

### Option 2: Using a Local PostgreSQL Database

If you want to use a local database:

1. **Install PostgreSQL** on your machine
2. **Update the connection string** in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=quizapp;Username=postgres;Password=yourpassword"
  }
}
```

3. **Create the database** (if it doesn't exist):
```bash
psql -U postgres
CREATE DATABASE quizapp;
\q
```

## Installation Steps

### 1. Clone/Copy the Project

```bash
cd c:\Code
# If using git:
git clone <repository-url>
# Or simply copy the project folder
```

### 2. Restore NuGet Packages

```bash
cd c:\Code\Webapp_BasicProject\BasicProject
dotnet restore
```

### 3. Apply Database Migrations

This is **crucial** - the database needs to have all the tables and schema:

```bash
dotnet ef database update
```

**Expected Output:**
- You should see messages about creating tables: Users, Quizzes, Questions, QuestionOptions, Attempts, AttemptAnswers
- The migration names that are applied: InitialCreate, AddQuestionsAndOptions, AddUserAndQuizProperties

**If you get an error:**
- Check your connection string in `appsettings.json`
- Verify PostgreSQL is running (if local)
- Check network connectivity (if remote)
- Ensure the database user has proper permissions

### 4. Build the Project

```bash
dotnet build
```

### 5. Run the Application

```bash
dotnet run
```

**Or use watch mode for development:**
```bash
dotnet watch run
```

The application will start on `http://localhost:5093`

## Verifying the Setup

### 1. Test the Home Page
Navigate to: `http://localhost:5093`

### 2. Test API Documentation
Navigate to: `http://localhost:5093/swagger`

### 3. Test Database Connection
- Go to `/Users/Create` and create a test user
- Go to `/QuizCreation/Create` and create a test quiz
- Go to `/Quizzes/Index` to browse quizzes

## Troubleshooting Common Errors

### Error: "Npgsql.PostgresException: 42P01: relation does not exist"

**Cause:** Database tables haven't been created.

**Solution:**
```bash
dotnet ef database update
```

### Error: "Npgsql.PostgresException: 42703: column does not exist"

**Cause:** Database schema is outdated (missing columns like UserName, Email, QuestionCount).

**Solution:**
```bash
# Remove old migrations if any conflicts
dotnet ef migrations list
# Apply all migrations
dotnet ef database update
```

### Error: "Connection refused" or "Timeout"

**Cause:** Cannot connect to PostgreSQL server.

**Solutions:**
- Verify PostgreSQL is running: `pg_isready` (local) or check network connectivity (remote)
- Check firewall settings
- Verify connection string credentials
- Test connection manually: `psql -h 138.201.196.41 -p 6713 -U postgres -d postgres`

### Error: "The type or namespace name 'X' could not be found"

**Cause:** NuGet packages not restored.

**Solution:**
```bash
dotnet restore
dotnet build
```

### Error: "A command is already running in this terminal"

**Cause:** Another dotnet process is still running.

**Solution:**
- Press `Ctrl+C` to stop the current process
- Or close the terminal and open a new one

## Development Workflow

### Creating New Migrations

After modifying entity classes (in `Data/Entities/`):

```bash
# Create a new migration
dotnet ef migrations add <MigrationName>

# Apply the migration
dotnet ef database update
```

### Reverting Migrations

```bash
# Remove the last migration (before applying)
dotnet ef migrations remove

# Revert to a specific migration
dotnet ef database update <PreviousMigrationName>
```

### Resetting the Database (Development Only)

**WARNING:** This will delete all data!

```bash
# Drop and recreate the database
dotnet ef database drop --force
dotnet ef database update
```

## Project Structure

```
BasicProject/
├── Controllers/           # MVC and API controllers
│   ├── QuizTakingController.cs    (Quiz taking pages)
│   ├── QuizCreationController.cs  (Quiz creation)
│   └── Api/                        (REST API endpoints)
├── Data/
│   ├── AppDbContext.cs            (EF Core context)
│   ├── Entities/                   (Database models)
│   └── Repositories/               (Data access layer)
├── Views/
│   ├── QuizTaking/                 (Take.cshtml, Results.cshtml)
│   ├── QuizCreation/               (Create.cshtml, Success.cshtml)
│   └── Quizzes/                    (Index.cshtml - Browse quizzes)
├── Migrations/                     (Database migrations)
└── appsettings.json               (Configuration)
```

## Key Features

1. **Quiz Creation** - `/QuizCreation/Create`
   - Dynamic question/option management
   - 2-4 options per question
   - One correct answer validation

2. **Quiz Taking** - `/QuizTaking/Take/{id}`
   - One question at a time
   - Progress tracking
   - Navigation between questions

3. **Results** - `/QuizTaking/Results/{id}`
   - Detailed answer review
   - Score breakdown
   - Share functionality

4. **REST API** - `/swagger`
   - Full CRUD operations
   - Quiz submission
   - Leaderboards

## Port Configuration

Default port: `5093`

To change the port, edit `Properties/launchSettings.json`:

```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5093"
    }
  }
}
```

## Support

For issues specific to:
- **Database errors**: Check connection string and run migrations
- **Build errors**: Run `dotnet restore` and `dotnet build`
- **Runtime errors**: Check the terminal output for detailed error messages
- **404 errors**: Verify the controller and action names in the URL

## Additional Notes

- The application uses **Bootstrap 5** for styling (CDN-based)
- **Bootstrap Icons** are loaded from CDN
- **Swagger UI** is enabled in Development mode only
- Database queries use **AsSplitQuery()** for performance optimization
- All timestamps are stored in **UTC**
