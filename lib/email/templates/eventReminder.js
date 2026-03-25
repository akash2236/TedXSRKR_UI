import * as React from 'react';
import { Text, Section, Hr } from '@react-email/components';
import { safeRender } from '../safeRender.js';
import { EmailLayout } from './components/EmailLayout.js';
const EventReminder = ({ name, registrationId, eventDate, eventVenue, eventAddress, daysUntilEvent, }) => (React.createElement(EmailLayout, { previewText: `TEDxSRKR 2026 is ${daysUntilEvent === 1 ? 'tomorrow' : `in ${daysUntilEvent} days`}! Here's everything you need to know.` },
    React.createElement(Text, { style: { color: '#FFFFFF', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' } }, daysUntilEvent === 1 ? "It's Almost Time!" : `${daysUntilEvent} Days to Go!`),
    React.createElement(Text, { style: { color: '#999', fontSize: '14px', lineHeight: '24px', margin: '0 0 24px' } },
        "Hi ",
        name,
        ", TEDxSRKR 2026 is just around the corner. Here's everything you need."),
    React.createElement(Section, { style: {
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            margin: '0 0 24px',
        } },
        React.createElement(Text, { style: {
                color: '#E62B1E',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                margin: '0 0 12px',
            } }, "EVENT DETAILS"),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' } }, eventDate),
        React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', margin: '0 0 4px' } }, eventVenue),
        React.createElement(Text, { style: { color: '#999', fontSize: '13px', margin: '0' } }, eventAddress)),
    React.createElement(Hr, { style: { borderColor: '#333', margin: '24px 0' } }),
    React.createElement(Text, { style: { color: '#FFF', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' } }, "Checklist"),
    React.createElement(Text, { style: { color: '#999', fontSize: '13px', lineHeight: '22px' } },
        "- Bring a valid ID for check-in",
        '\n',
        "- Your Registration ID: ",
        React.createElement("strong", { style: { color: '#E62B1E' } }, registrationId),
        '\n',
        "- Arrive by 9:00 AM for registration",
        '\n',
        "- Dress code: Smart casual")));
export async function renderEventReminder(props) {
    return safeRender(React.createElement(EventReminder, props));
}
