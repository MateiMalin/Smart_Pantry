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
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            //translates into selet top(1) * from users where email = @email
            if (existingUser != null)
                return BadRequest("User already exists");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User created");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDTO request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return BadRequest("Invalid credentials");

            bool verified = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!verified)
                return BadRequest("Invalid credentials");

            string token = CreateToken(user);

            return Ok(new
            {
                message =  "Login succesfull",
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

            //generam o cheie bazata pe signature din appsettings
            //we convert it to bytes because computers work best with them
            // var key = new SymmetricSecurityKey(
            //     Encoding.UTF8.GetBytes(_configuration["appsettings:Token"]!)
            // //GetBytes crashes the app if it receives null
            // // ! is a "trust me" operator
            // );

            var secret_token = _configuration.GetSection("AppSettings:Token").Value;

            if (string.IsNullOrEmpty(secret_token))
            {
                throw new Exception("Secret token is missing from appsettings.json!");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret_token));

            //per claims and data, it creates using the key a signature that will only allow
            //that specific person to login 
            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256Signature
            );

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            //token handler converts it into string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }

}