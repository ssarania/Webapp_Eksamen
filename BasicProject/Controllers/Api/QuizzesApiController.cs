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
    /// Get the currently authenticated user's ID from claims
    /// </summary>
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            return userId;
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
            var currentUserId = GetCurrentUserId();

            var quizzes = await _context.Quizzes
                .Include(q => q.Author)
                .Where(q => q.IsPublic || (currentUserId.HasValue && q.AuthorId == currentUserId.Value))
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
                    IsOwned = currentUserId.HasValue && q.AuthorId == currentUserId.Value
                })
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
            
            return Ok(quizzes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quizzes");
            return StatusCode(500, new { error = "An error occurred while retrieving quizzes" });
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
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(new { error = "User not authenticated" });

            var quizzes = await _context.Quizzes
                .Include(q => q.Author)
                .Where(q => q.AuthorId == currentUserId.Value)
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
            var currentUserId = GetCurrentUserId();
            var query = _context.Quizzes
                .Include(q => q.Author)
                .Include(q => q.Questions.OrderBy(qu => qu.Order))
                    .ThenInclude(qu => qu.Options)
                .Where(q => q.Id == id);

            var quiz = await query.FirstOrDefaultAsync();
            
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Authorization: allow if public or if user is the author
            bool isOwner = currentUserId.HasValue && quiz.AuthorId == currentUserId.Value;
            if (!quiz.IsPublic && !isOwner)
                return Forbid();

            // Don't expose correct answers unless explicitly requested (and user is owner)
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
                    Options = q.Options.Select(o => new
                    {
                        o.Id,
                        o.Text,
                        IsCorrect = (includeAnswers && isOwner) ? o.IsCorrect : (bool?)null
                    })
                })
            };
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quiz {QuizId}", id);
            return StatusCode(500, new { error = "An error occurred while retrieving the quiz" });
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

        var currentUserId = GetCurrentUserId();
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
            // Always set the quiz author to the current authenticated user
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
            return StatusCode(500, new { error = "An error occurred while creating the quiz" });
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

        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var quiz = await _quizzes.GetByIdAsync(id);
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Authorization: only owner can update
            if (quiz.AuthorId != currentUserId.Value)
                return Forbid();

            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.IsPublic = dto.IsPublic;
            _quizzes.Update(quiz);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating quiz {QuizId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the quiz" });
        }
    }

    /// <summary>
    /// Delete a quiz (owner only)
    /// </summary>
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var quiz = await _quizzes.GetByIdAsync(id);
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Authorization: only owner can delete
            if (quiz.AuthorId != currentUserId.Value)
                return Forbid();

            _quizzes.Remove(quiz);
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
}

