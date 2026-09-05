"use client";
import { useEffect, useState } from "react";

const LINES = [
    "Watch something slow tonight.",
    "Films for rainy evenings.",
    "The lake is quiet. Press play.",
];

export default function TypingHero() {
    const [text, setText] = useState("");

    useEffect(() => {
        let li = 0, ci = 0, deleting = false, timer;

        function tick() {
            const line = LINES[li];
            setText(line.slice(0, ci));

            if (!deleting && ci < line.length) {
                ci++; timer = setTimeout(tick, 42 + Math.random() * 55);
            } else if (!deleting) {
                deleting = true; timer = setTimeout(tick, 2400);
            } else if (ci > 0) {
                ci--; timer = setTimeout(tick, 18);
            } else {
                deleting = false; li = (li + 1) % LINES.length;
                timer = setTimeout(tick, 400);
            }
        }

        tick();
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="hero">
            <p className="hero-eyebrow">quiet evenings, good films</p>
            <h1 className="hero-title">
                <span>{text}</span>
                <span className="caret" />
            </h1>
            <p className="hero-sub">
                A minimal place to browse. No noise, no clutter — just the rain and the reel.
            </p>
        </section>
    );
}
