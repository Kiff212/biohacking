import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { Navbar } from '../components/Navbar';
import { TOTAL_LESSONS } from '../components/LessonList';
import { Lock, ShoppingBag } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface AffiliateItem {
    id: string;
    name: string;
    url: string;
    category: string;
    description: string;
}

export function Surprise() {
    const { user } = useAuth();
    const [items, setItems] = useState<AffiliateItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            // Check progress first
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('lesson_slug')
                .eq('user_id', user.id);

            const count = progressData?.length || 0;
            const percentage = Math.round((count / TOTAL_LESSONS) * 100);
            setProgress(percentage);

            if (percentage >= 100) {
                // Fetch items if unlocked
                const { data: itemsData } = await supabase
                    .from('affiliate_items')
                    .select('*');

                if (itemsData) setItems(itemsData);
            }
            setLoading(false);
        };

        fetchData();
    }, [user]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Carregando...</div>;
    }

    if (progress < 100) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-black text-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-yellow-500/20 p-4">
                        <Lock className="h-12 w-12 text-yellow-500" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        ACESSO SECRETO LIBERADO
                    </h1>
                    <p className="mt-4 text-xl text-gray-400">
                        Você provou seu compromisso. Aqui estão as ferramentas de elite.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-transform hover:-translate-y-1 hover:border-yellow-500/50">
                            <div className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300 border border-gray-700">
                                        {item.category}
                                    </span>
                                    <ShoppingBag className="h-5 w-5 text-yellow-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-yellow-400">
                                    {item.name}
                                </h3>
                                <p className="mb-6 text-sm text-gray-400">
                                    {item.description}
                                </p>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full rounded bg-gradient-to-r from-yellow-600 to-yellow-500 py-3 text-center font-bold text-black hover:from-yellow-500 hover:to-yellow-400"
                                >
                                    COMPRAR AGORA
                                </a>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="col-span-full text-center text-gray-500">
                            <p>Nenhum item disponível no momento. Volte em breve.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
