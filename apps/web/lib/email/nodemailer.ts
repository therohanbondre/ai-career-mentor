import nodemailer from "nodemailer"

/*
 * Email Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides two transports depending on environment:
 *   - Development : Ethereal (catch-all SMTP — prints preview URL to console)
 *   - Production  : SMTP credentials from environment variables
 *
 * Required env vars (production):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Optional env vars (both):
 *   NEXT_PUBLIC_APP_URL  – used to build action links in emails
 */

// ─── Transport ────────────────────────────────────────────────────────────────

function createTransport() {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  // Development: use Ethereal auto-account so no real credentials are needed
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER ?? "ethereal_dev",
      pass: process.env.ETHEREAL_PASS ?? "ethereal_dev",
    },
  })
}

const transport = createTransport()

const FROM =
  process.env.SMTP_FROM ?? '"AI Career Mentor" <noreply@aicareermentor.app>'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sendMail(options: nodemailer.SendMailOptions) {
  try {
    const info = await transport.sendMail({ from: FROM, ...options })

    // In development, Nodemailer returns a preview URL via Ethereal
    if (process.env.NODE_ENV !== "production") {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log("[Email preview]", previewUrl)
      }
    }

    return info
  } catch (error) {
    console.error("Email send error:", error)
    throw error
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function baseTemplate(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .header  { background: #0f172a; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #ffffff; letter-spacing: -0.3px; }
    .header span { color: #38bdf8; }
    .body    { padding: 32px; }
    .body p  { margin: 0 0 16px; line-height: 1.6; font-size: 15px; color: #475569; }
    .btn     { display: inline-block; padding: 13px 28px; background: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.2px; }
    .btn:hover { background: #1e293b; }
    .note    { font-size: 13px !important; color: #94a3b8 !important; }
    .footer  { padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>AI Career <span>Mentor</span></h1>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} AI Career Mentor &nbsp;|&nbsp; You received this because you registered an account.
    </div>
  </div>
</body>
</html>`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send an email verification link to a newly registered user.
 * The token is appended as a query param so the verify-email page can consume it.
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`
  const greeting = name ? `Hi ${name},` : "Hi there,"

  const html = baseTemplate(
    "Verify your email — AI Career Mentor",
    `
    <p>${greeting}</p>
    <p>Thanks for signing up! Please verify your email address to activate your account and start your AI-powered career journey.</p>
    <p style="text-align:center; margin: 28px 0;">
      <a class="btn" href="${verifyUrl}">Verify Email Address</a>
    </p>
    <p class="note">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
    <p class="note">Or copy this URL into your browser:<br />${verifyUrl}</p>
    `
  )

  return sendMail({
    to: email,
    subject: "Verify your email — AI Career Mentor",
    html,
    text: `Verify your email: ${verifyUrl}`,
  })
}

/**
 * Send a password-reset link.
 * The token is embedded in the URL so the reset-password page can consume it.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  const html = baseTemplate(
    "Reset your password — AI Career Mentor",
    `
    <p>Hi,</p>
    <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>
    <p style="text-align:center; margin: 28px 0;">
      <a class="btn" href="${resetUrl}">Reset Password</a>
    </p>
    <p class="note">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <p class="note">Or copy this URL into your browser:<br />${resetUrl}</p>
    `
  )

  return sendMail({
    to: email,
    subject: "Reset your password — AI Career Mentor",
    html,
    text: `Reset your password: ${resetUrl}`,
  })
}

/**
 * Generic notification email (used by the notification service in later milestones).
 */
export async function sendNotificationEmail(
  email: string,
  subject: string,
  bodyHtml: string
) {
  const html = baseTemplate(subject, bodyHtml)
  return sendMail({ to: email, subject, html })
}
