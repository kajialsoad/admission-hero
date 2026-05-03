import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AppContent from '../models/AppContent';

dotenv.config();

const defaultContents = [
  {
    key: 'about_app',
    title: 'About Admission Hero',
    content: `<h1>About Admission Hero</h1>
<p>Admission Hero is your ultimate companion for university admission preparation in Bangladesh.</p>

<h2>Our Mission</h2>
<p>We aim to help students achieve their dreams of getting admitted to their desired universities by providing comprehensive preparation materials and practice tests.</p>

<h2>Features</h2>
<ul>
  <li>Extensive question bank covering all major universities</li>
  <li>Practice exams with detailed solutions</li>
  <li>Performance tracking and analytics</li>
  <li>Offline mode for uninterrupted learning</li>
  <li>Expert guidance and support</li>
</ul>

<h2>Contact Us</h2>
<p>For any queries or support, please reach out to us through the Contact Us section.</p>`,
    status: 'published',
  },
  {
    key: 'privacy_policy',
    title: 'Privacy Policy',
    content: `<h1>Privacy Policy</h1>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Information We Collect</h2>
<p>We collect information that you provide directly to us, including:</p>
<ul>
  <li>Name and email address</li>
  <li>Phone number</li>
  <li>Academic information</li>
  <li>Exam results and performance data</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide and improve our services</li>
  <li>Track your learning progress</li>
  <li>Send you important updates and notifications</li>
  <li>Respond to your questions and support requests</li>
</ul>

<h2>3. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>

<h2>4. Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Access your personal data</li>
  <li>Request correction of your data</li>
  <li>Request deletion of your account</li>
  <li>Opt-out of marketing communications</li>
</ul>

<h2>5. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us through the app.</p>`,
    status: 'published',
  },
  {
    key: 'terms_conditions',
    title: 'Terms & Conditions',
    content: `<h1>Terms & Conditions</h1>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Admission Hero, you accept and agree to be bound by these Terms and Conditions.</p>

<h2>2. User Accounts</h2>
<p>You are responsible for:</p>
<ul>
  <li>Maintaining the confidentiality of your account credentials</li>
  <li>All activities that occur under your account</li>
  <li>Notifying us immediately of any unauthorized use</li>
</ul>

<h2>3. Subscription and Payments</h2>
<ul>
  <li>Subscription fees are charged in advance</li>
  <li>All payments are processed securely</li>
  <li>Refunds are subject to our Refund Policy</li>
</ul>

<h2>4. Content Usage</h2>
<p>All content provided in the app, including questions, solutions, and study materials, is for personal use only. You may not:</p>
<ul>
  <li>Share your account with others</li>
  <li>Copy or distribute our content</li>
  <li>Use our content for commercial purposes</li>
</ul>

<h2>5. Prohibited Activities</h2>
<p>You agree not to:</p>
<ul>
  <li>Violate any laws or regulations</li>
  <li>Interfere with the app's functionality</li>
  <li>Attempt to gain unauthorized access</li>
  <li>Use the app for any fraudulent purpose</li>
</ul>

<h2>6. Termination</h2>
<p>We reserve the right to suspend or terminate your account if you violate these terms.</p>

<h2>7. Changes to Terms</h2>
<p>We may update these terms from time to time. Continued use of the app constitutes acceptance of the updated terms.</p>`,
    status: 'published',
  },
  {
    key: 'refund_policy',
    title: 'Refund Policy',
    content: `<h1>Refund Policy</h1>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Refund Eligibility</h2>
<p>We offer refunds under the following conditions:</p>
<ul>
  <li>Request made within 7 days of purchase</li>
  <li>Technical issues preventing app usage</li>
  <li>Duplicate or incorrect charges</li>
  <li>Service not as described</li>
</ul>

<h2>2. Non-Refundable Situations</h2>
<p>Refunds will not be provided for:</p>
<ul>
  <li>Change of mind after 7 days</li>
  <li>Failure to use the subscription</li>
  <li>Account suspension due to terms violation</li>
  <li>Partial subscription periods</li>
</ul>

<h2>3. How to Request a Refund</h2>
<p>To request a refund:</p>
<ol>
  <li>Contact our support team through the app</li>
  <li>Provide your order details and reason for refund</li>
  <li>Wait for our team to review your request</li>
</ol>

<h2>4. Refund Processing</h2>
<ul>
  <li>Approved refunds are processed within 7-10 business days</li>
  <li>Refunds are issued to the original payment method</li>
  <li>You will receive a confirmation email once processed</li>
</ul>

<h2>5. Subscription Cancellation</h2>
<p>You can cancel your subscription at any time. However:</p>
<ul>
  <li>Cancellation takes effect at the end of the current billing period</li>
  <li>No refund for the remaining period</li>
  <li>Access continues until the end of the paid period</li>
</ul>

<h2>6. Contact Us</h2>
<p>For refund requests or questions, please contact our support team through the app.</p>`,
    status: 'published',
  },
  {
    key: 'contact_us',
    title: 'Contact Us',
    content: `<h1>Contact Us</h1>
<p>We're here to help! Reach out to us through any of the following channels:</p>

<h2>📧 Email</h2>
<p><strong>General Inquiries:</strong> <a href="mailto:support@admissionhero.com">support@admissionhero.com</a></p>
<p><strong>Technical Support:</strong> <a href="mailto:tech@admissionhero.com">tech@admissionhero.com</a></p>
<p><strong>Business Inquiries:</strong> <a href="mailto:business@admissionhero.com">business@admissionhero.com</a></p>

<h2>📱 Phone</h2>
<p><strong>Support Hotline:</strong> +880 1234-567890</p>
<p><strong>Available:</strong> Saturday to Thursday, 9:00 AM - 6:00 PM (GMT+6)</p>

<h2>💬 In-App Support</h2>
<p>Use the chat feature in the app for instant support from our team.</p>

<h2>🏢 Office Address</h2>
<p>
Admission Hero<br>
House #123, Road #456<br>
Dhaka 1234<br>
Bangladesh
</p>

<h2>🕐 Working Hours</h2>
<p>Saturday to Thursday: 9:00 AM - 6:00 PM (GMT+6)</p>
<p>Friday: Closed</p>

<h2>Response Time</h2>
<ul>
  <li>Email: Within 24 hours</li>
  <li>Phone: Immediate during working hours</li>
  <li>In-App Chat: Within 1-2 hours</li>
</ul>`,
    status: 'published',
  },
  {
    key: 'support_info',
    title: 'Support Information',
    content: `<h1>Support & Help Center</h1>
<p>Get help with common issues and learn how to make the most of Admission Hero.</p>

<h2>🚀 Getting Started</h2>
<h3>How to Create an Account</h3>
<ol>
  <li>Download the Admission Hero app</li>
  <li>Tap "Sign Up" on the welcome screen</li>
  <li>Enter your details and verify your email</li>
  <li>Complete your profile setup</li>
</ol>

<h3>How to Subscribe</h3>
<ol>
  <li>Go to Profile → Subscription</li>
  <li>Choose your preferred package</li>
  <li>Complete the payment</li>
  <li>Start accessing premium content</li>
</ol>

<h2>📚 Using the App</h2>
<h3>Taking Practice Exams</h3>
<ul>
  <li>Select your university and subject</li>
  <li>Choose between practice or exam mode</li>
  <li>Complete the test within the time limit</li>
  <li>Review your results and solutions</li>
</ul>

<h3>Offline Mode</h3>
<ul>
  <li>Download exams for offline access</li>
  <li>Take exams without internet connection</li>
  <li>Results sync automatically when online</li>
</ul>

<h2>💳 Payment & Subscription</h2>
<h3>Payment Methods</h3>
<ul>
  <li>bKash</li>
  <li>Nagad</li>
  <li>Credit/Debit Cards</li>
  <li>Mobile Banking</li>
</ul>

<h3>Subscription Issues</h3>
<p>If you're having trouble with your subscription:</p>
<ol>
  <li>Check your payment status</li>
  <li>Verify your internet connection</li>
  <li>Restart the app</li>
  <li>Contact support if issue persists</li>
</ol>

<h2>🔧 Technical Support</h2>
<h3>Common Issues</h3>
<p><strong>App not loading?</strong></p>
<ul>
  <li>Check your internet connection</li>
  <li>Clear app cache</li>
  <li>Update to the latest version</li>
</ul>

<p><strong>Login problems?</strong></p>
<ul>
  <li>Verify your credentials</li>
  <li>Reset your password if needed</li>
  <li>Check if your account is active</li>
</ul>

<h2>📞 Need More Help?</h2>
<p>If you can't find the answer you're looking for:</p>
<ul>
  <li>Use the in-app chat for instant support</li>
  <li>Email us at support@admissionhero.com</li>
  <li>Call our hotline: +880 1234-567890</li>
</ul>`,
    status: 'published',
  },
];

async function initAppContent() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Initializing app content...');
    
    for (const content of defaultContents) {
      const existing = await AppContent.findOne({ key: content.key });
      
      if (existing) {
        console.log(`⏭️  Skipping ${content.key} (already exists)`);
      } else {
        await AppContent.create(content);
        console.log(`✅ Created ${content.key}`);
      }
    }

    console.log('✅ App content initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing app content:', error);
    process.exit(1);
  }
}

initAppContent();
