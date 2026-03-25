/**
 * Email Service Types
 */

/**
 * Email Service Types
 */

export type EmailType =
    | 'registration_confirmation'
    | 'admin_notification'
    | 'event_reminder'
    | 'payment_approved'
    | 'payment_rejected'
    | 'feedback_notification';

export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface EmailLog {
    id: string;
    recipient_email: string;
    recipient_name: string | null;
    email_type: EmailType;
    subject: string;
    status: EmailStatus;
    error_message: string | null;
    registration_id: string | null;
    sent_at: string | null;
    created_at: string;
}

export interface SendReminderRequest {
    dryRun?: boolean;
    force?: boolean;
    ids?: string[];
}

export interface SendReminderResponse {
    success: boolean;
    totalRecipients: number;
    sent: number;
    failed: number;
    errors?: string[];
    message?: string;
    eventPassed?: boolean;
}

export interface SendReminderDryRunResponse {
    dryRun: true;
    totalRecipients: number;
    recipients: string[];
    ids: string[];
}