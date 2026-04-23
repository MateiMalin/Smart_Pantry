using Microsoft.AspNetCore.Mvc;
using PantryApi.Models;

namespace PantryApi.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    [HttpGet]
    public IEnumerable<WeatherForecast> Get()
    {
        return Enumerable.Range(1, 5).Select(index =>
            new WeatherForecast(
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                Random.Shared.Next(-20, 55),
                Summaries[Random.Shared.Next(Summaries.Length)]
            )).ToArray();
    }

    [HttpGet("{id}")]
    public IActionResult Get(int id)
    {
        if (id < 1 || id > 5)
            return BadRequest($"Id must be between 1 and 5. You provided: {id}");

        var forecast = new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(id)),
            Random.Shared.Next(-20, 55),
            Summaries[Random.Shared.Next(Summaries.Length)]
        );

        return Ok(forecast);
    }
}
