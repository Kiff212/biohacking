import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDashed, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Lesson {
    slug: string;
    title: string;
    description: string;
}

interface LessonListProps {
    completedLessons: string[];
}

const LESSONS: Lesson[] = [
    { slug: '01-introducao', title: '01. Introdução ao Método M', description: 'Entenda a filosofia e os objetivos.' },
    { slug: '02-fome-saciedade', title: '02. Fome e Saciedade', description: 'Reprograme seus hormônios.' },
    { slug: '03-rotina-minima', title: '03. Rotina Mínima Viável', description: 'O mínimo efetivo para resultados.' },
    { slug: '04-sono-luz', title: '04. Sono e Luz', description: 'Biohacking circadiano avançado.' },
    { slug: '05-performance', title: '05. Performance Máxima', description: 'Otimização cognitiva e física.' },
];

export function LessonList({ completedLessons }: LessonListProps) {
    return (
        <div className="grid gap-3">
            {LESSONS.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.slug);
                return (
                    <Link
                        key={lesson.slug}
                        to={`/aula/${lesson.slug}`}
                        className={cn(
                            "group relative overflow-hidden rounded-lg border p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg",
                            isCompleted
                                ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/30"
                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                                    isCompleted
                                        ? "border-green-500 bg-green-500/20 text-green-500"
                                        : "border-white/10 bg-white/5 text-muted-foreground group-hover:border-white/30 group-hover:text-white"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h4 className={cn(
                                        "font-semibold transition-colors",
                                        isCompleted ? "text-green-100" : "text-foreground group-hover:text-blue-200"
                                    )}>
                                        {lesson.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground hidden sm:block">
                                        {lesson.description}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className={cn(
                                "h-5 w-5 transition-all text-muted-foreground",
                                "group-hover:translate-x-1 group-hover:text-foreground"
                            )} />
                        </div>

                        {/* Progress Line */}
                        {isCompleted && (
                            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-green-500/50"></div>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

export const TOTAL_LESSONS = LESSONS.length;
export { LESSONS };
