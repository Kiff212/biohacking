import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Lesson } from './pages/Lesson';
import { Surprise } from './pages/Surprise';
import { NotFound } from './pages/NotFound';
import { Protected } from './components/Protected';
import { Background } from './components/Background';
import { SysAdmin } from './pages/SysAdmin';
import { Arsenal } from './pages/Arsenal';

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
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/aula/:slug" element={<Lesson />} />
                                <Route path="/surprise" element={<Surprise />} />
                                <Route path="/arsenal" element={<Arsenal />} />
                            </Route>

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </div>
            </main>
        </BrowserRouter>
    );
}
