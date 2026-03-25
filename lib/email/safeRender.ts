import * as React from 'react';
import { renderToString } from 'react-dom/server';

/**
 * Safe Rendering Utility for React 19 + @react-email
 * 
 * Why this exists:
 * @react-email/render currently has a known incompatibility with React 19 
 * that causes FUNCTION_INVOCATION_FAILED (segmentation faults) on Vercel/Netlify.
 * This utility provides a fallback to standard React SSR.
 */
export async function safeRender(component: React.ReactElement): Promise<string> {
  try {
    // Try to import the official renderer dynamically
    // If it's the cause of the crash, it might fail here or during execution
    const { render: officialRender } = await import('@react-email/render');
    return await officialRender(component);
  } catch (error) {
    console.warn('[RENDER] Official @react-email/render failed or is incompatible. Falling back to standard SSR:', error);
    
    // Fallback: Standard SSR
    // Note: This won't have the fancy minification/inlining of react-email
    // but it won't crash the server.
    const markup = renderToString(component);
    
    // Add DOCTYPE for email client compatibility
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en">
  ${markup}
</html>`;
  }
}
