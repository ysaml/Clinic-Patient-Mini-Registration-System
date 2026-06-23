using Microsoft.EntityFrameworkCore;
using ClinicApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
// Miles B: this is where we register services and configure the app. It's a bit of a kitchen sink, but for a small app it's manageable. In larger apps, you'd want to break this out into extension methods and separate files for better organization.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ClinicDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Miles B: ensure database is created and has an admin user on startup and for testing purposes. In production, you'd want a more robust seeding strategy and not hardcode credentials.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any())
    {
        db.Users.Add(new ClinicApi.Models.User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!")
        });
        db.SaveChanges();
    }

    if (!db.Patients.Any())
    {
        var patients = new List<ClinicApi.Models.Patient>
        {
            new() { FirstName = "Maria", MiddleName = "Santos", LastName = "Reyes", FullName = "Maria Santos Reyes", BirthDate = new DateTime(1985, 3, 14), Gender = "Female", ContactNumber = "09171234567", Address = "123 Rizal St., Manila" },
            new() { FirstName = "Jose", MiddleName = "Cruz", LastName = "Garcia", FullName = "Jose Cruz Garcia", BirthDate = new DateTime(1978, 7, 22), Gender = "Male", ContactNumber = "09281234567", Address = "456 Mabini Ave., Quezon City" },
            new() { FirstName = "Ana", MiddleName = "Lim", LastName = "Tan", FullName = "Ana Lim Tan", BirthDate = new DateTime(1995, 11, 5), Gender = "Female", ContactNumber = "09391234567", Address = "789 Bonifacio Blvd., Pasig" },
            new() { FirstName = "Carlos", MiddleName = "De Leon", LastName = "Mendoza", FullName = "Carlos De Leon Mendoza", BirthDate = new DateTime(1990, 1, 30), Gender = "Male", ContactNumber = "09501234567", Address = "321 Luna St., Makati" },
            new() { FirstName = "Luisa", MiddleName = "Aquino", LastName = "Villanueva", FullName = "Luisa Aquino Villanueva", BirthDate = new DateTime(2000, 6, 18), Gender = "Female", ContactNumber = "09611234567", Address = "654 Del Pilar St., Taguig" },
            new() { FirstName = "Roberto", MiddleName = "Bautista", LastName = "Castillo", FullName = "Roberto Bautista Castillo", BirthDate = new DateTime(1967, 9, 3), Gender = "Male", ContactNumber = "09721234567", Address = "987 Kalaw Ave., Ermita" },
            new() { FirstName = "Elena", MiddleName = "Flores", LastName = "Soriano", FullName = "Elena Flores Soriano", BirthDate = new DateTime(1982, 4, 27), Gender = "Female", ContactNumber = "09831234567", Address = "147 Espana Blvd., Sampaloc" },
            new() { FirstName = "Miguel", MiddleName = "Torres", LastName = "Ramos", FullName = "Miguel Torres Ramos", BirthDate = new DateTime(1973, 12, 9), Gender = "Male", ContactNumber = "09941234567", Address = "258 Shaw Blvd., Mandaluyong" },
            new() { FirstName = "Isabella", MiddleName = "Navarro", LastName = "Dela Cruz", FullName = "Isabella Navarro Dela Cruz", BirthDate = new DateTime(1998, 8, 15), Gender = "Female", ContactNumber = "09051234567", Address = "369 EDSA, Caloocan" },
            new() { FirstName = "Fernando", MiddleName = "Ocampo", LastName = "Fernandez", FullName = "Fernando Ocampo Fernandez", BirthDate = new DateTime(1955, 2, 20), Gender = "Male", ContactNumber = "09161234567", Address = "741 Quirino Ave., Paranaque" },
        };
        db.Patients.AddRange(patients);
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");   // must come before auth so cross-origin requests aren't blocked first
app.UseAuthentication();        // who are you?
app.UseAuthorization();         // are you allowed?
app.MapControllers();

app.Run();