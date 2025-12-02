using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace BasicProject.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AuthController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    // This endpoint is intended to be the GitHub OAuth callback URL (set this in the GitHub OAuth app)
    // Example: https://localhost:5001/auth/github/callback
    [HttpGet("github/callback")]
    public async Task<IActionResult> GitHubCallback([FromQuery] string? code)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest("Missing authorization code");

        var clientId = _configuration["GitHub:ClientId"] ?? string.Empty;
        var clientSecret = _configuration["GitHub:ClientSecret"] ?? string.Empty;

        try
        {
            var tokenUrl = "https://github.com/login/oauth/access_token";
            var userUrl = "https://api.github.com/user";

            var httpClient = _httpClientFactory.CreateClient();

            var tokenRequest = new Dictionary<string, string>
            {
                { "client_id", clientId },
                { "client_secret", clientSecret },
                { "code", code }
            };

            using var tokenHttpRequest = new HttpRequestMessage(HttpMethod.Post, tokenUrl)
            {
                Content = new FormUrlEncodedContent(tokenRequest)
            };
            tokenHttpRequest.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var tokenResponse = await httpClient.SendAsync(tokenHttpRequest);
            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();

            if (!tokenResponse.IsSuccessStatusCode)
            {
                return BadRequest(new { error = "Failed to exchange code for token", detail = tokenContent });
            }

            string? accessToken = null;
            try
            {
                using var doc = JsonDocument.Parse(tokenContent);
                var root = doc.RootElement;
                if (root.TryGetProperty("access_token", out var at)) accessToken = at.GetString();
            }
            catch
            {
                var tokenParams = System.Web.HttpUtility.ParseQueryString(tokenContent);
                accessToken = tokenParams["access_token"];
            }

            if (string.IsNullOrEmpty(accessToken))
            {
                return BadRequest(new { error = "no_access_token", detail = tokenContent });
            }

            // Fetch user info
            using var userRequest = new HttpRequestMessage(HttpMethod.Get, userUrl);
            userRequest.Headers.Add("Authorization", $"token {accessToken}");
            userRequest.Headers.Add("Accept", "application/vnd.github.v3+json");
            userRequest.Headers.Add("User-Agent", "QuizApp");

            var userResponse = await httpClient.SendAsync(userRequest);
            var userContent = await userResponse.Content.ReadAsStringAsync();
            if (!userResponse.IsSuccessStatusCode)
            {
                return BadRequest(new { error = "Failed to fetch user data", detail = userContent });
            }

            using var userDoc = JsonDocument.Parse(userContent);
            var userRoot = userDoc.RootElement;
            var login = userRoot.GetProperty("login").GetString() ?? string.Empty;
            var id = userRoot.GetProperty("id").GetInt32().ToString();
            var name = userRoot.TryGetProperty("name", out var nameEl) ? nameEl.GetString() : null;
            var email = userRoot.TryGetProperty("email", out var emailEl) ? emailEl.GetString() : null;

            // Create claims and sign in with cookie auth
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim(ClaimTypes.Name, login),
            };
            if (!string.IsNullOrEmpty(name)) claims.Add(new Claim("name", name));
            if (!string.IsNullOrEmpty(email)) claims.Add(new Claim(ClaimTypes.Email, email));
            // Optionally keep the access token as a claim (be cautious in production)
            claims.Add(new Claim("access_token", accessToken));

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            var props = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            };

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, props);

            // Redirect to frontend profile page
            var frontendUrl = "http://localhost:5173/profile";
            return Redirect(frontendUrl);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("signout")]
    public async Task<IActionResult> SignOut()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { signedOut = true });
    }
}
