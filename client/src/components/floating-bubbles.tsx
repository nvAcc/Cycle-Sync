import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const affirmations = [
    "Breathe",
    "You are enough",
    "Peace",
    "Flow",
    "Strength",
    "Radiate",
    "Calm",
    "Balance",
    "Glow",
    "Harmony",
    "Gentle",
    "Trust"
];

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function FloatingBubbles() {
    const [bubbles, setBubbles] = useState<Array<{
        id: number;
        text: string;
        x: number;
        y: number;
        size: number;
        duration: number;
        delay: number;
        moveX: number;
        moveY: number;
        targetScale: number;
    }>>([]);

    useEffect(() => {
        // Create initial set of bubbles with random properties scattered across the screen
        const newBubbles = affirmations.map((text, i) => ({
            id: i,
            text,
            x: random(0, 100),
            y: random(0, 100),
            size: random(100, 180),
            duration: random(20, 40),
            delay: random(0, 5),
            moveX: random(-300, 300), // Much larger drift
            moveY: random(-300, 300),
            targetScale: random(0.6, 1.4), // Simulate moving in/out of Z-plane
        }));
        setBubbles(newBubbles);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {bubbles.map((bubble) => (
                <motion.div
                    key={bubble.id}
                    className="absolute flex items-center justify-center rounded-full font-serif font-medium tracking-wide text-sm text-center select-none text-white/95"
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                        // 3D Bubble Effect
                        background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0.05) 100%)",
                        boxShadow: "inset -10px -10px 20px rgba(0,0,0,0.02), inset 10px 10px 20px rgba(255,255,255,0.2), 0px 5px 15px rgba(0,0,0,0.05)",
                        backdropFilter: "blur(2px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        textShadow: "0px 1px 2px rgba(0,0,0,0.1)"
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        x: [0, bubble.moveX],
                        y: [0, bubble.moveY],
                        opacity: [0, 0.8, 0.6, 0.8],
                        scale: [0.8, bubble.targetScale], // Breathe in/out significantly
                    }}
                    transition={{
                        duration: bubble.duration,
                        repeat: Infinity,
                        repeatType: "mirror", // Go back and forth to drift smoothly
                        ease: "easeInOut",
                        delay: bubble.delay,
                        opacity: { duration: 5, repeat: Infinity, repeatType: "mirror" },
                        scale: { duration: bubble.duration * 0.8, repeat: Infinity, repeatType: "mirror" }
                    }}
                >
                    {bubble.text}
                </motion.div>
            ))}
        </div>
    );
}
