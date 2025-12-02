using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using BasicProject.Data;
using BasicProject.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Controllers.Api;

[ApiController]
[Route("api/auth")]
public class GitHubAuthController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    // GitHub OAuth configuration
    private readonly string _gitHubClientId;
    private readonly string _gitHubClientSecret;
    private readonly string _gitHubTokenUrl = "https://github.com/login/oauth/access_token";
    private readonly string _gitHubUserUrl = "https://api.github.com/user";

    public GitHubAuthController(HttpClient httpClient, IConfiguration configuration, AppDbContext context)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _context = context;
        
        // Get GitHub OAuth credentials from configuration
        _gitHubClientId = _configuration["GitHub:ClientId"] ?? "";
        _gitHubClientSecret = _configuration["GitHub:ClientSecret"] ?? "";
    }

    [HttpPost("github/callback")]
    public async Task<IActionResult> GitHubCallback([FromBody] GitHubCallbackRequest request)
    {
        if (string.IsNullOrEmpty(request.Code))
            return BadRequest(new { error = "Authorization code is required" });

        try
        {
            // Step 1: Exchange code for access token
            var tokenRequest = new Dictionary<string, string>
            {
                { "client_id", _gitHubClientId },
                { "client_secret", _gitHubClientSecret },
                { "code", request.Code }
            };

            using var tokenHttpRequest = new HttpRequestMessage(HttpMethod.Post, _gitHubTokenUrl)
            {
                Content = new FormUrlEncodedContent(tokenRequest)
            };
            // Ask GitHub to return JSON for easier parsing
            tokenHttpRequest.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var tokenResponse = await _httpClient.SendAsync(tokenHttpRequest);

            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
            if (!tokenResponse.IsSuccessStatusCode)
            {
                // Return the raw token endpoint response to help debugging
                return BadRequest(new { error = "Failed to exchange code for token", detail = tokenContent });
            }

            string? accessToken = null;
            string? error = null;

            // GitHub returns JSON when Accept: application/json is set
            try
            {
                using var doc = JsonDocument.Parse(tokenContent);
                var root = doc.RootElement;
                if (root.TryGetProperty("access_token", out var at)) accessToken = at.GetString();
                if (root.TryGetProperty("error", out var er)) error = er.GetString();
            }
            catch
            {
                // Fallback: parse query string format
                var tokenParams = System.Web.HttpUtility.ParseQueryString(tokenContent);
                accessToken = tokenParams["access_token"];
                error = tokenParams["error"];
            }

            if (!string.IsNullOrEmpty(error) || string.IsNullOrEmpty(accessToken))
                return BadRequest(new { error = error ?? "no_access_token", detail = tokenContent });

            // Step 2: Fetch user info from GitHub API
            using var userRequest = new HttpRequestMessage(HttpMethod.Get, _gitHubUserUrl);
            userRequest.Headers.Add("Authorization", $"token {accessToken}");
            userRequest.Headers.Add("Accept", "application/vnd.github.v3+json");
            userRequest.Headers.Add("User-Agent", "QuizApp");

            var userResponse = await _httpClient.SendAsync(userRequest);

            if (!userResponse.IsSuccessStatusCode)
                return BadRequest(new { error = "Failed to fetch user data" });

            var userContent = await userResponse.Content.ReadAsStringAsync();
            using var userJsonDoc = JsonDocument.Parse(userContent);
            var userRoot = userJsonDoc.RootElement;

            var user = new
            {
                id = userRoot.GetProperty("id").GetInt32(),
                login = userRoot.GetProperty("login").GetString(),
                name = userRoot.TryGetProperty("name", out var nameEl) ? nameEl.GetString() : null,
                avatar_url = userRoot.GetProperty("avatar_url").GetString(),
                email = userRoot.TryGetProperty("email", out var emailEl) ? emailEl.GetString() : null
            };

            // Upsert the user in the local database using the GitHub login as unique key
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == (user.login ?? string.Empty));
            if (dbUser == null)
            {
                dbUser = new User
                {
                    Name = user.name ?? user.login ?? string.Empty,
                    UserName = user.login ?? string.Empty,
                    Email = user.email ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(dbUser);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update basic profile fields
                dbUser.Name = user.name ?? dbUser.Name;
                dbUser.Email = user.email ?? dbUser.Email;
                _context.Users.Update(dbUser);
                await _context.SaveChangesAsync();
            }

            // Create authentication cookie using the local DB user id so other controllers can use it
            var claims = new List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, dbUser.Id.ToString()),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, dbUser.UserName ?? string.Empty),
            };
            if (!string.IsNullOrEmpty(dbUser.Name)) claims.Add(new System.Security.Claims.Claim("name", dbUser.Name));
            if (!string.IsNullOrEmpty(dbUser.Email)) claims.Add(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, dbUser.Email));
            claims.Add(new System.Security.Claims.Claim("access_token", accessToken));

            var identity = new System.Security.Claims.ClaimsIdentity(claims, Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new System.Security.Claims.ClaimsPrincipal(identity);
            await HttpContext.SignInAsync(Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Ok(new
            {
                accessToken = accessToken,
                user = new { id = dbUser.Id, username = dbUser.UserName, name = dbUser.Name, email = dbUser.Email }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

        [HttpGet("me")]
        public IActionResult Me()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { error = "Not authenticated" });

            var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);
            return Ok(new
            {
                id = claims.ContainsKey(System.Security.Claims.ClaimTypes.NameIdentifier) ? claims[System.Security.Claims.ClaimTypes.NameIdentifier] : null,
                login = claims.ContainsKey(System.Security.Claims.ClaimTypes.Name) ? claims[System.Security.Claims.ClaimTypes.Name] : null,
                name = claims.ContainsKey("name") ? claims["name"] : null,
                email = claims.ContainsKey(System.Security.Claims.ClaimTypes.Email) ? claims[System.Security.Claims.ClaimTypes.Email] : null,
                accessToken = claims.ContainsKey("access_token") ? claims["access_token"] : null
            });
        }
}

public class GitHubCallbackRequest
{
    public string? Code { get; set; }
    public string? State { get; set; }
}
