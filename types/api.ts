/**
 * API Types - Request/Response structures for serverless endpoints
 * 
 * Why this file exists:
 * - Single source of truth for API contracts
 * - Enables type-safe frontend-backend communication
 * - Documents expected payloads without API docs
 */

// ============================================
// Registration Endpoint Types
// ============================================

export interface RegistrationRequest {
    name: string;
    email: string;
    phone?: string;
    college?: string;
    year?: string;
    department?: string;
    paymentMethod: 'online' | 'offline';
    payeeName?: string;       // Required for offline payments - who collects the money
    transactionId?: string;   // Optional for online payments - UPI/bank ref
}

export interface RegistrationResponse {
    success: true;
    message: string;
    registrationId: string;
}

// ============================================
// Error Response Types
// ============================================

export interface ApiErrorResponse {
    success: false;
    error: string;
    code: ApiErrorCode;
}

export type ApiErrorCode =
    | 'VALIDATION_ERROR'
    | 'RATE_LIMIT_EXCEEDED'
    | 'DATABASE_ERROR'
    | 'INTERNAL_ERROR'
    | 'METHOD_NOT_ALLOWED'
    | 'EMAIL_ERROR'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED';

// ============================================
// Unified API Response
// ============================================

export type ApiResponse<T> = T | ApiErrorResponse;

// ============================================
// Database Row Types (mirrors Supabase schema)
// ============================================

export interface RegistrationRow {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    year: string | null;
    department: string | null;
    ticket_type: string;
    payment_method: 'online' | 'offline';
    payment_status: 'pending' | 'approved' | 'rejected';
    payee_name: string | null;
    transaction_id: string | null;
    rejection_reason: string | null;
    approved_by: string | null;
    approved_at: string | null;
    confirmation_email_sent: boolean;
    confirmation_email_sent_at: string | null;
    reminder_email_sent: boolean;
    reminder_email_sent_at: string | null;
    created_at: string;
}
