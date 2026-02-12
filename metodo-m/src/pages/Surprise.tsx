import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { Navbar } from '../components/Navbar';
import { TOTAL_LESSONS, BONUS_LESSONS } from '../components/LessonList';
import { Lock, ShoppingBag, BookOpen, Crown } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {/* Bonus Content */}
                    {BONUS_LESSONS.map((lesson) => (
                        <Link key={lesson.slug} to={`/aula/${lesson.slug}`} className="group relative overflow-hidden rounded-xl border border-yellow-500/20 bg-yellow-950/10 hover:bg-yellow-900/20 transition-all hover:-translate-y-1 hover:border-yellow-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-6 relative">
                                <div className="mb-4 flex items-center justify-between">
                                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10">
                                        {lesson.category}
                                    </Badge>
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-yellow-400">
                                    {lesson.title}
                                </h3>
                                <p className="mb-6 text-sm text-gray-400">
                                    {lesson.description}
                                </p>
                                <div className="flex items-center text-xs text-yellow-500/70 font-mono">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    ACESSO VITALÍCIO
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                        Parceiros Exclusivos
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
                        <div className="col-span-full text-center text-gray-500 py-12 border border-dashed border-white/5 rounded-xl">
                            <p>Nenhum parceiro disponível no momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
