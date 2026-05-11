using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SmartPantry.Models;
using SmartPantry.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PantryApi.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.X509Certificates;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore.Query.Internal;
using System.Security.Cryptography.Pkcs;
using System.Runtime.InteropServices.JavaScript;
using Microsoft.AspNetCore.DataProtection;

namespace SmartPantry.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApiDbContext _context;
        //in context o sa fie sesiunea bazei de date
        private readonly IConfiguration _configuration;

        public AuthController(ApiDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        //IAction result - > ca sa pot avea un response mai complex
        public async Task<IActionResult> Register(UserDTO request)
        {
            var normalizedEmail = request.Email.ToLowerInvariant();
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            //translates into selet top(1) * from users where email = @email
            if (existingUser != null)
                return BadRequest("User already exists");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = normalizedEmail,
                PasswordHash = passwordHash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User created");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDTO request)
        {
            var normalizedEmail = request.Email.ToLowerInvariant();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user == null)
                return BadRequest("Invalid credentials");

            bool verified = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!verified)
                return BadRequest("Invalid credentials");

            string token = CreateToken(user);

            return Ok(new
            {
                message = "Login succesfull",
                token = token,
                userId = user.Id,
                email = user.Email
            });

        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            // 1. Retrieve the secret key from appsettings.json
            var secretToken = _configuration["AppSettings:Token"];
            if (string.IsNullOrEmpty(secretToken))
            {
                throw new InvalidOperationException("Secret token is not configured in appsettings.json.");
            }

            // 2. Create the symmetric security key
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretToken));

            // 3. Create the signing credentials using a secure algorithm
            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256Signature
            );

            // 4. Create the token with claims, expiration, and credentials
            var token = new JwtSecurityToken(
                claims: claims,
                // Use UtcNow to avoid timezone issues
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            //token handler converts it into string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }

}