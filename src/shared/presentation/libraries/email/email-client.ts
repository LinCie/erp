import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set")
}

if (!process.env.EMAIL_FROM) {
  throw new Error("EMAIL_FROM is not set")
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Email send error:", error)
    throw error
  }
}
