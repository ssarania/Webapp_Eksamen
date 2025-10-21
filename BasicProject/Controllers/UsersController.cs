using BasicProject.Data;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BasicProject.Controllers;

public class UsersController : Controller
{
    private readonly IUserRepository _users;
    private readonly AppDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserRepository users, AppDbContext context, ILogger<UsersController> logger)
    {
        _users = users;
        _context = context;
        _logger = logger;
    }

    public async Task<IActionResult> Index()
    {
        var list = await _users.GetAllAsync();
        return View(list);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name")] User user)
    {
        if (!ModelState.IsValid)
            return View(user);

        try
        {
            await _users.AddAsync(user);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            ModelState.AddModelError(string.Empty, "An error occurred while creating the user.");
            return View(user);
        }
    }

    public async Task<IActionResult> Edit(int id)
    {
        var user = await _users.GetByIdAsync(id);
        if (user == null) return NotFound();
        return View(user);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Name")] User user)
    {
        if (id != user.Id) return BadRequest();
        if (!ModelState.IsValid) return View(user);

        try
        {
            _users.Update(user);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            ModelState.AddModelError(string.Empty, "An error occurred while updating the user.");
            return View(user);
        }
    }

    public async Task<IActionResult> Delete(int id)
    {
        var user = await _users.GetByIdAsync(id);
        if (user == null) return NotFound();
        return View(user);
    }

    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var user = await _users.GetByIdAsync(id);
        if (user == null) return NotFound();
        try
        {
            _users.Remove(user);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            ModelState.AddModelError(string.Empty, "An error occurred while deleting the user.");
            return View(user);
        }
    }
}
