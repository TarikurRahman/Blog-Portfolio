import nodemailer from 'nodemailer';

export async function sendNotificationEmail(subject: string, htmlContent: string): Promise<boolean> {
  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = process.env.SMTP_PORT || '587';
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
    const receiver = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

    // If SMTP details are not configured, log a warning and return false
    if (!host || !port || !user || !pass) {
      console.warn('[SMTP Email Helper] Email notification skipped: Missing SMTP environment configuration.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465, // True for port 465, false for other ports (e.g. 587)
      auth: {
        user,
        pass,
      },
      tls: {
        // Do not fail on invalid certificates (helpful for local or self-signed setups)
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Portfolio Alerts" <${user}>`,
      to: receiver,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP Email Helper] Email notification sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('[SMTP Email Helper] Failed to send email notification:', error);
    return false;
  }
}
