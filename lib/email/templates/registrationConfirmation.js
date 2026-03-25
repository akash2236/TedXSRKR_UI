import * as React from 'react';
import { Text, Button, Section, Hr } from '@react-email/components';
import { safeRender } from '../safeRender.js';
import { EmailLayout } from './components/EmailLayout.js';
const RegistrationConfirmation = ({ name, registrationId, ticketType, eventDate, eventVenue, }) => (React.createElement(EmailLayout, { previewText: `You're registered for TEDxSRKR 2026! Registration ID: ${registrationId}` },
    React.createElement(Text, { style: { color: '#FFFFFF', fontSize: '24px', fontWeight: 700, margin: '0 0 16px' } },
        "You're In, ",
        name,
        "!"),
    React.createElement(Text, { style: { color: '#999', fontSize: '14px', lineHeight: '24px' } }, "Thank you for registering for TEDxSRKR 2026. Your spot has been confirmed."),
    React.createElement(Section, { style: {
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            margin: '24px 0',
        } },
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "REGISTRATION ID"),
        React.createElement(Text, { style: {
                color: '#E62B1E',
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'monospace',
                margin: '0',
            } }, registrationId)),
    React.createElement(Section, { style: { margin: '24px 0' } },
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "TICKET TYPE"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' } }, ticketType.charAt(0).toUpperCase() + ticketType.slice(1)),
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "DATE"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' } }, eventDate),
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "VENUE"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0' } }, eventVenue)),
    React.createElement(Hr, { style: { borderColor: '#333', margin: '24px 0' } }),
    React.createElement(Text, { style: { color: '#999', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' } }, "What's Next?"),
    React.createElement(Text, { style: { color: '#999', fontSize: '13px', lineHeight: '22px' } },
        "- Save your Registration ID for check-in",
        '\n',
        "- Arrive 30 minutes early for smooth check-in",
        '\n',
        "- Follow @tedxsrkr on Instagram for updates"),
    React.createElement(Button, { href: "https://tedxsrkr.com/schedule", style: {
            backgroundColor: '#E62B1E',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
            marginTop: '24px',
        } }, "View Event Schedule")));
export async function renderRegistrationConfirmation(props) {
    return safeRender(React.createElement(RegistrationConfirmation, props));
}
