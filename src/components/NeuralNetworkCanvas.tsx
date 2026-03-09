"use client";

import { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export default function NeuralNetworkCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas to full window size initially
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const points: Point[] = [];
        const numPoints = Math.min(Math.floor((width * height) / 15000), 100); // Responsive point matching
        const connectionDistance = 150;

        let mouseX = -1000;
        let mouseY = -1000;
        const mouseRadius = 200; // Interaction radius

        // Initialize points
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5, // Slow drifting speed
                vy: (Math.random() - 0.5) * 0.5,
            });
        }

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Update positions and draw connections
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];

                // Move points
                p1.x += p1.vx;
                p1.y += p1.vy;

                // Bounce off edges smoothly
                if (p1.x < 0 || p1.x > width) p1.vx *= -1;
                if (p1.y < 0 || p1.y > height) p1.vy *= -1;

                // Calculate distance to mouse
                const dxMouse = mouseX - p1.x;
                const dyMouse = mouseY - p1.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                let pointRadius = 2.5;
                let pointAlpha = 0.3;

                // Interaction logic (Mouse Proximity)
                if (distMouse < mouseRadius) {
                    const intensity = 1 - (distMouse / mouseRadius); // 0 at max distance, 1 at center
                    pointRadius = 2.5 + (intensity * 3); // Max radius 5.5
                    pointAlpha = 0.3 + (intensity * 0.7); // Max alpha 1.0

                    // Subtle magnetic pull
                    p1.x += dxMouse * 0.005;
                    p1.y += dyMouse * 0.005;
                }

                // Draw connections
                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const baseAlpha = 1 - (dist / connectionDistance);
                        let lineAlpha = baseAlpha * 0.15; // default faint line
                        let lineWidth = 0.5;

                        // Check if BOTH points are heavily influenced by mouse to glow connection
                        const distMouseP2 = Math.sqrt(Math.pow(mouseX - p2.x, 2) + Math.pow(mouseY - p2.y, 2));
                        if (distMouse < mouseRadius && distMouseP2 < mouseRadius) {
                            const combinedIntensity = (1 - (distMouse / mouseRadius)) * (1 - (distMouseP2 / mouseRadius));
                            lineAlpha = (baseAlpha * 0.15) + (combinedIntensity * 0.5); // Boost up to 0.65
                            lineWidth = 0.5 + (combinedIntensity * 1.5);
                        }

                        // KPMG Blue: 0, 51, 141 (#00338D)
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineWidth = lineWidth;
                        ctx.strokeStyle = `rgba(0, 51, 141, ${lineAlpha})`;
                        ctx.stroke();
                    }
                }

                // Draw Dot
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, pointRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 163, 224, ${pointAlpha})`; // KPMG Light Blue
                ctx.fill();

                // Core center for hovered dots
                if (distMouse < mouseRadius) {
                    ctx.beginPath();
                    ctx.arc(p1.x, p1.y, pointRadius * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 51, 141, ${pointAlpha})`; // KPMG Dark Blue center
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                width: '100%',
                height: '100%',
                mixBlendMode: 'multiply' // Blend into light background nicely
            }}
        />
    );
}
