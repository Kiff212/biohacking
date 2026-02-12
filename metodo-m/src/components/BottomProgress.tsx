export function BottomProgress({
    lessonPct,
    cardPct,
    label,
}: {
    lessonPct: number; // 0-100 (total course progress)
    cardPct: number;   // 0-100 (progress within lesson)
    label: string;
}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-md">
            <div className="mx-auto max-w-5xl px-5 py-3">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="text-xs font-medium text-white/80">{label}</div>
                    <div className="text-xs text-white/60">Curso: {lessonPct}%</div>
                </div>

                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out"
                        style={{ width: `${cardPct}%` }}
                    />
                </div>

                {/* <div className="mt-1 text-[10px] text-white/40 text-right">
          {cardPct}% da aula
        </div> */}
            </div>
        </div>
    );
}
