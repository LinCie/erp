import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { sendEmail } from "@/lib/email/email-client";
import { db } from "../database";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const auth = betterAuth({
  database: {
    db: db,
    type: "postgres",
  },
  plugins: [organization()],
  advanced: { database: { generateId: false } },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Please click the button below to verify your email address:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
              Verify Email
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `,
      });
    },
  },
});
