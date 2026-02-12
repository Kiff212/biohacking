import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { Navbar } from '../components/Navbar';
import { LESSONS, BONUS_LESSONS } from '../components/LessonList';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SwipeDeck } from '../components/SwipeDeck';
import { BottomProgress } from '../components/BottomProgress';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Skeleton } from '../components/ui/skeleton';

interface LessonCard {
    heading: string;
    body: string;
}

export function Lesson() {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cardIndex, setCardIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    const lesson = LESSONS.find((l) => l.slug === slug) || BONUS_LESSONS.find((l) => l.slug === slug);
    const currentIndex = LESSONS.findIndex((l) => l.slug === slug);

    // Calculate Progress
    const totalLessons = LESSONS.length;
    // If bonus (index -1), we don't show specific lesson 2/5 progress, maybe just 100% or hidden
    const lessonPct = currentIndex !== -1 ? Math.round(((currentIndex + 1) / totalLessons) * 100) : 100;

    useEffect(() => {
        if (!slug) return;

        const loadContent = async () => {
            try {
                const module = await import(`../content/${slug}.md?raw`);
                setContent(module.default);
            } catch (error) {
                console.error('Failed to load lesson content', error);
                setContent('# Erro\n\nNão foi possível carregar o conteúdo.');
            }
        };

        const checkProgress = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('lesson_slug', slug)
                .maybeSingle();

            setIsCompleted(!!data);
        };

        setLoading(true);

        Promise.all([loadContent(), checkProgress()]).then(() => setLoading(false));

        // Save as last seen
        localStorage.setItem('metodo_m_last_lesson', slug);

        // Prefetch next lesson
        const nextLessonIndex = LESSONS.findIndex((l) => l.slug === slug) + 1;
        if (nextLessonIndex > 0 && nextLessonIndex < LESSONS.length) {
            const nextSlug = LESSONS[nextLessonIndex].slug;
            import(`../content/${nextSlug}.md?raw`).catch(() => { });
        }
    }, [slug, user]);

    // Parse Markdown into Cards
    const cards = useMemo<LessonCard[]>(() => {
        if (!content) return [];

        const rawParts = content.split(/\r?\n\s*---\s*\r?\n/);

        const parsedCards = rawParts
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .map((part, i) => {
                let cleanPart = part;
                const headerMatch = cleanPart.match(/^#{1,2}\s+(.+)$/m);
                let heading = headerMatch ? headerMatch[1] : `Seção ${i + 1}`;

                return {
                    heading,
                    body: cleanPart
                };
            });

        parsedCards.push({
            heading: "Conclusão",
            body: `### Parabéns! \n\nVocê finalizou o conteúdo desta aula. \n\nClique abaixo para marcar como **Concluída** e avançar.`
        });

        return parsedCards;

    }, [content]);

    const cardPct = Math.round(((cardIndex + 1) / cards.length) * 100);

    const handleComplete = async () => {
        if (!user || !slug) return;
        setSaving(true);
        // Optimistic update
        setIsCompleted(true);

        try {
            await supabase
                .from('user_progress')
                .upsert(
                    { user_id: user.id, lesson_slug: slug, completed: true, completed_at: new Date().toISOString() },
                    { onConflict: 'user_id,lesson_slug' }
                );
            // Navigate after successful save to ensure data consistency
            navigate('/');
        } catch (error) {
            console.error('Error saving progress', error);
            // Revert on error
            setIsCompleted(false);
            // Show error toast (if implemented)
        } finally {
            setSaving(false);
        }
    };

    if (!lesson) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            <Navbar />

            <div className="max-w-xl mx-auto px-4 py-8 pt-24">
                <div className="mb-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">
                                    {(lesson as any)?.category || 'Módulo'}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-foreground">
                                    {lesson?.title.split('. ')[1] || lesson?.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-6">
                        {/* Breadcrumb Skeleton */}
                        <div className="flex items-center gap-2 mb-6">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        {/* Card Skeleton */}
                        <div className="w-full aspect-[3/4] max-h-[60vh] rounded-2xl bg-muted/20 relative overflow-hidden border border-white/5">
                            <div className="p-6 space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <SwipeDeck
                            title={lesson.title}
                            cards={cards}
                            currentIndex={cardIndex}
                            onIndexChange={setCardIndex}
                        />

                        {cardIndex === cards.length - 1 && (
                            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                                <Button
                                    className={`w-full h-12 text-lg shadow-lg shadow-green-900/20 text-white ${isCompleted ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'}`}
                                    onClick={handleComplete}
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando...' : isCompleted ? 'Concluída!' : 'Marcar como Concluída'}
                                    <CheckCircle className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <BottomProgress
                lessonPct={lessonPct}
                cardPct={cardPct}
                label={`${lesson.title} • Card ${cardIndex + 1}/${cards.length}`}
            />
        </div>
    );
}
