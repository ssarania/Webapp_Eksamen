using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add API controllers support
builder.Services.AddControllers();

// Cookie authentication for server-side sessions (used by GitHub OAuth callback)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "QuizApp.Auth";
        options.Cookie.HttpOnly = true;
        // For MVP local development without HTTPS make the cookie non-secure
        // Note: modern browsers may ignore cookies with SameSite=None unless Secure is set.
        // We choose Lax here to improve compatibility during development without HTTPS.
        options.Cookie.SecurePolicy = CookieSecurePolicy.None;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);

        // For API requests we don't want automatic HTML redirect to the login page.
        // Return 401/403 status codes instead of performing a redirect when the
        // request path starts with /api.
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = ctx =>
            {
                if (ctx.Request.Path.StartsWithSegments("/api"))
                {
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                }
                ctx.Response.Redirect(ctx.RedirectUri);
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = ctx =>
            {
                if (ctx.Request.Path.StartsWithSegments("/api"))
                {
                    ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                }
                ctx.Response.Redirect(ctx.RedirectUri);
                return Task.CompletedTask;
            }
        };
    });

// Register HttpClient for GitHub OAuth
builder.Services.AddHttpClient();

// Add Swagger/OpenAPI support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "BasicProject API", Version = "v1" });
});

// Configure EF Core with Npgsql (PostgreSQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<BasicProject.Data.AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

// Register repositories
builder.Services.AddScoped<BasicProject.Data.Repositories.IUserRepository, BasicProject.Data.Repositories.UserRepository>();
builder.Services.AddScoped<BasicProject.Data.Repositories.IQuizRepository, BasicProject.Data.Repositories.QuizRepository>();

// Configure CORS so the frontend (Vite dev server) can call the API during development
var viteDevOrigin = "http://localhost:5173";
var corsPolicyName = "AllowViteDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.WithOrigins(viteDevOrigin)
              .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    // Enable Swagger in development
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BasicProject API v1");
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Enable the configured CORS policy so preflight runs before auth
app.UseCors(corsPolicyName);

// Enable authentication middleware so cookie sign-in works
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers(); // Map API controllers
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
