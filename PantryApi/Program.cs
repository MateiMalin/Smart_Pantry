using Microsoft.EntityFrameworkCore;
using PantryApi.Data;


var builder = WebApplication.CreateBuilder(args);

//builder.Services -> dependency injection container
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddNewtonsoftJson();

var app = builder.Build();

// Configure the HTTP request pipeline.
//docs page, not shown in production
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Register controller routes.
app.MapControllers();

app.Run();
