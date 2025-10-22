# Setup Guide for Running the Project on Different Devices

## Prerequisites

1. **.NET 8.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **PostgreSQL** access (either local or remote)
3. **Visual Studio Code**

## Database Setup

Using the Existing Remote Database

The project is already configured to use a remote PostgreSQL database. No additional setup needed if you have internet access and the remote server is accessible.

**Connection String Location:** `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=138.201.196.41;Port=6713;Database=postgres;Username=postgres;Password=a54ctAJVAqcl0d4Je23K5cgGpa3G8lkqUYpGh1vNP935t2TziSDRlcPhBuqK4i89"
  }
}
```

## Installation Steps

### 1. Restore NuGet Packages

```bash
cd BasicProject
dotnet restore
```

### 2. Apply Database Migrations
```bash
dotnet ef database update
```
This is **crucial** - the database needs to have all the tables and schema:

### 3. Build the Project

```bash
dotnet build
```

### 4. Run the Application

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