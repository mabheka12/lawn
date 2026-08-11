import { Resend } from 'resend'
import * as dotenv from 'dotenv'

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function main() {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [process.env.ADMIN_EMAIL!.split(',')[0].trim()],
    subject: 'Test email from lawnmowingnearme',
    html: '<p>If you got this, Resend is wired up correctly.</p>',
  })

  if (error) {
    console.error('Send failed:', error)
    process.exit(1)
  }

  console.log('Sent successfully:', data)
}

main()