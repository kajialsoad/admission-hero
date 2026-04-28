import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAWXMJObqmneTEBKVSehs4OO8LhXg-awUc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "admission-hero.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "admission-hero",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "admission-hero.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1066300392478",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1066300392478:web:8a633c37e5fc879cab9a0f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9K64ZTT32Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;
let analytics: any = null;

// Only initialize in browser environment
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Firebase services not available:', error);
  }
}

// Function to get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.log('Messaging not initialized');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // Add this if you have VAPID key
    });
    
    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging not initialized');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });

// Send notification via backend API
export const sendNotification = async (
  title: string,
  body: string,
  tokens?: string[],
  topic?: string,
  data?: Record<string, string>
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      },
      body: JSON.stringify({
        title,
        body,
        tokens,
        topic,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export { app, messaging, analytics };
export default firebaseConfig;