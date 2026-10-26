const path = require("path");
const fs = require("fs");
const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } catch (e2) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", e2);
    }
  }
}

if (!serviceAccount) {
  const localKeyPath = path.join(__dirname, "../../firebase-service-account.json");
  if (fs.existsSync(localKeyPath)) {
    serviceAccount = require(localKeyPath);
  }
}

const appOptions = {
  projectId: serviceAccount?.project_id || process.env.FIREBASE_PROJECT_ID || "grocygo-eeb8b",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "grocygo-eeb8b.firebasestorage.app",
};

if (serviceAccount) {
  appOptions.credential = cert(serviceAccount);
}

const app = getApps().length ? getApp() : initializeApp(appOptions);

// Preserve the existing admin.auth() call shape used by the middleware.
const admin = {
  auth: () => getAuth(app),
};

const db = getFirestore(app);
const bucket = getStorage(app).bucket();

module.exports = { admin, db, bucket };
