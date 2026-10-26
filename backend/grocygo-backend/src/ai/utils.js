// Utility functions for AI logic (Node.js)
const path = require('path');
const fs = require('fs');
const csvParse = require('csv-parse/sync');

// Map common local terms
const synonymMap = {
  ringan: 'brinjal', baingan: 'eggplant', mirchi: 'chili', methi: 'fenugreek',
  besan: 'gram flour', maida: 'all-purpose flour', haldi: 'turmeric', atta: 'wheat flour',
  dhania: 'coriander', jeera: 'cumin'
};

function normalizeIngredient(ingredient) {
  const ing = (ingredient || '').toLowerCase().trim();
  for (const k in synonymMap) {
    if (ing.includes(k)) return synonymMap[k];
  }
  return ing;
}

// Load and cache recipe data from CSV
let _cache = null;
async function getRecipeData() {
  if (_cache) return _cache;
  const csvPath = path.join(__dirname, '../../data/recipes.csv');
  if (!fs.existsSync(csvPath)) throw new Error('recipes.csv not found');
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const records = csvParse.parse(csv, { columns: true, skip_empty_lines: true });
  _cache = records;
  return _cache;
}

module.exports = { getRecipeData, normalizeIngredient };
