using BasicProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Controllers.Api;

[ApiController]
[Route("api/debug")]
public class DebugApiController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<DebugApiController> _logger;

    public DebugApiController(AppDbContext context, ILogger<DebugApiController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all users and quizzes in the database (for debugging)
    /// </summary>
    [HttpGet("database-contents")]
    public async Task<IActionResult> GetDatabaseContents()
    {
        try
        {
            var users = await _context.Users.ToListAsync();
            var quizzes = await _context.Quizzes
                .Include(q => q.Author)
                .Include(q => q.Questions)
                .ToListAsync();

            return Ok(new
            {
                users = users.Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.UserName,
                    u.Email,
                    u.CreatedAt
                }),
                quizzes = quizzes.Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.AuthorId,
                    AuthorName = q.Author?.Name,
                    q.IsPublic,
                    q.CreatedAt,
                    QuestionCount = q.Questions.Count
                }),
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving database contents");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get current user info from claims
    /// </summary>
    [HttpGet("current-user")]
    public IActionResult GetCurrentUser()
    {
        var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);
        
        return Ok(new
        {
            isAuthenticated = User.Identity?.IsAuthenticated,
            claims = claims,
            nameIdentifier = claims.ContainsKey(System.Security.Claims.ClaimTypes.NameIdentifier) 
                ? claims[System.Security.Claims.ClaimTypes.NameIdentifier] 
                : null,
            name = claims.ContainsKey(System.Security.Claims.ClaimTypes.Name) 
                ? claims[System.Security.Claims.ClaimTypes.Name] 
                : null
        });
    }
}
