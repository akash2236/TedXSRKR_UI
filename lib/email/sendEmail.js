/**
 * Core Email Send Function
 *
 * Handles sending emails with logging to the email_logs table.
 * Provides both awaitable and fire-and-forget variants.
 */
import { getEmailTransporter, getFromAddress, resetEmailTransporter } from './transporter.js';
import { getSupabaseAdmin, Tables } from '../supabase.js';
import { env } from '../env.js';
export async function sendEmail(options) {
    const { to, subject, html, replyTo, registrationId, emailType } = options;
    // Validate transporter is available BEFORE logging attempt to avoid
    // orphaned "pending" entries when SMTP credentials are missing
    let transporter;
    try {
        transporter = getEmailTransporter();
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Email transporter not configured';
        console.error(`[EMAIL] Transporter unavailable for ${emailType} to ${to}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
    const supabase = getSupabaseAdmin();
    // Log the attempt
    const { data: logEntry } = await supabase
        .from(Tables.EMAIL_LOGS)
        .insert({
        recipient_email: to,
        email_type: emailType,
        subject,
        status: 'pending',
        registration_id: registrationId || null,
    })
        .select('id')
        .single();
    try {
        const info = await transporter.sendMail({
            from: getFromAddress(),
            to,
            subject,
            html,
            replyTo: replyTo || env.EMAIL_FROM_ADDRESS,
        });
        // Update log to sent
        if (logEntry?.id) {
            await supabase
                .from(Tables.EMAIL_LOGS)
                .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
            })
                .eq('id', logEntry.id);
        }
        return { success: true, messageId: info.messageId };
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown email error';
        console.error(`[EMAIL] Failed to send ${emailType} to ${to}:`, errorMessage);
        // Reset transporter on connection errors so next attempt creates a fresh one
        resetEmailTransporter();
        // Update log to failed
        if (logEntry?.id) {
            await supabase
                .from(Tables.EMAIL_LOGS)
                .update({
                status: 'failed',
                error_message: errorMessage,
            })
                .eq('id', logEntry.id);
        }
        return { success: false, error: errorMessage };
    }
}
/**
 * Fire-and-forget email sending. Does not throw.
 * Used in the registration flow where email failure must not block the response.
 */
export function sendEmailAsync(options) {
    sendEmail(options).catch((err) => {
        console.error('[EMAIL] Async send failed:', err);
    });
}
