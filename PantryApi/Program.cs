using Microsoft.EntityFrameworkCore;
using PantryApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

//builder.Services -> dependency injection container
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddNewtonsoftJson();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(
    options =>
    {
        options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes
                (
                    builder.Configuration["AppSettings:Token"]!
                )
            ),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    }
);

builder.Services.AddAuthorization();

var app = builder.Build();

// Apply CORS policy
app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
//docs page, not shown in production
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Register controller routes.
app.MapControllers();
//middleware for authentification
app.UseAuthentication();
app.UseAuthorization();

app.Run();
