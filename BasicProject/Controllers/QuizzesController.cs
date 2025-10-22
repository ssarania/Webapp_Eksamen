using BasicProject.Data;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Controllers;

public class QuizzesController : Controller
{
    private readonly IQuizRepository _quizzes;
    private readonly IUserRepository _users;
    private readonly AppDbContext _context;
    private readonly ILogger<QuizzesController> _logger;

    public QuizzesController(IQuizRepository quizzes, IUserRepository users, AppDbContext context, ILogger<QuizzesController> logger)
    {
        _quizzes = quizzes;
        _users = users;
        _context = context;
        _logger = logger;
    }

    public async Task<IActionResult> Index()
    {
        var list = await _context.Quizzes
            .Include(q => q.Author)
            .Include(q => q.Questions)
            .Include(q => q.Attempts)
            .ToListAsync();
        return View(list);
    }

    public async Task<IActionResult> Create()
    {
        ViewBag.Authors = await _users.GetAllAsync();
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Title,Description,AuthorId")] Quiz quiz)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.Authors = await _users.GetAllAsync();
            return View(quiz);
        }

        try
        {
            await _quizzes.AddAsync(quiz);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quiz");
            ModelState.AddModelError(string.Empty, "An error occurred while creating the quiz.");
            ViewBag.Authors = await _users.GetAllAsync();
            return View(quiz);
        }
    }

    public async Task<IActionResult> Edit(int id)
    {
        var quiz = await _quizzes.GetByIdAsync(id);
        if (quiz == null) return NotFound();
        ViewBag.Authors = await _users.GetAllAsync();
        return View(quiz);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Title,Description,AuthorId")] Quiz quiz)
    {
        if (id != quiz.Id) return BadRequest();
        if (!ModelState.IsValid)
        {
            ViewBag.Authors = await _users.GetAllAsync();
            return View(quiz);
        }

        try
        {
            _quizzes.Update(quiz);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating quiz");
            ModelState.AddModelError(string.Empty, "An error occurred while updating the quiz.");
            ViewBag.Authors = await _users.GetAllAsync();
            return View(quiz);
        }
    }

    public async Task<IActionResult> Delete(int id)
    {
        var quiz = await _quizzes.GetByIdAsync(id);
        if (quiz == null) return NotFound();
        return View(quiz);
    }

    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var quiz = await _quizzes.GetByIdAsync(id);
        if (quiz == null) return NotFound();
        try
        {
            _quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting quiz");
            ModelState.AddModelError(string.Empty, "An error occurred while deleting the quiz.");
            return View(quiz);
        }
    }

    // 👇 NY METODE: brukes når brukeren fullfører en quiz
    [HttpPost]
    public async Task<IActionResult> SubmitQuiz(int quizId, int userId, List<int> selectedOptionIds)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null) return NotFound();

        int correctAnswers = 0;

        foreach (var question in quiz.Questions)
        {
            var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
            if (correctOption != null && selectedOptionIds.Contains(correctOption.Id))
                correctAnswers++;
        }

        var attempt = new Attempt
        {
            QuizId = quizId,
            UserId = userId,
            Score = correctAnswers,
            TotalQuestions = quiz.Questions.Count,
            AttemptedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow
        };

        _context.Attempts.Add(attempt);
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(Index)); // eller til en "Result" view hvis du har det
    }
}
