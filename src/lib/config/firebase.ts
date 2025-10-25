import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: any = null;
let messaging: any = null;

export const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return { app, messaging };
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return { app: null, messaging: null };
  }
};

export const getFirebaseApp = () => app;
export const getFirebaseMessaging = () => messaging;

// VAPID key for web push notifications
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export default {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseMessaging,
  VAPID_KEY,
};
