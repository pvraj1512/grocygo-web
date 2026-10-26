const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Load and cache suggestions on startup
let suggestions = [];
const csvPath = path.join(__dirname, '../../data/Grocery_Inventory.csv');

function loadSuggestions() {
  suggestions = [];
  if (fs.existsSync(csvPath)) {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.Product_Name && row.Catagory) {
          suggestions.push({
            product: row.Product_Name.trim(),
            category: row.Catagory.trim()
          });
        }
      });
  }
}

// Load once at startup
loadSuggestions();

exports.getSuggestions = (req, res) => {
  // Optionally filter by query param for autocomplete
  const q = (req.query.q || '').toLowerCase();
  let filtered = suggestions;
  if (q) {
    filtered = suggestions.filter(s =>
      s.product.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }
  // Return top 20 matches
  res.json(filtered.slice(0, 20));
};
