import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E62B1E]/10 flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#E62B1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-400 text-base md:text-lg mb-6">
                                We encountered an unexpected error. Please try refreshing the page.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 bg-[#E62B1E] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#cc2020] transition-colors duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reload Page
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="ml-3 inline-flex items-center gap-2 border-2 border-white/20 text-white px-6 py-3 rounded-full font-semibold hover:border-white/40 transition-colors duration-300"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
