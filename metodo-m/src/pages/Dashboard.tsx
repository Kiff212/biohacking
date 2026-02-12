import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { LessonList, TOTAL_LESSONS } from '../components/LessonList';
import { Link } from 'react-router-dom';
import { Lock, Unlock, Trophy, Zap, Activity } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

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

    const progressPercentage = Math.round((completedLessons.length / TOTAL_LESSONS) * 100);
    const isSurpriseUnlocked = progressPercentage >= 100;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                <div className="grid gap-8 md:grid-cols-3">

                    {/* Sidebar Area */}
                    <div className="space-y-6 md:col-span-1">

                        {/* Status Card */}
                        <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                    Bio-Dados
                                </CardTitle>
                                <CardDescription>Status atual do protocolo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Progresso</span>
                                            <span className="font-mono text-primary">{progressPercentage}%</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                        <div className="rounded bg-white/5 p-3 border border-white/5">
                                            <div className="text-muted-foreground text-xs">Aulas</div>
                                            <div className="font-bold text-lg">{completedLessons.length}/{TOTAL_LESSONS}</div>
                                        </div>
                                        <div className="rounded bg-white/5 p-3 border border-white/5">
                                            <div className="text-muted-foreground text-xs">Nível</div>
                                            <div className="font-bold text-lg text-blue-400">
                                                {progressPercentage === 100 ? 'Elite' : 'Iniciado'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reward Card */}
                        <Card className="border-white/10 bg-card/50 backdrop-blur-sm border-t-yellow-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Protocolo Final
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center pt-6 pb-6">
                                {isSurpriseUnlocked ? (
                                    <div className="space-y-4 animate-in zoom-in duration-500">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                            <Unlock className="h-8 w-8 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-yellow-500">ACESSO LIBERADO</p>
                                            <p className="text-xs text-muted-foreground">O módulo secreto está disponível</p>
                                        </div>
                                        <Link to="/surprise">
                                            <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20">
                                                ACESSAR AGORA
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4 opacity-70">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Lock className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-muted-foreground">Bloqueado</p>
                                            <p className="text-xs text-muted-foreground/60">Complete 100% para acessar</p>
                                        </div>
                                        <Button disabled variant="outline" className="w-full border-white/10 bg-white/5">
                                            Requer 100%
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2">
                        <Card className="border-white/10 bg-card/30 backdrop-blur-md min-h-[500px]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-400" />
                                    Módulos de Treinamento
                                </CardTitle>
                                <CardDescription>
                                    Complete as missões abaixo para evoluir seu protocolo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LessonList completedLessons={completedLessons} />
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}
