const https = require('https');

// Manual API test function
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  const API_BASE = 'https://munns-production.up.railway.app/api';
  
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Check...');
    const health = await makeRequest(`${API_BASE}/health`);
    console.log('Status:', health.status);
    console.log('Response:', health.data);
    console.log('✅ Health Check:', health.ok ? 'WORKING' : 'FAILED');
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
  }

  console.log('\n');

  // Test 2: Try to login with common admin credentials
  try {
    console.log('2️⃣ Testing Admin Login...');
    
    const adminCredentials = [
      { phoneOrEmail: 'admin@admissionhero.com', password: 'admin123456' },
      { phoneOrEmail: '01700000000', password: 'admin123456' },
      { phoneOrEmail: 'admin@admin.com', password: 'admin123' },
      { phoneOrEmail: 'admin', password: 'admin' }
    ];

    let adminToken = null;
    
    for (const cred of adminCredentials) {
      try {
        const login = await makeRequest(`${API_BASE}/auth/login`, 'POST', cred);
        console.log(`Trying ${cred.phoneOrEmail}:`, login.status, login.data?.message || 'No message');
        
        if (login.ok && login.data?.success && login.data?.token) {
          adminToken = login.data.token;
          console.log('✅ Admin Login: WORKING');
          console.log('🔑 Token received:', adminToken.substring(0, 20) + '...');
          break;
        }
      } catch (e) {
        console.log(`❌ Login attempt failed for ${cred.phoneOrEmail}`);
      }
    }

    if (!adminToken) {
      console.log('❌ Admin Login: FAILED - No valid credentials found');
      return;
    }

    console.log('\n');

    // Test 3: Firebase Notification
    try {
      console.log('3️⃣ Testing Firebase Push Notification...');
      const notification = await makeRequest(`${API_BASE}/notifications/send`, 'POST', {
        title: 'Test Firebase Notification',
        body: 'Testing Firebase integration',
        topic: 'test_topic',
        data: { test: 'true' }
      }, {
        'Authorization': `Bearer ${adminToken}`
      });

      console.log('Status:', notification.status);
      console.log('Response:', notification.data);
      console.log('🔥 Firebase Notification:', notification.ok ? 'WORKING' : 'FAILED');
    } catch (error) {
      console.log('❌ Firebase Notification Error:', error.message);
    }

    console.log('\n');

    // Test 4: bKash Payment (need user token)
    try {
      console.log('4️⃣ Testing bKash Payment...');
      
      // Try to register a test user first
      const userReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        phone: `017${Math.floor(Math.random() * 100000000)}`,
        password: 'test123'
      });

      let userToken = null;
      if (userReg.ok && userReg.data?.token) {
        userToken = userReg.data.token;
        console.log('✅ Test user created');
      } else {
        console.log('❌ Failed to create test user:', userReg.data?.message);
        return;
      }

      // Test bKash payment creation
      const payment = await makeRequest(`${API_BASE}/payments/bkash/create`, 'POST', {
        planId: 'test-plan',
        planName: 'Test Plan',
        amount: 100,
        duration: 1
      }, {
        'Authorization': `Bearer ${userToken}`
      });

      console.log('Status:', payment.status);
      console.log('Response:', payment.data);
      console.log('💳 bKash Payment:', payment.ok ? 'WORKING' : 'FAILED');
      
      if (payment.ok && payment.data?.paymentURL) {
        console.log('🔗 Payment URL generated:', payment.data.paymentURL.substring(0, 50) + '...');
      }

    } catch (error) {
      console.log('❌ bKash Payment Error:', error.message);
    }

  } catch (error) {
    console.log('❌ API Test Error:', error.message);
  }
}

testAPI();