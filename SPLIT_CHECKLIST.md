# Split Implementation Checklist

## ✅ Completed

### Backend API (`BasicProject/`)
- [x] Removed `AddControllersWithViews()` from `Program.cs`
- [x] Kept only `AddControllers()` for API endpoints
- [x] Removed `app.UseStaticFiles()` (no static files served by backend)
- [x] Removed `MapControllerRoute()` (no MVC view routing)
- [x] Removed error handler that returned `/Home/Error` view
- [x] CORS configured for React dev server (`http://localhost:5173`)
- [x] Cookie authentication configured with proper SameSite/Secure settings
- [x] Swagger/OpenAPI enabled for API documentation
- [x] All API controllers (`Controllers/Api/*`) properly configured with `[ApiController]` and routes

### Frontend (`web/`)
- [x] Created `src/config/api.ts` — centralized API configuration with environment support
- [x] Created `src/lib/apiClient.ts` — reusable fetch utility with error handling
- [x] Created `src/services/authService.ts` — centralized auth operations
- [x] Updated `src/services/api.ts` — uses centralized fetch client, removed hardcoded URLs
- [x] Updated `src/githubOAuthConfig.ts` — dynamic URLs based on environment
- [x] Updated `src/services/githubAuthService.ts` — marked as deprecated, points to new authService
- [x] Updated `vite.config.ts` — proxy configuration for `/api` and `/auth`
- [x] Created `src/vite-env.d.ts` — environment variable type definitions
- [x] Created `.env.example` — documentation for environment variables

### Documentation
- [x] Created `ARCHITECTURE_SPLIT.md` — comprehensive split documentation

---

## ⚠️ Manual Cleanup (Optional)

The following MVC view controllers exist but are **not used by the React app**. They can be archived or deleted:

- `BasicProject/Controllers/AccountController.cs` — MVC login/account management
- `BasicProject/Controllers/AuthController.cs` — MVC auth controller
- `BasicProject/Controllers/DashboardController.cs` — MVC dashboard view
- `BasicProject/Controllers/HomeController.cs` — MVC home page
- `BasicProject/Controllers/MakingTheQuizController.cs` — MVC quiz taking
- `BasicProject/Controllers/QuizCreationController.cs` — MVC quiz creation
- `BasicProject/Controllers/QuizTakingController.cs` — MVC quiz taking
- `BasicProject/Controllers/QuizzesController.cs` — MVC quizzes list
- `BasicProject/Controllers/UsersController.cs` — MVC users page
- `BasicProject/Views/` — entire directory (Razor views)
- `BasicProject/Models/DashboardViewModel.cs`, `ErrorViewModel.cs` — MVC view models

**Recommendation**: Archive these in a separate folder or branch until confirmed React app fully replaces functionality.

---

## 🧪 Testing Checklist

### Backend API
- [ ] Start backend: `cd BasicProject && dotnet run`
- [ ] Verify API runs on `http://localhost:5093`
- [ ] Check Swagger UI at `http://localhost:5093/swagger`
- [ ] Test CORS preflight: `OPTIONS /api/quizzes`
- [ ] Test unauthenticated access: `GET /api/quizzes` (should work for public quizzes)
- [ ] Test authenticated access: `GET /api/quizzes/my` (should require auth)

### Frontend
- [ ] Start frontend: `cd web && npm run dev`
- [ ] Verify dev server runs on `http://localhost:5173`
- [ ] Check that Vite proxy is working: open browser console and verify `/api` calls go to correct backend
- [ ] Test quiz listing: navigates to `/quizzes` and loads quiz list
- [ ] Test authentication: click "Login with GitHub" and verify flow
- [ ] Test quiz creation: create a new quiz and verify it appears in `GET /api/quizzes`
- [ ] Test error handling: verify API errors display properly in React

### Integration
- [ ] Both servers running simultaneously without conflicts
- [ ] React app can call all API endpoints
- [ ] Authentication flow works end-to-end
- [ ] Cookie-based session persists across page reloads
- [ ] Logout clears session properly

---

## 🚀 Deployment Checklist

### Before Production

#### Backend
- [ ] Set `GitHub:ClientId` environment variable
- [ ] Set `GitHub:ClientSecret` environment variable
- [ ] Update `DefaultConnection` to production database
- [ ] Update CORS policy to include production frontend URL
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Review and test authentication flow
- [ ] Update GitHub OAuth app redirect URI to production backend URL

#### Frontend
- [ ] Create `.env.production` with:
  - `VITE_API_URL=https://api.yourdomain.com/api`
  - `VITE_AUTH_URL=https://api.yourdomain.com/auth`
- [ ] Build: `npm run build`
- [ ] Test `dist/` locally: `npm run preview`
- [ ] Deploy `dist/` to static hosting
- [ ] Update GitHub OAuth app redirect URI if needed
- [ ] Test end-to-end in production environment

---

## 📋 Architecture Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| **API Backend** | `BasicProject/` | ASP.NET Core Web API, database, auth |
| **Frontend SPA** | `web/` | React app, user interface |
| **API Config** | `web/src/config/api.ts` | Centralized API base URLs |
| **API Client** | `web/src/lib/apiClient.ts` | Reusable fetch wrapper |
| **Quiz Service** | `web/src/services/api.ts` | Quiz CRUD operations |
| **Auth Service** | `web/src/services/authService.ts` | Authentication operations |
| **Vite Proxy** | `web/vite.config.ts` | Dev server proxy for `/api/*` and `/auth/*` |

---

## 💾 What Was Removed

- ❌ `AddControllersWithViews()` — MVC services
- ❌ `MapControllerRoute()` — MVC view routing
- ❌ `app.UseStaticFiles()` — static file serving (not needed by API)
- ❌ Hardcoded API URL in `web/src/services/api.ts`
- ❌ MVC view controllers and their return statements
- ❌ localStorage-based auth (now uses server sessions)

---

## 🔄 What Changed

- ✅ `Program.cs` — now API-only with CORS for React
- ✅ `web/src/services/api.ts` — uses centralized `fetchApi()` client
- ✅ `web/src/githubOAuthConfig.ts` — dynamic URLs based on environment
- ✅ `web/vite.config.ts` — proxy for dev server (already configured)
- ✅ Authentication — backend manages session, React reads via `/api/auth/me`

---

## 🛠️ Known Issues & Considerations

1. **View Controllers Still Exist**: `HomeController`, `DashboardController`, etc. are still in the codebase but not used. They don't interfere because:
   - `Program.cs` no longer maps view routes
   - They'll never be called unless explicitly mapped
   - Safe to keep until confirmed all functionality is in React

2. **Environment Variables**: Development doesn't require `.env.production` because Vite proxy handles it. Only production builds need the file.

3. **CORS in Production**: Update `Program.cs` before deploying to ensure frontend origin is allowed.

4. **GitHub OAuth Redirect**: Must match backend URL in GitHub OAuth app settings.

---

## 📚 References

- **Architecture Documentation**: `ARCHITECTURE_SPLIT.md`
- **Vite Configuration**: `web/vite.config.ts`
- **Backend Setup**: `BasicProject/Program.cs`
- **API Configuration**: `web/src/config/api.ts`
- **Environment Variables**: `web/.env.example`
