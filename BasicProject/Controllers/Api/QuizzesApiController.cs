using BasicProject.Data;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    /// Get all quizzes (with question count)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        try
        {
            var quizzes = await _context.Quizzes
                .Include(q => q.Author)
                .Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.AuthorId,
                    AuthorName = q.Author != null ? q.Author.Name : null,
                    q.CreatedAt,
                    QuestionCount = q.Questions.Count()
                })
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
    /// Get quiz by ID (with questions and options)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id, [FromQuery] bool includeAnswers = false)
    {
        try
        {
            var query = _context.Quizzes
                .Include(q => q.Author)
                .Include(q => q.Questions.OrderBy(qu => qu.Order))
                    .ThenInclude(qu => qu.Options)
                .Where(q => q.Id == id);

            var quiz = await query.FirstOrDefaultAsync();
            
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            // Don't expose correct answers unless explicitly requested
            var result = new
            {
                quiz.Id,
                quiz.Title,
                quiz.Description,
                quiz.AuthorId,
                AuthorName = quiz.Author?.Name,
                quiz.CreatedAt,
                Questions = quiz.Questions.Select(q => new
                {
                    q.Id,
                    q.Text,
                    q.Order,
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
            return StatusCode(500, new { error = "An error occurred while retrieving the quiz" });
        }
    }

    /// <summary>
    /// Create a new quiz with questions and options
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateQuizDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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
            var quiz = new Quiz 
            { 
                Title = dto.Title,
                Description = dto.Description,
                AuthorId = dto.AuthorId,
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
            
            return CreatedAtAction(nameof(GetById), new { id = quiz.Id }, new { id = quiz.Id, quiz.Title });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quiz");
            return StatusCode(500, new { error = "An error occurred while creating the quiz" });
        }
    }

    /// <summary>
    /// Update an existing quiz
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuizDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var quiz = await _quizzes.GetByIdAsync(id);
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.AuthorId = dto.AuthorId;
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
    /// Delete a quiz
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var quiz = await _quizzes.GetByIdAsync(id);
            if (quiz == null)
                return NotFound(new { error = $"Quiz with ID {id} not found" });

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
    public int AuthorId { get; set; }
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
    public int AuthorId { get; set; }
}
