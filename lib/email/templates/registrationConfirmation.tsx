import * as React from 'react';
import { Text, Button, Section, Hr } from '@react-email/components';
import { safeRender } from '../safeRender.js';
import { EmailLayout } from './components/EmailLayout.js';

interface RegistrationConfirmationProps {
    name: string;
    email: string;
    registrationId: string;
    ticketType: string;
    eventDate: string;
    eventVenue: string;
}

const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
    name, registrationId, ticketType, eventDate, eventVenue,
}) => (
    <EmailLayout previewText={`You're registered for TEDxSRKR 2026! Registration ID: ${registrationId}`}>
        <Text style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700, margin: '0 0 16px' }}>
            You're In, {name}!
        </Text>
        <Text style={{ color: '#999', fontSize: '14px', lineHeight: '24px' }}>
            Thank you for registering for TEDxSRKR 2026. Your spot has been confirmed.
        </Text>

        <Section style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            margin: '24px 0',
        }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>REGISTRATION ID</Text>
            <Text style={{
                color: '#E62B1E',
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'monospace',
                margin: '0',
            }}>
                {registrationId}
            </Text>
        </Section>

        <Section style={{ margin: '24px 0' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>TICKET TYPE</Text>
            <Text style={{ color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>
                {ticketType.charAt(0).toUpperCase() + ticketType.slice(1)}
            </Text>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>DATE</Text>
            <Text style={{ color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>
                {eventDate}
            </Text>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>VENUE</Text>
            <Text style={{ color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0' }}>
                {eventVenue}
            </Text>
        </Section>

        <Hr style={{ borderColor: '#333', margin: '24px 0' }} />

        <Text style={{ color: '#999', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
            What's Next?
        </Text>
        <Text style={{ color: '#999', fontSize: '13px', lineHeight: '22px' }}>
            - Save your Registration ID for check-in{'\n'}
            - Arrive 30 minutes early for smooth check-in{'\n'}
            - Follow @tedxsrkr on Instagram for updates
        </Text>

        <Button
            href="https://tedxsrkr.com/schedule"
            style={{
                backgroundColor: '#E62B1E',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '24px',
            }}
        >
            View Event Schedule
        </Button>
    </EmailLayout>
);

export async function renderRegistrationConfirmation(props: RegistrationConfirmationProps): Promise<string> {
    return safeRender(React.createElement(RegistrationConfirmation, props));
}