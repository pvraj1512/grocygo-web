// Notification generator for expiring items (Node.js, Firestore)
// To be run as a daily cron job or serverless function
const { db } = require('./src/config/firebase');
const admin = require('firebase-admin');

async function generateExpiringItemNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usersSnap = await db.collection('user').get();
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    // Compound query: items expiring today
    const invSnap = await db.collection('user').doc(userId)
      .collection('inventory')
      .where('expiryDate', '==', today)
      .get();
    if (!invSnap.empty) {
      const expiringItems = invSnap.docs.map(doc => doc.data().name).join(', ');
      await db.collection('user').doc(userId).collection('notifications').add({
        title: 'Items expiring today',
        message: `Expiring: ${expiringItems}`,
        type: 'expiring',
        createdAt: new Date(),
        read: false
      });
    }
  }
  console.log('Expiring notifications generated.');
}

if (require.main === module) {
  generateExpiringItemNotifications().then(() => process.exit(0));
}

module.exports = generateExpiringItemNotifications;
