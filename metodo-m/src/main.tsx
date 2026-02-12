import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { AuthProvider } from './lib/auth.new';

import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <App />
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);
