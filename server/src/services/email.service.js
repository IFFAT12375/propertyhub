import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const smtpTransport = env.EMAIL_PROVIDER === 'smtp'
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    })
  : null

export async function sendInquiryVerification({ email, verificationUrl }) {
  if (env.EMAIL_PROVIDER === 'console') {
    logger.info({
      message: 'Development-only inquiry verification link (email not sent)',
      email,
      verificationUrl,
    })
    return false
  }

  const result = await smtpTransport.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify your PropertyHub inquiry',
    text: [
      'Please verify your email address to share your inquiry with the property seller.',
      '',
      `This link expires in ${env.INQUIRY_VERIFICATION_TTL_MINUTES} minutes:`,
      verificationUrl,
    ].join('\n'),
  })

  if (!result.accepted?.length) {
    throw new Error('SMTP did not accept the inquiry verification email recipient.')
  }

  logger.info({
    message: 'Inquiry verification email sent',
    messageId: result.messageId,
  })
  return true
}
