import { Link } from 'react-router-dom';

export function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mt-2 text-gray-400">Página não encontrada</p>
            <Link to="/" className="mt-4 text-blue-500 hover:text-blue-400">
                Voltar ao início
            </Link>
        </div>
    );
}
