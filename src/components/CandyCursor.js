"use client";

import React, { useEffect, useState, useRef } from "react";

const emojis = ["🍬", "🍭", "✨", "🍫", "🍩"];

export default function CandyCursor() {
  const [particles, setParticles] = useState([]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      const now = Date.now();
      // Throttle to 1 particle every 50ms to keep performance smooth
      if (now - lastTimeRef.current < 50) return;
      lastTimeRef.current = now;

      const newParticle = {
        id: now + Math.random(),
        x: e.clientX,
        y: e.clientY,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      };
      
      setParticles((prev) => {
        // Keep only the last 20 particles for performance
        const newArr = [...prev, newParticle];
        return newArr.slice(-20);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-2xl animate-fade-out-up pointer-events-none select-none drop-shadow-md"
          style={{
            left: p.x,
            top: p.y,
            // The transform translate is handled by the keyframes
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
