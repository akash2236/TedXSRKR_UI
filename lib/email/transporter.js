/**
 * Gmail SMTP Transport Factory
 *
 * Creates and caches a nodemailer transporter configured for Gmail SMTP.
 * Uses App Password authentication (requires 2FA on the Gmail account).
 */
import * as nodemailer from 'nodemailer';
import { env } from '../env.js';
let transporter = null;
export function getEmailTransporter() {
    if (transporter)
        return transporter;
    const user = env.GMAIL_SMTP_USER;
    const pass = env.GMAIL_SMTP_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error('[EMAIL] Missing GMAIL_SMTP_USER or GMAIL_SMTP_APP_PASSWORD. ' +
            'Set these in your .env.local or Vercel dashboard.');
    }
    const options = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 5000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
    };
    transporter = nodemailer.createTransport(options);
    return transporter;
}
/**
 * Reset the cached transporter so a fresh connection is created on next use.
 * Call this after a connection error to avoid reusing a stale transport.
 */
export function resetEmailTransporter() {
    if (transporter) {
        transporter.close();
        transporter = null;
    }
}
export function getFromAddress() {
    const name = env.EMAIL_FROM_NAME || 'TEDxSRKR 2026';
    const address = env.EMAIL_FROM_ADDRESS || env.GMAIL_SMTP_USER || '';
    return `"${name}" <${address}>`;
}
