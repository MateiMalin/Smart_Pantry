using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PantryApi.Models
{
    public class PantryItem
    {
        public int Id { set; get; }
        public string Name { set; get; } = string.Empty;
        public DateTime? ExpiryDate { set; get; }
        public string Category { set; get; } = string.Empty;
        public float Quantity { set; get; }
        public string Unit { set; get; } = "pcs";
        public int UserId { get; set; }
    }
}