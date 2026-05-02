import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ── Gmail SMTP Transporter ────────────────────────────────────────────────────
const smtpTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER || 'mail.admissionhero@gmail.com',
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ── Resend (Fallback) ─────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Send OTP Email ─────────────────────────────────────────────────────────────
export async function sendOtpEmail(toEmail: string, otp: string): Promise<void> {
  const subject = 'পাসওয়ার্ড রিসেট OTP - Admission Hero';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #4F46E5; text-align: center;">Admission Hero</h2>
      <p style="font-size: 16px;">আপনার পাসওয়ার্ড রিসেট করতে নিচের <strong>OTP</strong> ব্যবহার করুন:</p>
      <div style="background: #f0f0ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 36px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; font-size: 14px;">এই OTP <strong>15 মিনিট</strong> পর্যন্ত valid থাকবে।</p>
      <p style="color: #999; font-size: 12px;">আপনি যদি পাসওয়ার্ড রিসেটের অনুরোধ না করে থাকেন, এই ইমেইল উপেক্ষা করুন।</p>
    </div>
  `;

  // ── Try Gmail SMTP first ──────────────────────────────────────────────────
  try {
    await smtpTransporter.sendMail({
      from: `"Admission Hero" <${process.env.EMAIL_USER || 'mail.admissionhero@gmail.com'}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ OTP email sent via Gmail SMTP to: ${toEmail}`);
    return;
  } catch (smtpError: any) {
    console.warn('⚠️ Gmail SMTP failed, trying Resend fallback...', smtpError.message);
  }

  // ── Fallback: Resend API ──────────────────────────────────────────────────
  try {
    const { error: resendError } = await resend.emails.send({
      from: 'Admission Hero <onboarding@resend.dev>',
      to: ['mail.admissionhero@gmail.com'], // Resend free plan restriction
      subject: `[OTP for ${toEmail}] ${subject}`,
      html: `
        <p style="background:#fff3cd;padding:10px;border-radius:6px;">
          📧 এই OTP টি <strong>${toEmail}</strong> এর জন্য।
        </p>
        ${html}
      `,
    });

    if (resendError) throw new Error(resendError.message);
    console.log(`✅ OTP email sent via Resend fallback for: ${toEmail}`);
  } catch (resendErr: any) {
    console.error('❌ Both SMTP and Resend failed:', resendErr.message);
    throw new Error('Email sending failed on all channels');
  }
}
