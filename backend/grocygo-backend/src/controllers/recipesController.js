const { db } = require('../config/firebase');

// All recipes are stored under users/userid/recipes
// Note: AI recipe suggestions are handled by /api/ai/recipe-suggestions (Node.js AI endpoint)
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('recipes').get();
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      delete data.id; // Ensure 'id' from doc.data() doesn't overwrite doc.id
      return { id: doc.id, ...data };
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const userId = req.user.uid;
    // Accept all fields from AI recipe (image, instructions, prep_time, etc.)
    const data = { ...req.body, userId, createdAt: new Date() };
    delete data.id; // Ensure no 'id' is passed in the body when adding

    // Standardize title to 'name' field
    if (data.recipe_title) {
      data.name = data.recipe_title;
      delete data.recipe_title;
    }

    // If 'items' array is present, convert it to a pipe-separated 'ingredients' string
    if (Array.isArray(data.items)) {
      data.ingredients = data.items.map(item => item.name).join('|');
      delete data.items; // Remove the 'items' array as we now have 'ingredients' string
    }

    // Ensure all fields are present (fallbacks)
    if (!data.course) data.course = '';
    if (!data.diet) data.diet = '';
    if (!data.recipe_image) data.recipe_image = '';
    if (!data.instructions) data.instructions = '';
    if (!data.prep_time) data.prep_time = '';
    if (!data.url) data.url = '';
    if (!data.description) data.description = '';
    const docRef = await db.collection('user').doc(userId).collection('recipes').add(data);
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
    const docRef = db.collection('user').doc(userId).collection('recipes').doc(id);
    const updateData = { ...req.body };
    delete updateData.id; // Ensure 'id' is not updated from the request body
    await docRef.update(updateData);
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
    const docRef = db.collection('user').doc(userId).collection('recipes').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await docRef.delete();
    res.json({ id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
