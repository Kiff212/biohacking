import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { Navbar } from '../components/Navbar';
import { LESSONS } from '../components/LessonList';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SwipeDeck } from '../components/SwipeDeck';
import { BottomProgress } from '../components/BottomProgress';

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

    const lesson = LESSONS.find((l) => l.slug === slug);
    const currentIndex = LESSONS.findIndex((l) => l.slug === slug);

    // Calculate Progress
    const totalLessons = LESSONS.length;
    const lessonPct = Math.round(((currentIndex + 1) / totalLessons) * 100);

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
    }, [slug, user]);

    // Parse Markdown into Cards
    const cards = useMemo<LessonCard[]>(() => {
        if (!content) return [];

        // Split primarily by `---` separator for controlled card creation
        // The regex `/\r?\n\s*---\s*\r?\n/` handles Windows/Unix newlines and spaces
        const rawParts = content.split(/\r?\n\s*---\s*\r?\n/);

        const parsedCards = rawParts
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .map((part, i) => {
                let cleanPart = part;

                // Extract Title look for first H1 or H2
                const headerMatch = cleanPart.match(/^#{1,2}\s+(.+)$/m);
                let heading = headerMatch ? headerMatch[1] : `Seção ${i + 1}`;

                // Optional: We can remove the title from the body for cleaner cards
                // or keep it if it provides context. Let's keep it simple for now.
                // cleanPart = cleanPart.replace(/^#{1,2}\s+.+$/m, '').trim();

                return {
                    heading,
                    body: cleanPart
                };
            });

        // Add final "Completion" card
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
        try {
            await supabase
                .from('user_progress')
                .upsert(
                    { user_id: user.id, lesson_slug: slug, completed: true, completed_at: new Date().toISOString() },
                    { onConflict: 'user_id,lesson_slug' }
                );
            setIsCompleted(true);
            navigate('/');
        } catch (error) {
            console.error('Error saving progress', error);
        } finally {
            setSaving(false);
        }
    };

    if (!lesson) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            <Navbar />

            <div className="max-w-xl mx-auto px-4 py-8 pt-24">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                </button>

                {loading ? (
                    <div className="animate-pulse flex flex-col gap-4">
                        <div className="h-8 w-3/4 bg-white/10 rounded"></div>
                        <div className="h-64 w-full bg-white/5 rounded"></div>
                    </div>
                ) : (
                    <>
                        <SwipeDeck
                            title={lesson.title}
                            cards={cards}
                            currentIndex={cardIndex}
                            onIndexChange={setCardIndex}
                        />

                        {/* Special Actions for Last Card */}
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
