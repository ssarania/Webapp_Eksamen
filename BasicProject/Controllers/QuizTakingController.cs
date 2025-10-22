using BasicProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Controllers;

public class QuizTakingController : Controller
{
    private readonly AppDbContext _context;
    private readonly ILogger<QuizTakingController> _logger;

    public QuizTakingController(AppDbContext context, ILogger<QuizTakingController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: QuizTaking/Take/{id}
    public async Task<IActionResult> Take(int id)
    {
        try
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Author)
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .AsSplitQuery() // Optimize query performance
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound();
            }

            // Order questions by their Order property
            quiz.Questions = quiz.Questions.OrderBy(q => q.Order).ToList();

            ViewBag.QuizId = quiz.Id;
            ViewBag.QuizTitle = quiz.Title;
            ViewBag.QuizDescription = quiz.Description;
            ViewBag.AuthorName = quiz.Author?.Name;
            ViewBag.TotalQuestions = quiz.Questions.Count;

            return View();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading quiz {QuizId}", id);
            return RedirectToAction("Index", "Home");
        }
    }

    // GET: QuizTaking/Results/{id}
    public async Task<IActionResult> Results(int id)
    {
        try
        {
            var attempt = await _context.Attempts
                .Include(a => a.Quiz)
                .Include(a => a.User)
                .Include(a => a.Answers)
                    .ThenInclude(aa => aa.Question)
                .Include(a => a.Answers)
                    .ThenInclude(aa => aa.SelectedOption)
                .AsSplitQuery() // Optimize query performance
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attempt == null)
            {
                _logger.LogWarning("Attempt {AttemptId} not found", id);
                return NotFound($"Attempt with ID {id} not found");
            }

            // Get all questions with their options to show correct answers
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .AsSplitQuery() // Optimize query performance
                .FirstOrDefaultAsync(q => q.Id == attempt.QuizId);

            if (quiz == null)
            {
                _logger.LogWarning("Quiz {QuizId} not found for attempt {AttemptId}", attempt.QuizId, id);
                return NotFound($"Quiz not found");
            }

            // Sort questions manually
            quiz.Questions = quiz.Questions.OrderBy(q => q.Order).ToList();

            ViewBag.Attempt = attempt;
            ViewBag.Quiz = quiz;
            ViewBag.Percentage = attempt.TotalQuestions > 0 
                ? Math.Round((double)attempt.Score / attempt.TotalQuestions * 100, 1) 
                : 0;

            return View();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading results for attempt {AttemptId}", id);
            return RedirectToAction("Index", "Home");
        }
    }
}
