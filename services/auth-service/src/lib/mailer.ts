import { isDev, config } from "../config";

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (isDev) {
    console.log("\n─────────────────────────────────");
    console.log("📧  DEV EMAIL (not actually sent)");
    console.log(`   To:      ${opts.to}`);
    console.log(`   Subject: ${opts.subject}`);
    console.log(`   Body:    ${opts.text}`);
    console.log("─────────────────────────────────\n");
    return;
  }

  const sgMail = await import("@sendgrid/mail");
  sgMail.default.setApiKey(config.SENDGRID_API_KEY);
  await sgMail.default.send({
    to: opts.to,
    from: config.EMAIL_FROM,
    subject: opts.subject,
    text: opts.text,
    html: opts.html ?? opts.text,
  });
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "DriveLink — Verify your email",
    text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1B2A4A;">Verify your email</h2>
        <p>Your DriveLink verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #C8960C;
                    padding: 20px; background: #FFF8E7; border-radius: 8px; text-align: center;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          This code expires in 10 minutes.
        </p>
      </div>
    `,
  });
}
