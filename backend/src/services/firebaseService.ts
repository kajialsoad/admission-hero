import admin from 'firebase-admin';

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID || 'admission-hero',
  });
}

export const messaging = admin.messaging();
export const firestore = admin.firestore();
export const auth = admin.auth();

// Send push notification to a single device
export const sendNotificationToDevice = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send push notification to multiple devices
export const sendNotificationToMultipleDevices = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    };

    const response = await messaging.sendMulticast(message);
    console.log('Successfully sent messages:', response);
    return response;
  } catch (error) {
    console.error('Error sending messages:', error);
    throw error;
  }
};

// Send notification to a topic
export const sendNotificationToTopic = async (
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      topic,
    };

    const response = await messaging.send(message);
    console.log('Successfully sent message to topic:', response);
    return response;
  } catch (error) {
    console.error('Error sending message to topic:', error);
    throw error;
  }
};

// Subscribe user to a topic
export const subscribeToTopic = async (tokens: string[], topic: string) => {
  try {
    const response = await messaging.subscribeToTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
};

// Unsubscribe user from a topic
export const unsubscribeFromTopic = async (tokens: string[], topic: string) => {
  try {
    const response = await messaging.unsubscribeFromTopic(tokens, topic);
    console.log('Successfully unsubscribed from topic:', response);
    return response;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
};

export default admin;