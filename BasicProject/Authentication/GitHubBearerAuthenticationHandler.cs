using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using BasicProject.Data;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Authentication;

/// <summary>
/// Custom authentication scheme that handles Bearer tokens containing GitHub access tokens
/// </summary>
public class GitHubBearerAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly AppDbContext _context;

    public GitHubBearerAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock,
        AppDbContext context)
        : base(options, logger, encoder, clock)
    {
        _context = context;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Try to get Bearer token from Authorization header
        var authHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.NoResult();
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();

        try
        {
            // Find user by access token stored in the cookie/claims
            // For now, we'll try to find the user by querying the database
            // In a real scenario, you might validate the token with GitHub or use a token store
            
            // Look for a user that has this GitHub token stored
            // Since we're storing the token in localStorage on the client side,
            // we need to trust it and extract user info from it
            // For a real implementation, you'd validate this against GitHub API
            
            Logger.LogInformation("Bearer token authentication attempt");
            
            // Return NoResult to let the next handler (Cookie) try
            // If neither work, authentication fails
            return AuthenticateResult.NoResult();
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error during Bearer token authentication");
            return AuthenticateResult.Fail("Bearer token validation failed");
        }
    }
}
