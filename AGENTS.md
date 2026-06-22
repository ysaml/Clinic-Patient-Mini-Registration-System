---
name: Clinic Patient Registration System Assistant
applyTo:
  - "**/*"
---

# Clinic Patient Mini Registration System

This is a full-stack web application for managing patient registrations at a clinic, built with .NET backend and React frontend.

## Tech Stack

### Backend (.NET)
- **Framework**: ASP.NET Core Web API (.NET 10.0)
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **API Documentation**: Swagger/OpenAPI
- **ORM**: Entity Framework Core with migrations
- **Password Hashing**: BCrypt.Net

### Frontend (React)
- **Framework**: React 19.x with Vite
- **UI Library**: Material-UI (MUI) v9
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **State Management**: React Context API (AuthContext, ToastContext)

## Project Structure

```
backend/ClinicApi/          - ASP.NET Core Web API
  ├── Controllers/          - API endpoints (Auth, Patients)
  ├── Models/              - Entity models and DTOs
  ├── Data/                - DbContext
  ├── Migrations/          - EF Core migrations
  └── Program.cs           - App configuration and startup

frontend/src/              - React application
  ├── api/                 - API client configuration
  ├── components/          - Reusable components
  ├── context/             - React Context providers
  ├── pages/               - Page components
  └── main.jsx             - App entry point
```

## Key Conventions & Patterns

### Backend
- **Default Admin User**: On first startup, creates admin user (username: `admin`, password: `Password123!`)
- **CORS**: Frontend allowed at `http://localhost:5173`
- **JWT Configuration**: Tokens expire after 2 hours
- **API Base**: All endpoints at `/api/*`
- **Authorization**: Most endpoints require JWT Bearer token (except `/api/auth/login`)

### Patient Model Contract
⚠️ **CRITICAL**: Patient entity has both `FullName` and split name fields:
- Frontend must send: `firstName`, `middleName`, `lastName`, `birthDate`, `gender`, `contactNumber`, `address`
- Backend automatically constructs `FullName` from split fields
- DTOs: Use `PatientCreateUpdateDto` (input) and `PatientDto` (output)
- Frontend should **never** send `fullName` field directly

### Frontend
- **API Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT token stored in context and sent via Authorization header
- **Protected Routes**: Use `ProtectedRoute` component wrapper
- **Toast Notifications**: Use `useToast()` hook for user feedback
- **Auth Hook**: Use `useAuth()` for login/logout/token management
- **Dev Server**: Runs on port 5173 (Vite default)

## Development Workflow

### Backend
```powershell
cd backend/ClinicApi
dotnet restore
dotnet ef database update    # Apply migrations
dotnet run                   # Starts on https://localhost:5001
```

### Frontend
```powershell
cd frontend
npm install
npm run dev                  # Starts on http://localhost:5173
```

### Database Migrations
When modifying models:
```powershell
cd backend/ClinicApi
dotnet ef migrations add MigrationName
dotnet ef database update
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
  - Body: `{ "username": "admin", "password": "Password123!" }`
  - Returns: `{ "token": "..." }`

### Patients (Requires Auth)
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

## Common Tasks

### Adding a New Entity
1. Create model in `backend/ClinicApi/Models/`
2. Add DbSet to `ClinicDbContext.cs`
3. Create migration: `dotnet ef migrations add AddEntityName`
4. Apply migration: `dotnet ef database update`
5. Create controller in `Controllers/`
6. Create DTOs if needed in `Models/Dtos/`

### Adding a New Frontend Page
1. Create page component in `frontend/src/pages/`
2. Add route in `App.jsx`
3. Use `ProtectedRoute` wrapper if authentication required
4. Import and use `useAuth()` and `useToast()` hooks as needed

### Testing Authentication
- Use Swagger UI at `http://localhost:5000/swagger` (dev mode only)
- Click "Authorize" button, enter: `Bearer {your-token}`
- Default credentials: username=`admin`, password=`Password123!`

## Important Notes

- **Database**: SQLite file created at runtime (check connection string in `appsettings.json`)
- **Code Comments**: Code includes inline comments from "Miles B" explaining architectural decisions
- **Security**: JWT key stored in `appsettings.json` - should be in environment variables for production
- **Error Handling**: Frontend uses try-catch with toast notifications for user feedback
- **Styling**: Uses MUI theme with custom gradients and alpha transparency effects

## Troubleshooting

### Backend won't start
- Check if port 5000/5001 is available
- Verify database migrations are applied
- Check `appsettings.json` configuration

### Frontend API calls fail
- Verify backend is running on port 5000
- Check CORS configuration in `Program.cs`
- Ensure JWT token is valid (check expiration)
- Verify Authorization header format: `Bearer {token}`

### Database issues
- Delete SQLite database file and run migrations again
- Check migration files in `Migrations/` folder
- Verify connection string in `appsettings.json`

## When Working on This Codebase

1. **Always respect the Patient model contract** - use split name fields, not `fullName`
2. **Use existing Context hooks** - `useAuth()` and `useToast()` are available
3. **Follow existing patterns** - controllers use dependency injection, frontend uses functional components
4. **Add migrations** for any model changes
5. **Test authentication flow** - many endpoints require valid JWT
6. **Keep CORS configuration** in sync with frontend dev server port
7. **Use MUI components** - project already has Material-UI installed
8. **Check repository memory** at `/memories/repo/clinic-patient-contract.md` for API contract details