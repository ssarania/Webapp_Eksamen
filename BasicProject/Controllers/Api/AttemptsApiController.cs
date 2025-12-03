using BasicProject.Data;
using BasicProject.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BasicProject.Controllers.Api;

[ApiController]
[Route("api/attempts")]
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
    /// Get the currently authenticated user's ID from claims or Bearer token
    /// </summary>
    private async Task<long?> GetCurrentUserIdAsync()
    {
        // First try to get from cookie claims (for traditional cookie-based auth)
        // Prefer an explicit GitHub id claim if present (added during GitHub OAuth signin)
        var githubIdClaim = User.FindFirst("github_id");
        if (githubIdClaim != null && long.TryParse(githubIdClaim.Value, out var githubId))
        {
            _logger.LogInformation("User authenticated via cookie claims. GitHubId: {GitHubId}", githubId);
            return githubId;
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && long.TryParse(userIdClaim.Value, out var userId))
        {
            _logger.LogInformation("User authenticated via cookie claims. UserId: {UserId}", userId);
            return userId;
        }

        // Try to get from Bearer token in Authorization header
        var authHeader = Request.Headers.Authorization.ToString();
        
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            _logger.LogInformation("Bearer token found, validating against GitHub API...");
            
            try
            {
                using var client = new HttpClient();
                var userRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
                userRequest.Headers.Add("Authorization", $"token {token}");
                userRequest.Headers.Add("User-Agent", "QuizApp");
                userRequest.Headers.Add("Accept", "application/vnd.github.v3+json");

                var response = await client.SendAsync(userRequest);
                _logger.LogInformation("GitHub API response status: {StatusCode}", response.StatusCode);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = System.Text.Json.JsonDocument.Parse(content);
                    var root = doc.RootElement;
                    var githubLogin = root.GetProperty("login").GetString();
                    _logger.LogInformation("GitHub login from token: {GitHubLogin}", githubLogin);

                    // Find local user by GitHub username
                    var localUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == githubLogin);
                    if (localUser != null)
                    {
                        _logger.LogInformation("Local user found for GitHub login {GitHubLogin}. UserId: {UserId}", githubLogin, localUser.Id);
                        return localUser.Id;
                    }
                    else
                    {
                        _logger.LogWarning("No local user found for GitHub login: {GitHubLogin}", githubLogin);
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("GitHub API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate Bearer token against GitHub API");
            }
        }
        else
        {
            _logger.LogInformation("No Bearer token in Authorization header");
        }

        _logger.LogWarning("Authentication failed - user not identified");
        return null;
    }

    /// <summary>
    /// Get all attempts (optionally filter by user or quiz)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] long? userId = null, [FromQuery] int? quizId = null)
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
            return StatusCode(500, new { error = "An error occurred while retrieving attempts", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Get attempt by ID
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
            return StatusCode(500, new { error = "An error occurred while retrieving the attempt", details = ex.Message, innerError = ex.InnerException?.Message });
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
            // Get authenticated user
            var authenticatedUserId = await GetCurrentUserIdAsync();
            if (authenticatedUserId == null)
            {
                return Unauthorized(new { error = "You must be authenticated to submit an attempt" });
            }

            // Verify quiz exists and load questions with correct answers
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {dto.QuizId} not found" });

            // Use authenticated user ID instead of the one from payload
            var userId = authenticatedUserId.Value;
            _logger.LogInformation("Authenticated user ID: {UserId}, attempting to submit quiz {QuizId}", userId, dto.QuizId);

            // Validate answers
            if (dto.Answers.Count != quiz.Questions.Count)
                return BadRequest(new { error = "You must answer all questions" });

            // Create attempt
            var attempt = new Attempt
            {
                QuizId = dto.QuizId,
                UserId = userId,
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

                // Skip questions that weren't answered (selectedOptionId = 0)
                if (answerDto.SelectedOptionId == 0)
                {
                    attempt.Answers.Add(new AttemptAnswer
                    {
                        QuestionId = answerDto.QuestionId,
                        SelectedOptionId = null, // Store as null instead of 0
                        IsCorrect = false
                    });
                    continue;
                }

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

            _logger.LogInformation("Adding attempt to database. UserId: {UserId}, QuizId: {QuizId}, Score: {Score}", userId, dto.QuizId, correctCount);
            _context.Attempts.Add(attempt);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Attempt saved successfully. AttemptId: {AttemptId}", attempt.Id);

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
            return StatusCode(500, new { 
                error = "An error occurred while submitting the attempt",
                details = ex.Message,
                innerError = ex.InnerException?.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

}

public class SubmitAttemptDto
{
    public int QuizId { get; set; }
    public long UserId { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}

public class AnswerDto
{
    public int QuestionId { get; set; }
    public int SelectedOptionId { get; set; }
}
