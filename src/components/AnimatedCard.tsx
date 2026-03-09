"use client";

import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}

export default function AnimatedCard({ children, className = "", glowColor = "rgba(0,163,224, 0.08)" }: AnimatedCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            ref={cardRef}
            className={`relative group interactive rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${glowColor},
              transparent 80%
            )
          `,
                }}
            />

            {/* 3D Content Wrapper for subtle tilt - optional upgrade, keeping it flat for now, just glowing cursor effect */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
