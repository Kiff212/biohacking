import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Markdown } from "./Markdown";

interface SwipeDeckProps {
    title: string;
    cards: { heading: string; body: string }[];
    onIndexChange: (index: number) => void;
    currentIndex: number;
}

export function SwipeDeck({ title, cards, onIndexChange, currentIndex }: SwipeDeckProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    const i = currentIndex;
    const total = cards.length;
    const canPrev = i > 0;
    const canNext = i < total - 1;

    const goNext = () => {
        if (canNext) onIndexChange(i + 1);
    };

    const goPrev = () => {
        if (canPrev) onIndexChange(i - 1);
    };

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        let startX = 0;
        let startY = 0;
        let dragging = false;

        const onPointerDown = (e: PointerEvent) => {
            // Only allow drag on the card area, arguably better UX if whole container works but let's stick to root
            // We might want to prevent text selection while dragging
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // avoid swipe when user is scrolling vertically
            if (Math.abs(dy) > Math.abs(dx)) return;

            const threshold = 60;
            if (dx < -threshold && canNext) goNext();
            if (dx > threshold && canPrev) goPrev();
        };

        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointerup", onPointerUp);
        el.addEventListener("pointerleave", () => { dragging = false }); // Good practice

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointerup", onPointerUp);
            el.removeEventListener("pointerleave", () => { dragging = false });
        };
    }, [canNext, canPrev, i, onIndexChange]); // Dependencies for closure freshness

    const current = cards[i];

    if (!current) return null;

    return (
        <div ref={rootRef} className="grid gap-6 touch-pan-y">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white">{title}</h1>
                    <p className="mt-1 text-xs text-white/60 uppercase tracking-widest">
                        Card {i + 1} de {total}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={!canPrev} onClick={goPrev}>
                        Anterior
                    </Button>
                    <Button variant="default" size="sm" disabled={!canNext} onClick={goNext} className="bg-blue-600 hover:bg-blue-500 text-white">
                        Próximo
                    </Button>
                </div>
            </div>

            <div className="relative min-h-[400px] perspective-1000">
                {/* Animated transition: Slide In + Fade In */}
                <Card
                    key={currentIndex} // Key change forces re-render for animation
                    className="bg-white/10 border-white/20 backdrop-blur-2xl p-8 shadow-2xl rounded-3xl animate-in fade-in slide-in-from-right-8 duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                    <div className="grid gap-6">
                        <div className="text-xl font-bold text-white tracking-tight border-b border-white/10 pb-4">{current.heading}</div>

                        <div className="text-white/90 leading-relaxed font-light">
                            <Markdown content={current.body} />
                        </div>
                    </div>
                </Card>

                <div className="mt-8 text-center text-xs text-white/20 uppercase tracking-widest font-medium">
                    Deslize para navegar
                </div>
            </div>
        </div>
    );
}
