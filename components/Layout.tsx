import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout Component
 * 
 * Provides consistent page structure with:
 * - Skip-to-content link for accessibility
 * - Header and Footer
 * - Page title updates on navigation
 * - Scroll-to-top on route change
 */

// Page title mapping
const pageTitles: Record<string, string> = {
    '/': 'TEDxSRKR 2026 | Ideas Worth Spreading',
    '/about': 'About | TEDxSRKR 2026',
    '/speakers': 'Speakers | TEDxSRKR 2026',
    '/schedule': 'Schedule | TEDxSRKR 2026',
    '/team': 'Our Team | TEDxSRKR 2026',
    '/register': 'Register | TEDxSRKR 2026',
};

const Layout: React.FC = () => {
    const location = useLocation();

    // Scroll to top and update title on route change
    useEffect(() => {
        window.scrollTo(0, 0);

        // Update document title
        const title = pageTitles[location.pathname] || 'TEDxSRKR 2026';
        document.title = title;
    }, [location.pathname]);

    return (
        <div className="bg-black min-h-screen font-sans">
            {/* Skip to main content link - accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#E62B1E] focus:text-white focus:rounded-md focus:font-medium"
            >
                Skip to main content
            </a>

            <Header />
            <main id="main-content" tabIndex={-1}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
