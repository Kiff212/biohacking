import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.new';

export function Protected() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <div className="text-xl animate-pulse">Carregando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
