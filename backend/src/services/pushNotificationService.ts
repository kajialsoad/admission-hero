import admin from 'firebase-admin';

interface PushNotificationData {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

class PushNotificationService {
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        // Initialize Firebase Admin SDK
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (serviceAccount) {
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount)),
          });
          this.initialized = true;
          console.log('Firebase Admin SDK initialized successfully');
        } else {
          console.warn('Firebase service account key not found. Push notifications will be disabled.');
        }
      } else {
        this.initialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendToDevice(deviceToken: string, notification: PushNotificationData): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Cannot send push notification.');
      return false;
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        token: deviceToken,
        android: {
          notification: {
            channelId: 'admission_hero_notifications',
            priority: 'high' as const,
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('Push notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async sendToMultipleDevices(deviceTokens: string[], notification: PushNotificationData): Promise<{ successCount: number; failureCount: number }> {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Cannot send push notifications.');
      return { successCount: 0, failureCount: deviceTokens.length };
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        tokens: deviceTokens,
        android: {
          notification: {
            channelId: 'admission_hero_notifications',
            priority: 'high' as const,
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log(`Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return { successCount: 0, failureCount: deviceTokens.length };
    }
  }

  async sendToTopic(topic: string, notification: PushNotificationData): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Cannot send push notification.');
      return false;
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        topic: topic,
        android: {
          notification: {
            channelId: 'admission_hero_notifications',
            priority: 'high' as const,
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('Topic push notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending topic push notification:', error);
      return false;
    }
  }

  async subscribeToTopic(deviceTokens: string[], topic: string): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Cannot subscribe to topic.');
      return false;
    }

    try {
      const response = await admin.messaging().subscribeToTopic(deviceTokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(deviceTokens: string[], topic: string): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Cannot unsubscribe from topic.');
      return false;
    }

    try {
      const response = await admin.messaging().unsubscribeFromTopic(deviceTokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  // Validate device token
  async validateToken(deviceToken: string): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      // Try to send a test message to validate the token
      await admin.messaging().send({
        token: deviceToken,
        data: { test: 'true' },
      }, true); // dry run
      return true;
    } catch (error) {
      console.error('Invalid device token:', error);
      return false;
    }
  }

  // Helper method to create notification data for different types
  createNotificationData(type: 'exam' | 'payment' | 'system' | 'chat' | 'announcement', data: any): PushNotificationData {
    switch (type) {
      case 'exam':
        return {
          title: 'পরীক্ষার আপডেট',
          body: data.message || 'নতুন পরীক্ষার তথ্য পাওয়া গেছে',
          data: {
            type: 'exam',
            examId: data.examId || '',
            action: data.action || 'view',
          },
        };

      case 'payment':
        return {
          title: 'পেমেন্ট আপডেট',
          body: data.message || 'আপনার পেমেন্ট সংক্রান্ত আপডেট',
          data: {
            type: 'payment',
            paymentId: data.paymentId || '',
            status: data.status || '',
          },
        };

      case 'chat':
        return {
          title: 'নতুন বার্তা',
          body: data.message || 'আপনার জন্য নতুন বার্তা এসেছে',
          data: {
            type: 'chat',
            conversationId: data.conversationId || '',
            senderId: data.senderId || '',
          },
        };

      case 'announcement':
        return {
          title: 'গুরুত্বপূর্ণ ঘোষণা',
          body: data.message || 'নতুন ঘোষণা পাওয়া গেছে',
          data: {
            type: 'announcement',
            announcementId: data.announcementId || '',
          },
          imageUrl: data.imageUrl,
        };

      case 'system':
      default:
        return {
          title: 'সিস্টেম আপডেট',
          body: data.message || 'সিস্টেম থেকে নতুন আপডেট',
          data: {
            type: 'system',
            ...data,
          },
        };
    }
  }
}

export default new PushNotificationService();