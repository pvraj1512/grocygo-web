// Firebase Configuration
// This file ensures environment variables are properly loaded
export const firebaseConfig = {
  // Hardcoded for testing - values from .env
  apiKey: 'AIzaSyDbdFhFPq41Q9Q4w__xK2Hj0qcY_5MOOw4',
  authDomain: 'grocygo-eeb8b.firebaseapp.com',
  projectId: 'grocygo-eeb8b',
  storageBucket: 'grocygo-eeb8b.firebasestorage.app',
  messagingSenderId: '1019273939730',
  appId: '1:1019273939730:web:ddd0bfdfea2da9f2c741cb',
  measurementId: 'G-PX42DGMYFD'
};

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Firebase Config Loaded:', {
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : '❌ MISSING',
    authDomain: firebaseConfig.authDomain || '❌ MISSING',
    projectId: firebaseConfig.projectId || '❌ MISSING',
    storageBucket: firebaseConfig.storageBucket || '❌ MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId || '❌ MISSING',
    appId: firebaseConfig.appId || '❌ MISSING',
    measurementId: firebaseConfig.measurementId || '❌ MISSING'
  });
}

export const isConfigValid = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};
