using BasicProject.Data;
using BasicProject.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AttemptsApiController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AttemptsApiController> _logger;

    public AttemptsApiController(AppDbContext context, ILogger<AttemptsApiController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all attempts (optionally filter by user or quiz)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int? userId = null, [FromQuery] int? quizId = null)
    {
        try
        {
            var query = _context.Attempts
                .Include(a => a.User)
                .Include(a => a.Quiz)
                .AsQueryable();

            if (userId.HasValue)
                query = query.Where(a => a.UserId == userId.Value);

            if (quizId.HasValue)
                query = query.Where(a => a.QuizId == quizId.Value);

            var attempts = await query
                .OrderByDescending(a => a.AttemptedAt)
                .Select(a => new
                {
                    a.Id,
                    a.QuizId,
                    QuizTitle = a.Quiz!.Title,
                    a.UserId,
                    UserName = a.User!.Name,
                    a.Score,
                    a.TotalQuestions,
                    Percentage = a.TotalQuestions > 0 ? (a.Score * 100.0 / a.TotalQuestions) : 0,
                    a.AttemptedAt,
                    a.CompletedAt
                })
                .ToListAsync();

            return Ok(attempts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving attempts");
            return StatusCode(500, new { error = "An error occurred while retrieving attempts" });
        }
    }

    /// <summary>
    /// Get attempt by ID with answers
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        try
        {
            var attempt = await _context.Attempts
                .Include(a => a.User)
                .Include(a => a.Quiz)
                .Include(a => a.Answers)
                    .ThenInclude(aa => aa.Question)
                .Include(a => a.Answers)
                    .ThenInclude(aa => aa.SelectedOption)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attempt == null)
                return NotFound(new { error = $"Attempt with ID {id} not found" });

            var result = new
            {
                attempt.Id,
                attempt.QuizId,
                QuizTitle = attempt.Quiz?.Title,
                attempt.UserId,
                UserName = attempt.User?.Name,
                attempt.Score,
                attempt.TotalQuestions,
                Percentage = attempt.TotalQuestions > 0 ? (attempt.Score * 100.0 / attempt.TotalQuestions) : 0,
                attempt.AttemptedAt,
                attempt.CompletedAt,
                Answers = attempt.Answers.Select(aa => new
                {
                    aa.QuestionId,
                    QuestionText = aa.Question?.Text,
                    aa.SelectedOptionId,
                    SelectedOptionText = aa.SelectedOption?.Text,
                    aa.IsCorrect
                })
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving attempt {AttemptId}", id);
            return StatusCode(500, new { error = "An error occurred while retrieving the attempt" });
        }
    }

    /// <summary>
    /// Submit a quiz attempt with answers
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Submit([FromBody] SubmitAttemptDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Verify quiz exists and load questions with correct answers
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {dto.QuizId} not found" });

            // Verify user exists
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound(new { error = $"User with ID {dto.UserId} not found" });

            // Validate answers
            if (dto.Answers.Count != quiz.Questions.Count)
                return BadRequest(new { error = "You must answer all questions" });

            // Create attempt
            var attempt = new Attempt
            {
                QuizId = dto.QuizId,
                UserId = dto.UserId,
                AttemptedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                TotalQuestions = quiz.Questions.Count
            };

            int correctCount = 0;

            // Process each answer
            foreach (var answerDto in dto.Answers)
            {
                var question = quiz.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
                if (question == null)
                    return BadRequest(new { error = $"Question with ID {answerDto.QuestionId} not found in this quiz" });

                var selectedOption = question.Options.FirstOrDefault(o => o.Id == answerDto.SelectedOptionId);
                if (selectedOption == null)
                    return BadRequest(new { error = $"Option with ID {answerDto.SelectedOptionId} not found for question {answerDto.QuestionId}" });

                var isCorrect = selectedOption.IsCorrect;
                if (isCorrect)
                    correctCount++;

                attempt.Answers.Add(new AttemptAnswer
                {
                    QuestionId = answerDto.QuestionId,
                    SelectedOptionId = answerDto.SelectedOptionId,
                    IsCorrect = isCorrect
                });
            }

            attempt.Score = correctCount;

            _context.Attempts.Add(attempt);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = attempt.Id }, new
            {
                attempt.Id,
                attempt.Score,
                attempt.TotalQuestions,
                Percentage = (correctCount * 100.0 / quiz.Questions.Count),
                Message = $"Quiz completed! You scored {correctCount} out of {quiz.Questions.Count}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting attempt");
            return StatusCode(500, new { error = "An error occurred while submitting the attempt" });
        }
    }

    /// <summary>
    /// Get leaderboard for a quiz
    /// </summary>
    [HttpGet("leaderboard/{quizId}")]
    public async Task<ActionResult> GetLeaderboard(int quizId, [FromQuery] int limit = 10)
    {
        try
        {
            var leaderboard = await _context.Attempts
                .Include(a => a.User)
                .Where(a => a.QuizId == quizId && a.CompletedAt != null)
                .GroupBy(a => a.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    UserName = g.First().User!.Name,
                    BestScore = g.Max(a => a.Score),
                    TotalQuestions = g.First().TotalQuestions,
                    AttemptCount = g.Count(),
                    BestAttemptDate = g.OrderByDescending(a => a.Score).First().CompletedAt
                })
                .OrderByDescending(x => x.BestScore)
                .Take(limit)
                .ToListAsync();

            return Ok(leaderboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leaderboard for quiz {QuizId}", quizId);
            return StatusCode(500, new { error = "An error occurred while retrieving the leaderboard" });
        }
    }
}

public class SubmitAttemptDto
{
    public int QuizId { get; set; }
    public int UserId { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}

public class AnswerDto
{
    public int QuestionId { get; set; }
    public int SelectedOptionId { get; set; }
}
