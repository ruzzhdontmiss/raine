"use client";
import { useEffect, useRef } from "react";

export default function RainCanvas() {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d");
        let drops = [];
        let raf;

        function resize() {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            drops = Array.from({ length: 90 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                len: 10 + Math.random() * 18,
                speed: 3 + Math.random() * 5,
            }));
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(220, 235, 245, 0.6)";
            ctx.lineWidth = 1;
            for (const d of drops) {
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + 1.5, d.y + d.len);
                ctx.stroke();
                d.y += d.speed;
                if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
            }
            raf = requestAnimationFrame(loop);
        }

        resize();
        loop();
        addEventListener("resize", resize);

        return () => {                    // React cleanup — no leaks
            cancelAnimationFrame(raf);
            removeEventListener("resize", resize);
        };
    }, []);

    return <canvas id="rain" ref={ref} />;
}
