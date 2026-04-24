using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using PantryApi.Models;
using PantryApi.Data;
using Microsoft.AspNetCore.JsonPatch;

namespace PantryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // controller e placeholder, inlocuieste
    //cu numele din clasa PantryController
    public class PantryController : ControllerBase
    {
        private readonly ApiDbContext _context;
        //in _context o sa fie database session
        public PantryController(ApiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PantryItem>>> GetItems()
        {
            return await _context.PantryItems.OrderBy(item => item.Id).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PantryItem>> GetItem(int id)
        {
            var item = await _context.PantryItems.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }

        [HttpPost]
        public async Task<ActionResult<PantryItem>> CreateItem([FromBody] PantryItem newItem)
        {
            if (string.IsNullOrWhiteSpace(newItem.Name))
            {
                return BadRequest("Item name cannot be empty");
            }

            _context.PantryItems.Add(newItem);
            //add puts data locally
            //save changes pushes the changes
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, newItem);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] PantryItem item)
        {
            if (id != item.Id)
            {
                return BadRequest("ID mismatch");
            }

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        [HttpPatch]
        public async Task<IActionResult> PatchItem(int id, [FromBody] JsonPatchDocument<PantryItem> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest();
            }

            var item = await _context.PantryItems.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            patchDoc.ApplyTo(item, ModelState);

            if (!TryValidateModel(item))
            {
                return ValidationProblem(ModelState);
            }

            await _context.SaveChangesAsync();

            return NoContent();

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.PantryItems.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            _context.PantryItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemExists(int id)
        {
            return _context.PantryItems.Any(e => e.Id == id);
        }

    }
}