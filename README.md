# Clinic Patient Mini Registration System

A simple clinic patient registration application with authenticated access and full CRUD on patient records.

- **Frontend:** React (Vite)
- **Backend:** ASP.NET Core Web API (.NET 10)
- **Database:** SQLite (via Entity Framework Core)
- **Auth:** JWT (JSON Web Tokens), passwords hashed with BCrypt

> **Note:** No real patient data is used anywhere in this project. All seeded/demo data is fictional.

---

## Prerequisites

Install these before running the project:

- [.NET SDK 10.x](https://dotnet.microsoft.com/download)
- [Node.js 18+ (LTS recommended)](https://nodejs.org/)
- Git

Check your versions:

```bash
dotnet --version
node --version
npm --version
```

---

## Project Structure

```
.
├── backend/
│   └── ClinicApi/        # ASP.NET Core Web API
├── frontend/              # React (Vite) app
├── AGENTS.md
├── README.md
└── .gitignore
```

---

## 1. Running the Backend (ASP.NET Core API)

Open a terminal in the project root:

```bash
cd backend/ClinicApi
dotnet restore
dotnet run
```

On first run, the app automatically:
- Applies EF Core migrations and creates the local SQLite database (`clinic.db`) in this folder
- Seeds one demo login user (see credentials below)

The console will print the URL it's listening on, for example:

```
Now listening on: http://localhost:5010
```

**Use this exact URL** — if your machine assigns a different port, update `frontend/src/api/client.js` to match (see Troubleshooting below).

### API Documentation (Swagger)

With the backend running, open:

```
http://localhost:5010/swagger
```

This lets you test every endpoint directly (login, then authorize with the returned token, then call patient endpoints) without the frontend.

---

## 2. Running the Frontend (React)

Open a **second terminal** (keep the backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

The console will print a local URL, for example:

```
Local:   http://localhost:5173/
```

Open that URL in your browser.

---

## 3. Logging In

Use the seeded demo account:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Password123!` |

This account is created automatically the first time the backend runs, if no users exist yet in the database.

---

## 4. Using the App

Once logged in, you can:
- View the list of patient records
- Add a new patient (Name, Birth Date, Gender, Contact Number, Address)
- Edit an existing patient
- Delete a patient (with confirmation)
- Log out (returns you to the login screen; patient screens are inaccessible without logging in again)

---

## Configuration Notes

- **Backend port:** the app runs on whatever port is configured in `backend/ClinicApi/Properties/launchSettings.json`. The default in this project is `http://localhost:5010`.
- **CORS:** the backend only accepts requests from `http://localhost:5173` (the frontend's default Vite port). If your frontend runs on a different port, update the `AddCors` policy in `backend/ClinicApi/Program.cs` to match.
- **JWT signing key:** stored in `appsettings.Development.json`, which is excluded from version control via `.gitignore`. This file is **not included in the repository** — see [Troubleshooting](#troubleshooting) if you're cloning this repo fresh and the backend won't start.
- **Database file:** `clinic.db` is created locally on first run and is excluded from version control.

---

## Troubleshooting

**Backend won't start / missing configuration error**
If you cloned this repo fresh, `appsettings.Development.json` (containing the JWT secret key) is intentionally not committed. Create it manually in `backend/ClinicApi/` with:

```json
{
  "Jwt": {
    "Key": "ThisIsADemoSecretKeyChangeMe1234567890",
    "Issuer": "ClinicApi",
    "Audience": "ClinicApiUsers"
  }
}
```

**Frontend shows a CORS error in the browser console**
Confirm the backend's CORS policy in `Program.cs` (`AddCors` → `WithOrigins(...)`) matches the exact URL your frontend is actually running on (check the terminal output from `npm run dev`).

**Frontend can't reach the backend at all (network error, not CORS)**
Confirm `frontend/src/api/client.js`'s `baseURL` matches the exact URL printed by `dotnet run` for the backend. Ports can shift if the default is already in use on your machine.

**Browser blocks the connection due to an untrusted local certificate**
If running the backend on HTTPS, trust the local development certificate once:

```bash
dotnet dev-certs https --trust
```

---

## AI-Assisted Development

This project was built with AI assistance. See [`AGENTS.md`](./AGENTS.md) for details on which parts were AI-assisted and how.
