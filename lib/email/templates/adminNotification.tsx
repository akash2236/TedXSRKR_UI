import * as React from 'react';
import { Text, Section, Link } from '@react-email/components';
import { safeRender } from '../safeRender.js';
import { EmailLayout } from './components/EmailLayout.js';

interface AdminNotificationProps {
    registrantName: string;
    registrantEmail: string;
    registrantPhone?: string;
    registrantCollege?: string;
    ticketType: string;
    registrationId: string;
    totalRegistrations: number;
}

const AdminNotification: React.FC<AdminNotificationProps> = ({
    registrantName, registrantEmail, registrantPhone, registrantCollege,
    ticketType, registrationId, totalRegistrations,
}) => (
    <EmailLayout previewText={`New registration: ${registrantName} (${ticketType})`}>
        <Text style={{
            color: '#E62B1E',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            margin: '0 0 8px',
        }}>
            NEW REGISTRATION
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, margin: '0 0 24px' }}>
            {registrantName} just registered
        </Text>

        <Section style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            margin: '0 0 24px',
        }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>NAME</Text>
            <Text style={{ color: '#FFF', fontSize: '14px', margin: '0 0 12px' }}>{registrantName}</Text>

            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>EMAIL</Text>
            <Text style={{ color: '#FFF', fontSize: '14px', margin: '0 0 12px' }}>{registrantEmail}</Text>

            {registrantPhone ? (
                <>
                    <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>PHONE</Text>
                    <Text style={{ color: '#FFF', fontSize: '14px', margin: '0 0 12px' }}>{registrantPhone}</Text>
                </>
            ) : null}

            {registrantCollege ? (
                <>
                    <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>COLLEGE</Text>
                    <Text style={{ color: '#FFF', fontSize: '14px', margin: '0 0 12px' }}>{registrantCollege}</Text>
                </>
            ) : null}

            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>TICKET TYPE</Text>
            <Text style={{ color: '#E62B1E', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
                {ticketType.toUpperCase()}
            </Text>

            <Text style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>REGISTRATION ID</Text>
            <Text style={{ color: '#FFF', fontSize: '14px', fontFamily: 'monospace', margin: '0' }}>
                {registrationId}
            </Text>
        </Section>

        <Text style={{ color: '#999', fontSize: '14px' }}>
            Total registrations: <strong style={{ color: '#FFF' }}>{totalRegistrations}</strong>
        </Text>

        <Link
            href="https://tedxsrkr.com/admin/registrations"
            style={{ color: '#E62B1E', fontSize: '14px', textDecoration: 'underline' }}
        >
            View in Admin Dashboard
        </Link>
    </EmailLayout>
);

export async function renderAdminNotification(props: AdminNotificationProps): Promise<string> {
    return safeRender(React.createElement(AdminNotification, props));
}