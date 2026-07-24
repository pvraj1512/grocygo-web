// Firebase web config
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Token management utilities
let tokenExpiryTime = 0;
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get a valid Firebase ID token, refreshing if necessary
 * @returns {Promise<string>} The ID token
 */
export const getValidToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  
  const now = Date.now();
  
  // If token is about to expire, refresh it
  if (now >= tokenExpiryTime - TOKEN_REFRESH_THRESHOLD) {
    try {
      // Force token refresh
      const token = await user.getIdToken(true);
      
      // Firebase tokens are valid for 1 hour
      tokenExpiryTime = now + 60 * 60 * 1000;
      
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
  
  // Token is still valid
  return user.getIdToken();
};
