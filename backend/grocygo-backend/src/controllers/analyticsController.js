// Get all inventory items and aggregate by category for pie chart
exports.getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('inventory').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Defensive: handle category as string, array, or missing
    const categoryMap = {};
    items.forEach(item => {
      let cat = item.category;
      if (Array.isArray(cat)) cat = cat[0];
      if (!cat || typeof cat !== 'string' || cat.trim() === '') cat = 'Uncategorized';
      cat = cat.trim();
      if (!categoryMap[cat]) categoryMap[cat] = { category: cat, count: 0 };
      categoryMap[cat].count += 1;
    });
    const data = Object.values(categoryMap).map(({ category, count }) => ({ category, count }));
    res.json(data);
  } catch (err) {
    console.error('getCategoryStats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get inventory items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { category } = req.params;
    const snapshot = await db.collection('user').doc(userId).collection('inventory').where('category', '==', category).get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    console.error('getItemsByCategory error:', err);
    res.status(500).json({ error: err.message });
  }
};
const { db } = require('../config/firebase');

// Get all analytics records (for custom dashboards)
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('analytics').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inventory usage over time from inventory collection
exports.getInventoryUsage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('inventory').get();
    const items = snapshot.docs.map(doc => doc.data());
    // Aggregate by date: count items added per day
    const usageMap = {};
    items.forEach(item => {
      let date = null;
      if (item.createdAt) {
        if (item.createdAt.toDate) {
          date = item.createdAt.toDate().toISOString().slice(0, 10);
        } else if (typeof item.createdAt === 'string') {
          // Try to parse ISO string
          const d = new Date(item.createdAt);
          if (!isNaN(d)) date = d.toISOString().slice(0, 10);
        }
      }
      if (date) {
        if (!usageMap[date]) usageMap[date] = { date, added: 0, used: 0 };
        usageMap[date].added += 1;
      }
      // If you track 'used' events, add logic here
    });
    const data = Object.values(usageMap).sort((a, b) => a.date.localeCompare(b.date));
    res.json(data);
  } catch (err) {
    console.error('getInventoryUsage error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get expiring items count per month from inventory collection
exports.getExpiryStats = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('inventory').get();
    const items = snapshot.docs.map(doc => doc.data());
    // Aggregate by month: count items with expiryDate in each month
    const expiryMap = {};
    items.forEach(item => {
      if (item.expiryDate) {
        let date = null;
        if (item.expiryDate.toDate) {
          date = item.expiryDate.toDate();
        } else if (typeof item.expiryDate === 'string') {
          const d = new Date(item.expiryDate);
          if (!isNaN(d)) date = d;
        }
        if (date && !isNaN(date)) {
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!expiryMap[month]) expiryMap[month] = { month, expiringCount: 0 };
          expiryMap[month].expiringCount += 1;
        }
      }
    });
    const data = Object.values(expiryMap).sort((a, b) => a.month.localeCompare(b.month));
    res.json(data);
  } catch (err) {
    console.error('getExpiryStats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get shopping frequency per month from inventory collection (count items added per month)
exports.getShoppingTrends = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('user').doc(userId).collection('inventory').get();
    const items = snapshot.docs.map(doc => doc.data());
    // Aggregate by month: count items added per month
    const shoppingMap = {};
    items.forEach(item => {
      let date = null;
      if (item.createdAt) {
        if (item.createdAt.toDate) {
          date = item.createdAt.toDate();
        } else if (typeof item.createdAt === 'string') {
          const d = new Date(item.createdAt);
          if (!isNaN(d)) date = d;
        }
      }
      if (date && !isNaN(date)) {
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!shoppingMap[month]) shoppingMap[month] = { month, shoppingCount: 0 };
        shoppingMap[month].shoppingCount += 1;
      }
    });
    const data = Object.values(shoppingMap).sort((a, b) => a.month.localeCompare(b.month));
    res.json(data);
  } catch (err) {
    console.error('getShoppingTrends error:', err);
    res.status(500).json({ error: err.message });
  }
};
