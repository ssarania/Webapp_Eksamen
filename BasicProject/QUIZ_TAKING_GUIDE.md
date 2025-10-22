# Quiz Taking Feature Guide

## Overview
The quiz-taking feature allows users to take quizzes one question at a time with a progress tracker, and view detailed results at the end.

## Features

### 1. Quiz Taking Page (`/QuizTaking/Take/{quizId}`)
- **User Selection**: Choose a user before starting the quiz
- **One Question at a Time**: Shows only one question at a time for better focus
- **Progress Tracking**: 
  - Visual progress bar showing percentage completion
  - Question counter (e.g., "Question 1 of 5")
  - Answered counter showing how many questions have been answered
- **Navigation**:
  - Previous button to go back and review/change answers
  - Next button to move forward (disabled until current question is answered)
  - Submit button on the last question
- **User-Friendly Interface**:
  - Click anywhere on an option to select it
  - Visual feedback showing selected options with blue border and background
  - Large, readable option text

### 2. Results Page (`/QuizTaking/Results/{attemptId}`)
- **Score Summary**:
  - Score (e.g., "3 / 5")
  - Percentage
  - Time taken
  - Congratulatory message based on performance
- **Detailed Review**:
  - Each question with all options
  - Your selected answer highlighted
  - Correct answer highlighted in green
  - Wrong answers highlighted in red
  - Visual indicators (✓ for correct, ✗ for incorrect)
- **Actions**:
  - Retake quiz
  - Share results on social media
  - Copy quiz link
- **Special Effects**:
  - Confetti animation for scores >= 80%

### 3. Browse Quizzes Page (`/Quizzes/Index`)
- **Card-Based Layout**: Beautiful card design for each quiz
- **Quiz Information**:
  - Title and description
  - Author name
  - Number of questions
  - Number of attempts
  - Creation date
- **Take Quiz Button**: Direct access to start any quiz
- **Hover Effects**: Cards lift on hover for better UX

## How to Test

### Step 1: Create a User
1. Go to http://localhost:5093/Users/Create
2. Create a test user (e.g., "John Doe")

### Step 2: Create a Quiz
1. Go to http://localhost:5093/QuizCreation/Create
2. Fill in the quiz details:
   - Title: "Sample Quiz"
   - Description: "Test your knowledge"
   - Author: Select the user you created
3. Add questions:
   - Add 2-3 questions
   - Each question should have 2-4 options
   - Mark one option as correct for each question
4. Click "Create Quiz"
5. You'll be redirected to a success page with a shareable link

### Step 3: Take the Quiz
1. Go to http://localhost:5093/Quizzes/Index (Browse Quizzes)
2. Click "Take Quiz" on your quiz
3. Select a user from the dropdown
4. Click "Start Quiz"
5. Answer questions one by one:
   - Click on any option to select it
   - Use "Next" to move forward
   - Use "Previous" to go back and change answers
   - Progress bar updates as you answer
6. On the last question, click "Submit Quiz"

### Step 4: View Results
1. After submission, you'll automatically be redirected to the results page
2. Review your score and percentage
3. See detailed answer review with correct/incorrect indicators
4. Try the "Take Quiz Again" button to retake
5. Test social sharing buttons

## API Endpoints Used

### Get Quiz Data (for taking)
```
GET /api/QuizzesApi/{id}?includeAnswers=false
```
Returns quiz with questions and options (without correct answer flags)

### Submit Quiz Attempt
```
POST /api/AttemptsApi
Content-Type: application/json

{
  "quizId": 1,
  "userId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedOptionId": 2
    },
    {
      "questionId": 2,
      "selectedOptionId": 5
    }
  ]
}
```
Returns the attempt with score and ID

### Get Attempt Results
```
GET /api/AttemptsApi/{attemptId}
```
Returns detailed results with correct/incorrect answers

## Navigation

- **Home Page**: `/` or `/Home/Index`
- **Browse Quizzes**: `/Quizzes/Index`
- **Create Quiz**: `/QuizCreation/Create`
- **Take Quiz**: `/QuizTaking/Take/{quizId}`
- **View Results**: `/QuizTaking/Results/{attemptId}`
- **Users**: `/Users/Index`
- **API Documentation**: `/swagger`

## Design Highlights

### Quiz Taking
- Clean, distraction-free interface
- Large clickable areas for better mobile experience
- Clear visual feedback for selected answers
- Progress tracking to reduce anxiety
- Ability to review and change answers before submitting

### Results Page
- Celebratory UI with icons and colors based on performance
- Detailed review showing both correct and incorrect answers
- Quick actions to retake or share
- Confetti effect for high scores (>= 80%)

## Tips

1. **Testing Different Scenarios**:
   - Try leaving some questions unanswered (you'll get a confirmation dialog)
   - Navigate back and forth between questions
   - Change answers before submitting
   - Take the same quiz multiple times with different users

2. **Performance Levels**:
   - >= 80%: "Excellent Work!" with trophy icon and confetti
   - >= 60%: "Good Job!" with thumbs up icon
   - < 60%: "Keep Learning!" with book icon

3. **Mobile Responsive**:
   - All pages are responsive and work well on mobile devices
   - Cards stack vertically on smaller screens
   - Buttons are touch-friendly

## Troubleshooting

### Quiz not loading
- Check that the quiz has questions with options
- Verify the quiz ID exists in the database
- Check browser console for errors

### Can't submit quiz
- Ensure at least one question is answered
- Check that the user is selected
- Verify browser console for network errors

### Results not showing
- Verify the attempt was created successfully
- Check that the attempt ID is valid
- Ensure the quiz and questions still exist in the database
