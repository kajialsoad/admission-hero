/**
 * Cloudinary Configuration Test Script
 * 
 * This script tests if Cloudinary credentials are working correctly
 * Run: node test-cloudinary.js
 */

require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🧪 Testing Cloudinary Configuration...\n');

// Check if credentials are set
console.log('📋 Checking environment variables:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('');

// Test API connection
async function testCloudinaryConnection() {
  try {
    console.log('🔌 Testing Cloudinary API connection...');
    
    // Ping Cloudinary API
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary API connection successful!');
      console.log('   Status:', result.status);
      console.log('');
      
      // Get account details
      console.log('📊 Fetching account details...');
      const usage = await cloudinary.api.usage();
      
      console.log('✅ Account details retrieved:');
      console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
      console.log('   Plan:', usage.plan || 'Free');
      console.log('   Credits Used:', usage.credits?.usage || 0);
      console.log('   Credits Limit:', usage.credits?.limit || 'Unlimited');
      console.log('   Storage Used:', Math.round((usage.storage?.usage || 0) / 1024 / 1024), 'MB');
      console.log('   Bandwidth Used:', Math.round((usage.bandwidth?.usage || 0) / 1024 / 1024), 'MB');
      console.log('');
      
      console.log('🎉 All tests passed! Cloudinary is configured correctly.');
      console.log('');
      console.log('📝 Next steps:');
      console.log('   1. Add these credentials to Railway environment variables');
      console.log('   2. Deploy your backend');
      console.log('   3. Test image upload from admin dashboard');
      
    } else {
      console.log('❌ Unexpected response from Cloudinary');
      console.log('   Response:', result);
    }
    
  } catch (error) {
    console.log('❌ Cloudinary connection failed!');
    console.log('');
    console.log('Error details:');
    console.log('   Message:', error.message);
    
    if (error.error && error.error.message) {
      console.log('   API Error:', error.error.message);
    }
    
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if credentials are correct in .env file');
    console.log('   2. Verify Cloud Name, API Key, and API Secret');
    console.log('   3. Make sure there are no extra spaces');
    console.log('   4. Check your internet connection');
    console.log('   5. Verify your Cloudinary account is active');
  }
}

// Run the test
testCloudinaryConnection();
