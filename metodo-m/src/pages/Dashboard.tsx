import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { LessonList, TOTAL_LESSONS, LESSONS } from '../components/LessonList';
import { Link } from 'react-router-dom';
import { Lock, Trophy, Zap, Activity, CalendarDays, Flame, Play } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import gsap from 'gsap';

export function Dashboard() {
    const { user } = useAuth();
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchProgress = async () => {
            const { data, error } = await supabase
                .from('user_progress')
                .select('lesson_slug')
                .eq('user_id', user.id);

            if (!error && data) {
                setCompletedLessons(data.map((item) => item.lesson_slug));
            }
            setLoading(false);
        };

        fetchProgress();
    }, [user]);

    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (!loading) {
            gsap.fromTo(".animate-entrance",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [loading]);

    // Streak Logic
    useEffect(() => {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('metodo_m_last_login');
        const currentStreak = parseInt(localStorage.getItem('metodo_m_streak') || '0', 10);

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastLogin === yesterday.toDateString()) {
                const newStreak = currentStreak + 1;
                setStreak(newStreak);
                localStorage.setItem('metodo_m_streak', newStreak.toString());
            } else {
                setStreak(1);
                localStorage.setItem('metodo_m_streak', '1');
            }
            localStorage.setItem('metodo_m_last_login', today);
        } else {
            setStreak(currentStreak || 1);
        }
    }, []);

    const [lastLessonSlug, setLastLessonSlug] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('metodo_m_last_lesson');
        if (stored) setLastLessonSlug(stored);
    }, []);

    const progressPercentage = Math.round((completedLessons.length / TOTAL_LESSONS) * 100);
    const isSurpriseUnlocked = progressPercentage >= 100;
    const remainingLessons = TOTAL_LESSONS - completedLessons.length;

    // Calculate remaining time
    const remainingMinutes = LESSONS
        .filter(lesson => !completedLessons.includes(lesson.slug))
        .reduce((acc, lesson) => acc + parseInt(lesson.duration), 0);

    // Determine the "Continue" destination
    // 1. If we have a last visited lesson and it's NOT completed, go there.
    // 2. Otherwise, find the first uncompleted lesson.
    // 3. If all completed, maybe the surprise page?
    let continueSlug = '/';

    // Find first uncompleted lesson from the list
    const firstUncompleted = LESSONS.find(l => !completedLessons.includes(l.slug));

    if (lastLessonSlug && !completedLessons.includes(lastLessonSlug)) {
        continueSlug = `/aula/${lastLessonSlug}`;
    } else if (firstUncompleted) {
        continueSlug = `/aula/${firstUncompleted.slug}`;
    } else {
        continueSlug = '/surprise'; // All done
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background">
            <Navbar />
            {/* ... rest of the component */}

            {/* Hero Section */}
            <div className="pt-24 pb-8 border-b border-white/5 bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-entrance">

                        {/* Status */}
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-400">{completedLessons.length}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Nível: {progressPercentage === 100 ? 'Biohacker Elite' : 'Iniciado'}</h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                                    <span>{streak} {streak === 1 ? 'dia' : 'dias'} seguidos</span>
                                </div>
                            </div>
                        </div>

                        {/* Center Progress */}
                        <div className="flex-1 max-w-md w-full md:px-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    {completedLessons.length}/{TOTAL_LESSONS} Concluídas
                                </span>
                                <span className="font-mono font-bold">{progressPercentage}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>
                                    {remainingLessons > 0 ? `Faltam ${remainingLessons} missões` : "Protocolo completo!"}
                                </span>
                                {remainingMinutes > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        +{remainingMinutes} min restantes
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA */}
                        <div>
                            {remainingLessons > 0 ? (
                                <Link to={continueSlug} className="w-full md:w-auto">
                                    <Button size="lg" className="w-full shadow-lg shadow-blue-500/20 gap-2 font-bold animate-pulse">
                                        <Play className="h-4 w-4 fill-current" />
                                        Continuar Treino
                                    </Button>
                                </Link>
                            ) : (
                                <Button size="lg" variant="outline" className="w-full md:w-auto gap-2">
                                    <Activity className="h-4 w-4" />
                                    Ver Relatório
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-12">

                    {/* Left Column: Modules (Main Content) - Width 8 */}
                    <div className="md:col-span-8 space-y-6 animate-entrance">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                Módulos de Treinamento
                            </h3>
                            <Badge variant="outline" className="bg-background/50">
                                {completedLessons.length}/{TOTAL_LESSONS} Completos
                            </Badge>
                        </div>

                        <LessonList completedLessons={completedLessons} />
                    </div>

                    {/* Right Column: Sidebar - Width 4 */}
                    <div className="md:col-span-4 space-y-6 animate-entrance">

                        {/* Protocolo Final Card */}
                        <Card className="glass overflow-hidden border-t-yellow-500/20 relative">
                            {/* Noise or gradient bg specific to this card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />

                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Protocolo Final
                                </CardTitle>
                                <CardDescription>Acesso restrito a elite.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <div className="rounded-lg bg-black/40 p-4 border border-white/5">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                            Suplementação Avançada
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                            Rotina de 7 Dias
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                            Lista de Compras Secreta
                                        </li>
                                    </ul>
                                </div>

                                {isSurpriseUnlocked ? (
                                    <div className="text-center space-y-3">
                                        <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50">
                                            DESBLOQUEADO
                                        </Badge>
                                        <Link to="/surprise">
                                            <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20">
                                                ACESSAR PROTOCOLO
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-yellow-500 transition-colors">
                                                <Lock className="h-4 w-4 mr-2" />
                                                Ver Prévia
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="glass-card">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-yellow-500">
                                                    <Trophy className="h-5 w-5" />
                                                    Protocolo Final: O Que Te Espera
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Complete 100% das aulas para liberar este conteúdo exclusivo.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                        <Activity className="h-6 w-6 text-blue-400 mb-2" />
                                                        <h4 className="font-bold text-sm">Bio-Dados</h4>
                                                        <p className="text-xs text-muted-foreground">Planilha completa de rastreio.</p>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                        <Zap className="h-6 w-6 text-yellow-400 mb-2" />
                                                        <h4 className="font-bold text-sm">Stack Secreta</h4>
                                                        <p className="text-xs text-muted-foreground">Suplementos que eu uso.</p>
                                                    </div>
                                                </div>
                                                <p className="text-center text-sm text-yellow-500/80 italic">
                                                    "A disciplina é a ponte entre metas e realizações."
                                                </p>
                                            </div>
                                            <Button disabled className="w-full opacity-50">
                                                Complete {remainingLessons} aulas para liberar
                                            </Button>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>

                        {/* Bio-Dados / Mini Stats */}
                        <Card className="glass">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                    Estatísticas
                                    <Activity className="h-4 w-4" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <CalendarDays className="h-4 w-4" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium">Dias Ativo</p>
                                                <p className="text-xs text-muted-foreground">Desde o início</p>
                                            </div>
                                        </div>
                                        <span className="font-bold">12</span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-green-500/20 flex items-center justify-center text-green-400">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium">Missões</p>
                                                <p className="text-xs text-muted-foreground">Concluídas</p>
                                            </div>
                                        </div>
                                        <span className="font-bold">{completedLessons.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                    {/* End Sidebar */}

                </div>
            </main>
        </div>
    );
}

// Helper component for icon
function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-24 pb-8 border-b border-white/5 bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="flex-1 max-w-md w-full">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-12 w-40 rounded-md" />
                    </div>
                </div>
            </div>
            <main className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-12">
                    <div className="md:col-span-8 space-y-6">
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="md:col-span-4 space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    );
}
