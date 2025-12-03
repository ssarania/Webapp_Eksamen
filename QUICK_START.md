# Quick Start: Split Project Setup

## Project Structure

```
Webapp_Eksamen/
├── BasicProject/           # ASP.NET Core API Backend
├── web/                   # React Frontend (Vite)
├── ARCHITECTURE_SPLIT.md  # Full architecture documentation
└── SPLIT_CHECKLIST.md     # Implementation checklist & testing guide
```

## Development Setup

### 1. Start the Backend API

```powershell
cd BasicProject
dotnet run
```

- API runs on: `http://localhost:5093`
- Swagger UI: `http://localhost:5093/swagger`

### 2. Start the Frontend (in a new terminal)

```powershell
cd web
npm install  # First time only
npm run dev
```

- Dev server runs on: `http://localhost:5173`
- Vite automatically proxies `/api/*` and `/auth/*` to backend

### 3. Open in Browser

Navigate to: `http://localhost:5173`

---

## What's New

### Backend Changes
- ✅ Pure API backend (no Razor views)
- ✅ All routes under `/api/*`
- ✅ CORS enabled for React dev server
- ✅ Cookie-based authentication

### Frontend Changes
- ✅ Centralized API configuration
- ✅ Environment-based URLs (dev vs prod)
- ✅ Reusable fetch client with error handling
- ✅ No hardcoded API URLs
- ✅ No local storage auth (server-managed sessions)

---

## Files Changed/Added

### Backend (`BasicProject/Program.cs`)
- Removed `AddControllersWithViews()` → kept only `AddControllers()`
- Removed `MapControllerRoute()` → only `MapControllers()`
- Removed `UseStaticFiles()` and view error handling
- Added CORS for React dev server

### Frontend - New Files
1. `src/config/api.ts` — API endpoint configuration
2. `src/lib/apiClient.ts` — Reusable fetch client
3. `src/services/authService.ts` — Auth operations
4. `src/vite-env.d.ts` — TypeScript env types
5. `.env.example` — Environment variable documentation

### Frontend - Modified Files
1. `src/services/api.ts` — Uses centralized `fetchApi()` client
2. `src/githubOAuthConfig.ts` — Dynamic URLs
3. `src/services/githubAuthService.ts` — Marked as deprecated
4. `vite.config.ts` — Proxy configuration (already set up)

---

## Environment Variables

### Development
No `.env` file needed. Vite proxy handles `/api` and `/auth` forwarding.

### Production
Create `web/.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_AUTH_URL=https://api.yourdomain.com/auth
```

Or use single endpoint:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## API Endpoints

All endpoints are on the backend API:

### Public (No Auth Required)
- `GET /api/quizzes` — List all public quizzes
- `GET /api/quizzes/{id}` — Get quiz details

### Authenticated
- `GET /api/quizzes/my` — User's quizzes only
- `POST /api/quizzes` — Create quiz
- `PUT /api/quizzes/{id}` — Update quiz
- `DELETE /api/quizzes/{id}` — Delete quiz
- `GET /api/auth/me` — Get current user
- `POST /api/auth/logout` — Log out

---

## Common Issues

### Frontend can't reach API
- ✅ Check backend is running on `http://localhost:5093`
- ✅ Check Vite proxy in `vite.config.ts`
- ✅ Restart Vite dev server after changing config

### CORS errors in production
- ✅ Update `Program.cs` CORS policy to include frontend URL
- ✅ Set `VITE_API_URL` to backend domain
- ✅ Ensure GitHub OAuth redirect URI matches backend URL

### Login doesn't work
- ✅ Check GitHub OAuth credentials in `appsettings.json`
- ✅ Verify redirect URI matches GitHub OAuth app settings
- ✅ Check cookies are enabled in browser
- ✅ Verify `credentials: 'include'` in fetch (handled by `fetchApi()`)

---

## Deployment

### Backend (ASP.NET)
1. Publish: `dotnet publish -c Release`
2. Deploy to hosting (Azure, AWS, etc.)
3. Configure env vars: `GitHub:ClientId`, `GitHub:ClientSecret`, database
4. Update CORS to include frontend URL

### Frontend (React)
1. Build: `npm run build` → creates `dist/`
2. Deploy `dist/` to static hosting (Netlify, Vercel, etc.)
3. Set env vars: `VITE_API_URL`, `VITE_AUTH_URL`
4. Update GitHub OAuth redirect URI

---

## Next Steps

1. Run both servers locally (`npm run dev` + `dotnet run`)
2. Test React app can call API
3. Test authentication flow
4. Check out `ARCHITECTURE_SPLIT.md` for detailed architecture docs
5. Refer to `SPLIT_CHECKLIST.md` for testing and deployment checklists

---

## Support & Documentation

- **Full Architecture**: Read `ARCHITECTURE_SPLIT.md`
- **Testing & Deployment**: See `SPLIT_CHECKLIST.md`
- **API Documentation**: Swagger UI at `http://localhost:5093/swagger`
- **Vite Docs**: https://vite.dev/
- **React Router Docs**: https://reactrouter.com/
