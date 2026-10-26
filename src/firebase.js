// Firebase web config
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isConfigValid } from './config';

console.log('🔍 Initializing Firebase...');
console.log('Config Valid:', isConfigValid());
console.log('Full Config:', {
  apiKey: firebaseConfig.apiKey ? '***REDACTED***' : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  appId: firebaseConfig.appId ? '***REDACTED***' : 'MISSING'
});

if (!isConfigValid()) {
  console.error('❌ Firebase configuration is invalid or incomplete!');
  throw new Error('Firebase config is not valid');
}

let app, auth;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized successfully');
  
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw error;
}

export { auth };

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
