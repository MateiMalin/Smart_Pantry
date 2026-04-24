using Microsoft.EntityFrameworkCore;
using PantryApi.Models;

namespace PantryApi.Data;

//Db context is a class from Entity Framework Core to connect , run sql queries, save changes
//create tables from models
public class ApiDbContext : DbContext
{
    //constructorul 
    //options specific for the ApiDbContext class
    // :base(options) -> call the constructor of the parent first so it can initialise
    //database related stuff
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
        Console.WriteLine("Database created succesfully");
    }

    public DbSet<PantryItem> PantryItems {set; get;}

}