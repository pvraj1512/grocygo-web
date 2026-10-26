const { db } = require('../config/firebase');

const parseDateOnly = value => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(date.getTime()) ? null : date;
};

const formatDateOnly = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const serializeTimestamp = value => {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value || null;
};

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    const snapshot = await db.collection('user').doc(userId).collection('mealPlans').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    console.error('getAll mealPlans error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getWeeklyMealPlans = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required query parameters.' });
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0); // Set to the beginning of the day
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // Set to the end of the day

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate.' });
    }

    const snapshot = await db.collection('user').doc(userId).collection('mealPlans')
      .where('date', '>=', startDateTime)
      .where('date', '<=', endDateTime)
      .orderBy('date', 'asc')
      .get();

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: formatDateOnly(doc.data().date.toDate()),
    }));
    res.json(items);
  } catch (err) {
    console.error('getWeeklyMealPlans error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');

    const snapshot = await db.collection('user').doc(userId).collection('mealHistory')
      .orderBy('completedAt', 'desc')
      .limit(100)
      .get();

    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: serializeTimestamp(data.date),
        completedAt: serializeTimestamp(data.completedAt),
      };
    });
    res.json(items);
  } catch (err) {
    console.error('get meal history error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    // Ensure date is a Firestore Timestamp if provided, otherwise use current date
    const date = req.body.date ? parseDateOnly(req.body.date) : new Date();
    if (!date) return res.status(400).json({ error: 'Invalid meal date' });
    date.setHours(0, 0, 0, 0); // Normalize date to the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return res.status(400).json({ error: 'Meals cannot be added for a past date' });
    const data = { ...req.body, userId, createdAt: new Date(), date };
    const docRef = await db.collection('user').doc(userId).collection('mealPlans').add(data);
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data(), date: formatDateOnly(doc.data().date.toDate()) });
  } catch (err) {
    console.error('add mealPlan error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    const id = req.params.id;
    const docRef = db.collection('user').doc(userId).collection('mealPlans').doc(id);
    const updateData = { ...req.body };
    // Convert date string to Date object if present in updateData
    if (updateData.date) {
      updateData.date = parseDateOnly(updateData.date);
      if (!updateData.date) return res.status(400).json({ error: 'Invalid meal date' });
    }
    await docRef.update(updateData);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data(), date: formatDateOnly(doc.data().date.toDate()) });
  } catch (err) {
    console.error('update mealPlan error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    const id = req.params.id;
    const docRef = db.collection('user').doc(userId).collection('mealPlans').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await docRef.delete();
    res.json({ id, ...doc.data() });
  } catch (err) {
    console.error('remove mealPlan error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Use ingredients: subtracts quantities from inventory for matching items.
 * Expects req.body to be an array of { name, quantity, unit }
 */
exports.useIngredients = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) throw new Error('User not authenticated');
    // Always expect { ingredients: [...], planId }
    const usageList = Array.isArray(req.body.ingredients) ? req.body.ingredients : [];
    const planId = req.body.planId ? String(req.body.planId) : null;
    if (!usageList.length && !planId) return res.status(400).json({ error: 'No ingredients provided' });

    // Get all inventory items for user and map by lowercased name
    const invSnap = await db.collection('user').doc(userId).collection('inventory').get();
    const inventory = {};
    invSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.name) {
        inventory[data.name.trim().toLowerCase()] = { ...data, _id: doc.id };
      }
    });

    // Track updates
    const updated = [];
    const unavailable = [];
    const pendingUpdates = [];

    for (const usage of usageList) {
      const name = (usage.name || '').trim().toLowerCase();
      const qty = parseFloat(usage.quantity);
      if (!name || isNaN(qty) || qty <= 0) continue;
      const invItem = inventory[name];
      if (!invItem) {
        unavailable.push({ name: usage.name, reason: 'missing' });
        continue;
      }
      if (invItem.expiryDate) {
        const expiryDate = new Date(`${String(invItem.expiryDate).split('T')[0]}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!isNaN(expiryDate.getTime()) && expiryDate < today) {
          unavailable.push({ name: invItem.name, reason: 'expired' });
          continue;
        }
      }

      // Always parse inventory quantity as float, fallback to 0 if invalid
      let invQty = Number(invItem.quantity);
      if (isNaN(invQty)) invQty = 0;

      // Subtract and round to 2 decimals to avoid floating point issues
      let newQty = invQty - qty;
      if (newQty < 0) newQty = 0;
      newQty = Number(newQty.toFixed(2)); // Ensure number type and 2 decimals

      pendingUpdates.push({ invItem, invQty, qty, newQty });
    }

    if (unavailable.length > 0) {
      return res.status(409).json({
        error: 'Some ingredients are missing or expired',
        unavailable
      });
    }

    for (const update of pendingUpdates) {
      await db.collection('user').doc(userId).collection('inventory').doc(update.invItem._id).update({
        quantity: update.newQty
      });
      updated.push({ name: update.invItem.name, oldQuantity: update.invQty, used: update.qty, newQuantity: update.newQty });
    }

    // Add notification for used ingredients
    if (updated.length > 0) {
      const usedNames = updated.map(u => `${u.name} (${u.used})`).join(', ');
      await db.collection('user').doc(userId).collection('notifications').add({
        title: 'Meal completed',
        message: `You used: ${usedNames}`,
        type: 'meal-used',
        createdAt: new Date(),
        read: false
      });
    }

    // If planId is provided, delete the meal plan document and notify
    let deletedPlan = null;
    if (planId) {
      const planRef = db.collection('user').doc(userId).collection('mealPlans').doc(planId);
      const planDoc = await planRef.get();
      if (planDoc.exists) {
        deletedPlan = { id: planDoc.id, ...planDoc.data() };
        await db.collection('user').doc(userId).collection('mealHistory').add({
          ...deletedPlan,
          userId,
          status: 'completed',
          completedAt: new Date(),
        });
        await planRef.delete();
        // Notify about completed meal
        await db.collection('user').doc(userId).collection('notifications').add({
          title: 'Meal plan completed',
          message: `You completed: ${deletedPlan.title || deletedPlan.name || 'a meal'}`,
          type: 'meal-completed',
          createdAt: new Date(),
          read: false
        });
      }
    }

    res.json({ updated, deletedPlan });
  } catch (err) {
    console.error('useIngredients error:', err);
    res.status(500).json({ error: err.message });
  }
};
