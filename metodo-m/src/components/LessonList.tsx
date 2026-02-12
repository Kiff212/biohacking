import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Lock, Play, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface Lesson {
    slug: string;
    title: string;
    description: string;
    duration: string;
    xp: number;
    category: string;
}

interface LessonListProps {
    completedLessons: string[];
}

const LESSONS: Lesson[] = [
    { slug: '01-introducao', title: '01. Introdução ao Método M', description: 'Entenda a filosofia e os objetivos.', duration: '5 min', xp: 10, category: 'Fundamentos' },
    { slug: '02-fome-saciedade', title: '02. Fome e Saciedade', description: 'Reprograme seus hormônios.', duration: '12 min', xp: 20, category: 'Nutrição' },
    { slug: '03-rotina-minima', title: '03. Rotina Mínima Viável', description: 'O mínimo efetivo para resultados.', duration: '8 min', xp: 15, category: 'Hábito' },
    { slug: '04-sono-luz', title: '04. Sono e Luz', description: 'Biohacking circadiano avançado.', duration: '15 min', xp: 25, category: 'Sono' },
    { slug: '05-performance', title: '05. Performance Máxima', description: 'Otimização cognitiva e física.', duration: '10 min', xp: 20, category: 'Cognição' },
];

export const BONUS_LESSONS: Lesson[] = [
    { slug: 'rotina-7-dias', title: 'Rotina de 7 Dias', description: 'Protocolo de Ativação Semanal.', duration: '7 dias', xp: 100, category: 'Protocolo' },
    { slug: 'lista-compras-secreta', title: 'Lista de Compras Secreta', description: 'Protocolo de Otimização Nutricional.', duration: 'Vitalício', xp: 100, category: 'Nutrição' },
];

export function LessonList({ completedLessons }: LessonListProps) {
    // Determine the first uncompleted lesson to mark as "Current"
    const nextLessonIndex = LESSONS.findIndex(l => !completedLessons.includes(l.slug));
    const currentLessonSlug = nextLessonIndex !== -1 ? LESSONS[nextLessonIndex].slug : null;

    return (
        <div className="space-y-4">
            {LESSONS.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.slug);
                const isCurrent = lesson.slug === currentLessonSlug;

                // Allow access if it's completed, current, or the very first lesson (always open)
                // Actually, logic: if locked, disable link.
                // Current logic: unlock if previous is completed.
                // Assuming sequential order for locking:
                const isAccessible = index === 0 || completedLessons.includes(LESSONS[index - 1].slug) || isCompleted;

                return (
                    <Link
                        key={lesson.slug}
                        to={isAccessible ? `/aula/${lesson.slug}` : '#'}
                        className={cn("block group", !isAccessible && "pointer-events-none")}
                    >
                        <Card className={cn(
                            "transition-all duration-300 border-l-4",
                            isCompleted ? "border-l-green-500 bg-black/40 border-white/5 opacity-70 hover:opacity-100" :
                                isCurrent ? "border-l-blue-500 bg-blue-500/5 border-blue-500/20 shadow-lg shadow-blue-500/5 hover:-translate-y-1" :
                                    "border-l-transparent bg-black/20 border-white/5"
                        )}>
                            <CardContent className="p-4 flex items-center gap-4">
                                {/* Icon State */}
                                <div className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    isCompleted ? "border-green-500 bg-green-500/20 text-green-500" :
                                        isCurrent ? "border-blue-500 bg-blue-500/20 text-blue-400 animate-pulse" :
                                            "border-white/10 bg-white/5 text-muted-foreground"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> :
                                        isCurrent ? <Play className="h-6 w-6 ml-1 fill-current" /> :
                                            <Lock className="h-5 w-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={isCompleted ? "secondary" : isCurrent ? "default" : "outline"} className="text-[10px] h-5 px-1.5 font-normal">
                                            {lesson.category}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500/50" /> +{lesson.xp} XP
                                        </span>
                                        {isCurrent && (
                                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-[10px] h-5 px-1.5 ml-auto md:ml-0 animate-pulse">
                                                Recomendado
                                            </Badge>
                                        )}
                                    </div>

                                    <h4 className={cn(
                                        "font-semibold text-base truncate pr-2",
                                        isCompleted ? "text-muted-foreground line-through decoration-white/20" :
                                            isCurrent ? "text-blue-100" : "text-muted-foreground"
                                    )}>
                                        {lesson.title}
                                    </h4>

                                    <p className="text-xs text-muted-foreground truncate hidden sm:block mt-0.5">
                                        {lesson.description}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                                        {lesson.duration}
                                    </span>
                                </div>

                                <ChevronRight className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                    "group-hover:translate-x-1 group-hover:text-foreground",
                                    !isAccessible && "opacity-20"
                                )} />
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}

export const TOTAL_LESSONS = LESSONS.length;
export { LESSONS };
