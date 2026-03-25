import { Html, Head, Body, Container, Section, Text, Hr, Preview, Font, } from '@react-email/components';
import * as React from 'react';
export const EmailLayout = ({ previewText, children }) => (React.createElement(Html, null,
    React.createElement(Head, null,
        React.createElement(Font, { fontFamily: "Inter", fallbackFontFamily: "Arial", webFont: {
                url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
                format: 'woff2',
            } })),
    React.createElement(Preview, null, previewText),
    React.createElement(Body, { style: {
            backgroundColor: '#0A0A0A',
            margin: 0,
            padding: 0,
            fontFamily: 'Inter, Arial, sans-serif',
        } },
        React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' } },
            React.createElement(Section, { style: { textAlign: 'center', marginBottom: '32px' } },
                React.createElement(Text, { style: {
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: 0,
                    } },
                    React.createElement("span", { style: { color: '#E62B1E' } }, "TEDx"),
                    "SRKR"),
                React.createElement(Text, { style: {
                        color: '#666',
                        fontSize: '12px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    } }, "Ideas Worth Spreading")),
            React.createElement(Section, { style: {
                    backgroundColor: '#121212',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '32px',
                } }, children),
            React.createElement(Section, { style: { textAlign: 'center', marginTop: '32px' } },
                React.createElement(Hr, { style: { borderColor: '#333', margin: '24px 0' } }),
                React.createElement(Text, { style: { color: '#666', fontSize: '12px', lineHeight: '20px' } }, "TEDxSRKR 2026 | SRKR Engineering College, Bhimavaram"),
                React.createElement(Text, { style: { color: '#666', fontSize: '11px' } }, "This event is independently organized under license from TED."))))));
