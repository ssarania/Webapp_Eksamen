using BasicProject.Data;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BasicProject.Controllers.Api;

[ApiController]
[Route("api/users")]
public class UsersApiController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly AppDbContext _context;
    private readonly ILogger<UsersApiController> _logger;

    public UsersApiController(IUserRepository users, AppDbContext context, ILogger<UsersApiController> logger)
    {
        _users = users;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        try
        {
            var users = await _users.GetAllAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new { error = "An error occurred while retrieving users", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(long id)
    {
        try
        {
            var user = await _users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { error = $"User with ID {id} not found" });
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, new { error = "An error occurred while retrieving the user", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<User>> Create([FromBody] CreateUserDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var user = new User { Name = dto.Name };
            await _users.AddAsync(user);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { error = "An error occurred while creating the user", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var user = await _users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { error = $"User with ID {id} not found" });

            user.Name = dto.Name;
            _users.Update(user);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the user", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        try
        {
            var user = await _users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { error = $"User with ID {id} not found" });

            _users.Remove(user);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { error = "An error occurred while deleting the user", details = ex.Message, innerError = ex.InnerException?.Message });
        }
    }
}

public class CreateUserDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string Name { get; set; } = string.Empty;
}
