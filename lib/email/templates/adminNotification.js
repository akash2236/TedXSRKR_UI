import * as React from 'react';
import { Text, Section, Link } from '@react-email/components';
import { safeRender } from '../safeRender.js';
import { EmailLayout } from './components/EmailLayout.js';
const AdminNotification = ({ registrantName, registrantEmail, registrantPhone, registrantCollege, ticketType, registrationId, totalRegistrations, }) => (React.createElement(EmailLayout, { previewText: `New registration: ${registrantName} (${ticketType})` },
    React.createElement(Text, { style: {
            color: '#E62B1E',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            margin: '0 0 8px',
        } }, "NEW REGISTRATION"),
    React.createElement(Text, { style: { color: '#FFFFFF', fontSize: '20px', fontWeight: 700, margin: '0 0 24px' } },
        registrantName,
        " just registered"),
    React.createElement(Section, { style: {
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            margin: '0 0 24px',
        } },
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "NAME"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', margin: '0 0 12px' } }, registrantName),
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "EMAIL"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', margin: '0 0 12px' } }, registrantEmail),
        registrantPhone ? (React.createElement(React.Fragment, null,
            React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "PHONE"),
            React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', margin: '0 0 12px' } }, registrantPhone))) : null,
        registrantCollege ? (React.createElement(React.Fragment, null,
            React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "COLLEGE"),
            React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', margin: '0 0 12px' } }, registrantCollege))) : null,
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "TICKET TYPE"),
        React.createElement(Text, { style: { color: '#E62B1E', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' } }, ticketType.toUpperCase()),
        React.createElement(Text, { style: { color: '#999', fontSize: '12px', margin: '0 0 4px' } }, "REGISTRATION ID"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', fontFamily: 'monospace', margin: '0' } }, registrationId)),
    React.createElement(Text, { style: { color: '#999', fontSize: '14px' } },
        "Total registrations: ",
        React.createElement("strong", { style: { color: '#FFF' } }, totalRegistrations)),
    React.createElement(Link, { href: "https://tedxsrkr.com/admin/registrations", style: { color: '#E62B1E', fontSize: '14px', textDecoration: 'underline' } }, "View in Admin Dashboard")));
export async function renderAdminNotification(props) {
    return safeRender(React.createElement(AdminNotification, props));
}
