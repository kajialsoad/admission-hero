// Firebase and bKash API Testing Script
const API_BASE = 'https://munns-production.up.railway.app/api';

// Test Firebase Push Notification
async function testFirebaseNotification() {
  console.log('🔥 Testing Firebase Push Notification...');
  
  try {
    // First, we need to login as admin to get token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneOrEmail: 'admin@test.com', // Default admin credentials
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed. Creating admin user first...');
      
      // Try to create admin user
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Admin User',
          email: 'admin@test.com',
          phone: '01700000000',
          password: 'admin123',
          role: 'admin'
        })
      });

      const registerData = await registerResponse.json();
      console.log('📝 Admin registration:', registerData);
      
      if (!registerResponse.ok) {
        console.log('❌ Failed to create admin user');
        return false;
      }
    }

    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful');

    if (!loginData.success || !loginData.token) {
      console.log('❌ No token received');
      return false;
    }

    // Test Firebase notification send
    const notificationResponse = await fetch(`${API_BASE}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        title: 'Test Firebase Notification',
        body: 'This is a test notification from Firebase',
        topic: 'test_topic',
        data: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      })
    });

    const notificationData = await notificationResponse.json();
    console.log('🔥 Firebase Notification Response:', notificationData);

    if (notificationResponse.ok && notificationData.success) {
      console.log('✅ Firebase Push Notification: WORKING');
      return true;
    } else {
      console.log('❌ Firebase Push Notification: FAILED');
      console.log('Error:', notificationData.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Firebase test error:', error.message);
    return false;
  }
}

// Test bKash Payment Creation
async function testBKashPayment() {
  console.log('💳 Testing bKash Payment...');
  
  try {
    // First login as user
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneOrEmail: 'user@test.com',
        password: 'user123'
      })
    });

    let token;
    if (!loginResponse.ok) {
      console.log('❌ User login failed. Creating test user...');
      
      // Create test user
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'user@test.com',
          phone: '01700000001',
          password: 'user123'
        })
      });

      const registerData = await registerResponse.json();
      console.log('📝 User registration:', registerData);
      
      if (registerResponse.ok && registerData.success) {
        token = registerData.token;
      } else {
        console.log('❌ Failed to create test user');
        return false;
      }
    } else {
      const loginData = await loginResponse.json();
      token = loginData.token;
    }

    console.log('✅ User authentication successful');

    // Test bKash payment creation
    const paymentResponse = await fetch(`${API_BASE}/payments/bkash/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planId: 'test-plan-1',
        planName: 'Test Subscription',
        amount: 100,
        duration: 1,
        payerReference: '01700000001'
      })
    });

    const paymentData = await paymentResponse.json();
    console.log('💳 bKash Payment Response:', paymentData);

    if (paymentResponse.ok && paymentData.success) {
      console.log('✅ bKash Payment Creation: WORKING');
      console.log('🔗 Payment URL:', paymentData.paymentURL);
      console.log('🆔 Payment ID:', paymentData.paymentID);
      return true;
    } else {
      console.log('❌ bKash Payment Creation: FAILED');
      console.log('Error:', paymentData.message);
      return false;
    }

  } catch (error) {
    console.log('❌ bKash test error:', error.message);
    return false;
  }
}

// Test Image Upload (Cloudinary)
async function testImageUpload() {
  console.log('📸 Testing Image Upload...');
  
  try {
    // Login as admin
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneOrEmail: 'admin@test.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Admin login failed for image upload test');
      return false;
    }

    // Create a test image blob (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const imageBlob = new Blob([Uint8Array.from(atob(testImageData), c => c.charCodeAt(0))], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'test.png');

    const uploadResponse = await fetch(`${API_BASE}/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();
    console.log('📸 Image Upload Response:', uploadData);

    if (uploadResponse.ok && uploadData.success) {
      console.log('✅ Image Upload (Cloudinary): WORKING');
      console.log('🔗 Image URL:', uploadData.data.url);
      return true;
    } else {
      console.log('❌ Image Upload: FAILED');
      console.log('Error:', uploadData.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Image upload test error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting Comprehensive API Tests...\n');
  
  const results = {
    firebase: await testFirebaseNotification(),
    bkash: await testBKashPayment(),
    imageUpload: await testImageUpload()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('🔥 Firebase Push Notifications:', results.firebase ? '✅ WORKING' : '❌ FAILED');
  console.log('💳 bKash Payment Gateway:', results.bkash ? '✅ WORKING' : '❌ FAILED');
  console.log('📸 Image Upload (Cloudinary):', results.imageUpload ? '✅ WORKING' : '❌ FAILED');

  const allPassed = Object.values(results).every(result => result === true);
  console.log('\n🎯 Overall Status:', allPassed ? '✅ ALL SYSTEMS WORKING' : '❌ SOME ISSUES FOUND');

  return results;
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testFirebaseNotification, testBKashPayment, testImageUpload };
}

// Run tests if called directly
if (typeof window === 'undefined') {
  runAllTests();
}