import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Login } from './pages/Login';
import { Background } from './components/Background';
import { Protected } from './components/Protected';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Lesson = lazy(() => import('./pages/Lesson').then(module => ({ default: module.Lesson })));
const Surprise = lazy(() => import('./pages/Surprise').then(module => ({ default: module.Surprise })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const SysAdmin = lazy(() => import('./pages/SysAdmin').then(module => ({ default: module.SysAdmin })));
const Arsenal = lazy(() => import('./pages/Arsenal').then(module => ({ default: module.Arsenal })));

// Loading Component
const PageLoader = () => (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

export default function App() {
    return (
        <BrowserRouter>
            <Background />
            <main className="min-h-screen font-sans text-foreground antialiased selection:bg-primary/20">
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">
                        <Routes>
                            <Route path="/login" element={<Login />} />

                            {/* Hidden Admin Route */}
                            <Route path="/config/sys-node-v1" element={<SysAdmin />} />

                            <Route element={<Protected />}>
                                <Route path="/" element={
                                    <Suspense fallback={<PageLoader />}>
                                        <Dashboard />
                                    </Suspense>
                                } />
                                <Route path="/aula/:slug" element={
                                    <Suspense fallback={<PageLoader />}>
                                        <Lesson />
                                    </Suspense>
                                } />
                                <Route path="/surprise" element={
                                    <Suspense fallback={<PageLoader />}>
                                        <Surprise />
                                    </Suspense>
                                } />
                                <Route path="/arsenal" element={
                                    <Suspense fallback={<PageLoader />}>
                                        <Arsenal />
                                    </Suspense>
                                } />
                            </Route>

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </div>
            </main>
        </BrowserRouter>
    );
}
