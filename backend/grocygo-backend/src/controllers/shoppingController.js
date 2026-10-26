const { db } = require('../config/firebase');
const axios = require('axios');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('shoppingLists').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const userId = req.user.uid;
    const data = { ...req.body, userId, createdAt: new Date() };
    const docRef = await db.collection('user').doc(userId).collection('shoppingLists').add(data);
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.uid;
    const id = req.params.id;
    const docRef = db.collection('user').doc(userId).collection('shoppingLists').doc(id);
    await docRef.update(req.body);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.uid;
    const id = req.params.id;
    const docRef = db.collection('user').doc(userId).collection('shoppingLists').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await docRef.delete();
    res.json({ id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Smart Suggestions for shopping list (includes both user and public/AI recipes, always returns missing ingredients)
exports.getSuggestions = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      console.error('No user found in request. req.user:', req.user);
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const userId = req.user.uid;

    // Fetch inventory from Firestore
    const inventorySnap = await db.collection('user').doc(userId).collection('inventory').get();
    const inventory = inventorySnap.docs.map(doc => (doc.data().name || '').toLowerCase()).filter(Boolean);
    console.log('AI SUGGESTIONS DEBUG: inventory:', inventory);

    // Fetch user's recipes
    const recipesSnap = await db.collection('user').doc(userId).collection('recipes').get();
    const userRecipes = recipesSnap.docs.map(doc => doc.data());
    console.log('AI SUGGESTIONS DEBUG: userRecipes:', userRecipes);

    // Only use user's own recipes for suggestions (do not include public/AI recipes)
    const allRecipes = userRecipes.map(r => ({
      name: r.name,
      ingredients: r.ingredients,
      items: Array.isArray(r.items) ? r.items : [],
    }));

    // Prepare recipes for AI backend: always pass array of ingredient names (strings)
    const aiRecipes = allRecipes.map(r => {
      let ingredients = [];
      if (Array.isArray(r.ingredients)) {
        // If already array, map to string names if needed
        ingredients = r.ingredients.map(i => typeof i === 'string' ? i : (i && i.name ? i.name : ''));
      } else if (typeof r.ingredients === 'string') {
        ingredients = r.ingredients.split('|').map(i => i.trim());
      } else if (Array.isArray(r.items)) {
        ingredients = r.items.map(i => typeof i === 'string' ? i : (i && i.name ? i.name : ''));
      }
      ingredients = ingredients.filter(Boolean);
      return { recipe_title: r.name, ingredients };
    }).filter(Boolean);
    console.log('AI SUGGESTIONS DEBUG: aiRecipes:', aiRecipes);

    // Call AI logic directly (in-process)
    const shoppingSuggestion = require('../ai/shoppingSuggestion');
    const suggestions = shoppingSuggestion({ inventory, recipes: aiRecipes });
    res.json(suggestions);
  } catch (err) {
    console.error('AI SUGGESTION ERROR:', err.stack || err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
