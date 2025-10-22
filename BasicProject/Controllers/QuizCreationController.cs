using BasicProject.Data;
using BasicProject.Data.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Controllers;

public class QuizCreationController : Controller
{
    private readonly IUserRepository _users;
    private readonly AppDbContext _context;
    private readonly ILogger<QuizCreationController> _logger;

    public QuizCreationController(IUserRepository users, AppDbContext context, ILogger<QuizCreationController> logger)
    {
        _users = users;
        _context = context;
        _logger = logger;
    }

    // GET: QuizCreation/Create
    public async Task<IActionResult> Create()
    {
        // Get all users for author selection
        var users = await _users.GetAllAsync();
        ViewBag.Users = users;
        return View();
    }

    // GET: QuizCreation/Success/{id}
    public async Task<IActionResult> Success(int id)
    {
        try
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Author)
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound();
            }

            ViewBag.QuizId = quiz.Id;
            ViewBag.QuizTitle = quiz.Title;
            ViewBag.QuizDescription = quiz.Description;
            ViewBag.AuthorName = quiz.Author?.Name;
            ViewBag.QuestionCount = quiz.Questions.Count;
            
            // Generate shareable link (adjust base URL as needed)
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            ViewBag.ShareLink = $"{baseUrl}/QuizTaking/Take/{quiz.Id}";
            ViewBag.ApiLink = $"{baseUrl}/api/QuizzesApi/{quiz.Id}";

            return View();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading success page for quiz {QuizId}", id);
            return RedirectToAction("Create");
        }
    }
}
