using BasicProject.Data;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BasicProject.Controllers.Api;

[ApiController]
[Route("api/quizzes")]
public class QuizzesApiController : ControllerBase
{
    private readonly IQuizRepository _quizzes;
    private readonly AppDbContext _context;
    private readonly ILogger<QuizzesApiController> _logger;

    public QuizzesApiController(IQuizRepository quizzes, AppDbContext context, ILogger<QuizzesApiController> logger)
    {
        _quizzes = quizzes;
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
    /// Get all quizzes the current user can see: their own quizzes + all public quizzes
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        try
        {
            var currentUserId = await GetCurrentUserIdAsync();
            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;

            // Log for debugging
            _logger.LogInformation("GetAll quizzes - CurrentUserId: {UserId}, UsernameClaim: {Username}, IsAuthenticated: {IsAuth}, Claims: {Claims}", 
                currentUserId, 
                usernameClaim,
                User.Identity?.IsAuthenticated,
                string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));

            var quizzes = await _context.Quizzes
                .Include(q => q.Author)
                .Where(q => q.IsPublic 
                            || (currentUserId.HasValue && q.AuthorId == currentUserId.Value)
                            || (!string.IsNullOrEmpty(usernameClaim) && q.Author != null && q.Author.UserName == usernameClaim)
                      )
                .Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.AuthorId,
                    AuthorName = q.Author != null ? q.Author.Name : null,
                    q.IsPublic,
                    q.CreatedAt,
                    QuestionCount = q.Questions.Count(),
                    IsOwned = (currentUserId.HasValue && q.AuthorId == currentUserId.Value)
                              || (!string.IsNullOrEmpty(usernameClaim) && q.Author != null && q.Author.UserName == usernameClaim)
                })
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
            
            return Ok(quizzes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching quizzes");
            return StatusCode(500, new { error = "An error occurred while fetching quizzes", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Get only the current user's quizzes (requires authentication)
    /// </summary>
    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyQuizzes()
    {
        try
        {
            var currentUserId = await GetCurrentUserIdAsync();
            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            if (!currentUserId.HasValue && string.IsNullOrEmpty(usernameClaim))
                return Unauthorized(new { error = "User not authenticated" });

            var quizzes = await _context.Quizzes
                .Include(q => q.Author)
                .Where(q => (currentUserId.HasValue && q.AuthorId == currentUserId.Value)
                            || (!string.IsNullOrEmpty(usernameClaim) && q.Author != null && q.Author.UserName == usernameClaim))
                .Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.AuthorId,
                    AuthorName = q.Author != null ? q.Author.Name : null,
                    q.IsPublic,
                    q.CreatedAt,
                    QuestionCount = q.Questions.Count()
                })
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
            
            return Ok(quizzes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user's quizzes");
            return StatusCode(500, new { error = "An error occurred while retrieving quizzes" });
        }
    }

    /// <summary>
    /// Get quiz by ID (with questions and options)
    /// Allows viewing if quiz is public or user is the author
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id, [FromQuery] bool includeAnswers = false)
    {
        try
        {
            var currentUserId = await GetCurrentUserIdAsync();
            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            var query = _context.Quizzes
                .Include(q => q.Author)
                .Include(q => q.Questions.OrderBy(qu => qu.Order))
                    .ThenInclude(qu => qu.Options)
                .Where(q => q.Id == id);

            var quiz = await query.FirstOrDefaultAsync();
            
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Authorization: allow if public or if user is the author
            bool isOwner = (currentUserId.HasValue && quiz.AuthorId == currentUserId.Value)
                           || (!string.IsNullOrEmpty(usernameClaim) && quiz.Author?.UserName == usernameClaim);
			// Log for debugging
			
            if (!quiz.IsPublic && !isOwner)
                return Forbid();

            // Don't expose correct answers unless explicitly requested
            var result = new
            {
                quiz.Id,
                quiz.Title,
                quiz.Description,
                quiz.AuthorId,
                AuthorName = quiz.Author?.Name,
                quiz.IsPublic,
                quiz.CreatedAt,
                IsOwned = isOwner,
                Questions = quiz.Questions.Select(q => new
                {
                    q.Id,
                    q.Text,
                    q.Order,
                    q.Explanation,
                    Options = q.Options.Select(o => new
                    {
                        o.Id,
                        o.Text,
                        IsCorrect = includeAnswers ? o.IsCorrect : (bool?)null
                    })
                })
            };
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quiz {QuizId}", id);
            return StatusCode(500, new { error = "An error occurred while retrieving the quiz", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Create a new quiz with questions and options (requires authentication)
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateQuizDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUserId = await GetCurrentUserIdAsync();
        if (!currentUserId.HasValue)
            return Unauthorized(new { error = "User not authenticated" });

        // Validate questions
        if (dto.Questions == null || !dto.Questions.Any())
            return BadRequest(new { error = "A quiz must have at least one question" });

        foreach (var q in dto.Questions)
        {
            if (q.Options == null || q.Options.Count < 2 || q.Options.Count > 4)
                return BadRequest(new { error = "Each question must have 2-4 options" });

            if (q.Options.Count(o => o.IsCorrect) != 1)
                return BadRequest(new { error = "Each question must have exactly one correct answer" });
        }

        try
        {
            _logger.LogDebug("Create quiz request by claims: {Claims}", User.Claims.Select(c => new { c.Type, c.Value }));
            // Ensure the author exists in the database. Some authentication flows may
            // include a user id claim that doesn't correspond to a local DB user yet.
            // Resolve or create a local user record and use its Id as AuthorId.
            User? dbUser = await _context.Users.FindAsync(currentUserId.Value);
            var usernameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var accessTokenClaim = User.FindFirst("access_token")?.Value;

            if (dbUser == null)
            {
                // Try to resolve by username claim
                if (!string.IsNullOrEmpty(usernameClaim))
                {
                    dbUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == usernameClaim);
                }

                // If still not found, create a minimal local user using the GitHub id
                if (dbUser == null)
                {
                    if (string.IsNullOrEmpty(usernameClaim))
                    {
                        _logger.LogWarning("Authenticated principal has NameIdentifier={Id} but no matching local user and no username claim. Claims: {Claims}", currentUserId.Value, User.Claims.Select(c => new { c.Type, c.Value }));
                        return Unauthorized(new { error = "Authenticated user not found in local database; please sign in via GitHub to complete account linkage." });
                    }

                    var nameClaim = User.FindFirst("name")?.Value;
                    var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                    dbUser = new User
                    {
                        // set the local user id to the GitHub numeric id
                        Id = currentUserId.Value,
                        UserName = usernameClaim ?? $"user_{Guid.NewGuid()}",
                        Name = nameClaim ?? usernameClaim ?? string.Empty,
                        Email = emailClaim ?? string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        GitHubAccessToken = accessTokenClaim
                    };
                    _context.Users.Add(dbUser);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Created local user {UserName} (Id={Id}) during quiz creation", dbUser.UserName, dbUser.Id);
                }
                else
                {
                    // Found by username; if there's a mismatch between local id and GitHub id,
                    // ensure we have a user row that matches the GitHub id so quizzes can be authored by it.
                    if (dbUser.Id != currentUserId.Value)
                    {
                        var ghUser = await _context.Users.FindAsync(currentUserId.Value);
                        if (ghUser == null)
                        {
                            // Create a mapping user with the GitHub id to preserve the canonical GitHub id PK
                            ghUser = new User
                            {
                                Id = currentUserId.Value,
                                UserName = dbUser.UserName,
                                Name = dbUser.Name,
                                Email = dbUser.Email,
                                CreatedAt = DateTime.UtcNow,
                                GitHubAccessToken = accessTokenClaim
                            };
                            _context.Users.Add(ghUser);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Created GitHub-mapped user {UserName} (Id={Id}) during quiz creation", ghUser.UserName, ghUser.Id);
                        }

                        dbUser = ghUser;
                    }
                }

                // Update currentUserId to the resolved local DB id (now set to GitHub id)
                currentUserId = dbUser.Id;
            }

            // Always set the quiz author to the resolved local DB user id
            var quiz = new Quiz
            {
                Title = dto.Title,
                Description = dto.Description,
                AuthorId = currentUserId.Value,
                IsPublic = dto.IsPublic,
                CreatedAt = DateTime.UtcNow
            };

            // Add questions
            int order = 0;
            foreach (var qDto in dto.Questions)
            {
                var question = new Question
                {
                    Text = qDto.Text,
                    Explanation = qDto.Explanation,
                    Order = order++,
                    Options = qDto.Options.Select(oDto => new QuestionOption
                    {
                        Text = oDto.Text,
                        IsCorrect = oDto.IsCorrect
                    }).ToList()
                };
                quiz.Questions.Add(question);
            }

            await _quizzes.AddAsync(quiz);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetById), new { id = quiz.Id }, new 
            { 
                id = quiz.Id, 
                quiz.Title,
                quiz.IsPublic,
                quiz.AuthorId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quiz");
            return StatusCode(500, new { error = "An error occurred while creating the quiz", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Update an existing quiz (owner only)
    /// </summary>
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuizDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUserId = await GetCurrentUserIdAsync();
        if (!currentUserId.HasValue)
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == id);
            
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Authorization: only owner can update
            if (quiz.AuthorId != currentUserId.Value)
                return Forbid();

            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.IsPublic = dto.IsPublic;

            // Only update questions if explicitly provided AND different from current
            // Don't update if dto.Questions is null (means don't touch questions)
            if (dto.Questions != null && dto.Questions.Any())
            {
                // Validate questions
                foreach (var q in dto.Questions)
                {
                    if (q.Options == null || q.Options.Count < 2 || q.Options.Count > 4)
                        return BadRequest(new { error = "Each question must have 2-4 options" });

                    if (q.Options.Count(o => o.IsCorrect) != 1)
                        return BadRequest(new { error = "Each question must have exactly one correct answer" });
                }

                // Delete all AttemptAnswers for this quiz's questions to avoid foreign key constraint violations
                var questionIds = quiz.Questions.Select(q => q.Id).ToList();
                var attemptAnswersToDelete = await _context.AttemptAnswers
                    .Where(aa => questionIds.Contains(aa.QuestionId))
                    .ToListAsync();
                
                if (attemptAnswersToDelete.Any())
                {
                    _context.AttemptAnswers.RemoveRange(attemptAnswersToDelete);
                }

                // Now remove old questions and options
                _context.Questions.RemoveRange(quiz.Questions);
                quiz.Questions.Clear();

                // Add new questions
                int order = 0;
                foreach (var qDto in dto.Questions)
                {
                    var question = new Question
                    {
                        Text = qDto.Text,
                        Explanation = qDto.Explanation,
                        Order = order++,
                        Options = qDto.Options.Select(oDto => new QuestionOption
                        {
                            Text = oDto.Text,
                            IsCorrect = oDto.IsCorrect
                        }).ToList()
                    };
                    quiz.Questions.Add(question);
                }
            }

            _quizzes.Update(quiz);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating quiz {QuizId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the quiz", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Delete a quiz (owner only)
    /// </summary>
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var currentUserId = await GetCurrentUserIdAsync();
        if (!currentUserId.HasValue)
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            // Load quiz with all related entities for proper cascade delete
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.AttemptAnswers)
                .Include(q => q.Attempts)
                .FirstOrDefaultAsync(q => q.Id == id);
                
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Authorization: only owner can delete
            if (quiz.AuthorId != currentUserId.Value)
                return Forbid();

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting quiz {QuizId}", id);
            return StatusCode(500, new { error = "An error occurred while deleting the quiz" });
        }
    }
}

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = false;
    public List<CreateQuestionDto> Questions { get; set; } = new();
}

public class CreateQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public List<CreateOptionDto> Options { get; set; } = new();
}

public class CreateOptionDto
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class UpdateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = false;
    public List<CreateQuestionDto>? Questions { get; set; }
}

