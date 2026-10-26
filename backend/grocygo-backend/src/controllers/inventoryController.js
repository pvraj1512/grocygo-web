// Use Firestore for inventory CRUD
const { db } = require('../config/firebase');

exports.getAll = async (req, res) => {
  try {
    console.log('getAll inventory: req.user:', req.user);
    const userId = req.user?.uid; // <-- error here if req.user is undefined
    if (!userId) throw new Error('User not authenticated');
    const snapshot = await db.collection('user').doc(userId).collection('inventory').get();
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure the ID always comes from doc.id, not from the document data itself
      delete data.id; // Remove any 'id' field from the document data
      return { id: doc.id, ...data };
    });
    res.json(items);
  } catch (err) {
    console.error('getAll inventory error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) throw new Error('User not authenticated');
    if (!req.body || typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Item name is required' });
    }
    const expiryDate = req.body.expiryDate ? String(req.body.expiryDate).split('T')[0] : null;
    const data = { ...req.body, expiryDate, userId, createdAt: new Date() };
    delete data.id; // Ensure no 'id' is passed in the body when adding
    const docRef = await db.collection('user').doc(userId).collection('inventory').add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (err) {
    console.error('add inventory error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    const id = req.params.id;
    const docRef = db.collection('user').doc(userId).collection('inventory').doc(id);
    const updateData = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updateData, 'expiryDate')) {
      updateData.expiryDate = updateData.expiryDate ? String(updateData.expiryDate).split('T')[0] : null;
    }
    await docRef.update(updateData);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('update inventory error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    const id = req.params.id;
    const docRef = db.collection('user').doc(userId).collection('inventory').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await docRef.delete();
    res.json({ id, ...doc.data() });
  } catch (err) {
    console.error('remove inventory error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.useIngredients = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    // Accept both { usedIngredients: [...] } and direct array (for backward compatibility)
    let usedIngredients = [];
    if (Array.isArray(req.body.usedIngredients)) {
      usedIngredients = req.body.usedIngredients;
    } else if (Array.isArray(req.body.ingredients)) {
      usedIngredients = req.body.ingredients;
    } else if (Array.isArray(req.body)) {
      usedIngredients = req.body;
    }
    if (!usedIngredients.length) return res.status(400).json({ error: 'No ingredients provided' });

    const invRef = db.collection('user').doc(userId).collection('inventory');
    const batch = db.batch();

    for (const used of usedIngredients) {
      // Find inventory item by name (case-insensitive, ignore whitespace)
      const usedName = (used.name || '').trim().toLowerCase();
      if (!usedName) continue;
      // Get all inventory docs and match by name (case-insensitive, ignore whitespace)
      const invSnap = await invRef.get();
      let matchedDoc = null;
      let matchedData = null;
      invSnap.forEach(doc => {
        const data = doc.data();
        if ((data.name || '').trim().toLowerCase() === usedName) {
          matchedDoc = doc;
          matchedData = data;
        }
      });
      if (!matchedDoc) continue;
      // Only subtract if units match (optional: remove this check if you want to allow cross-unit subtraction)
      // if (used.unit && matchedData.unit && used.unit !== matchedData.unit) continue;
      let invQty = parseFloat(matchedData.quantity);
      let usedQty = parseFloat(used.quantity);
      if (isNaN(invQty)) invQty = 0;
      if (isNaN(usedQty)) usedQty = 0;
      let newQty = invQty - usedQty;
      if (newQty < 0) newQty = 0;
      newQty = Number(newQty.toFixed(2));
      batch.update(matchedDoc.ref, { quantity: newQty });
    }
    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    console.error('useIngredients error:', err);
    res.status(500).json({ error: err.message });
  }
};
