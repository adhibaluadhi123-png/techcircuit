"use client";

import React, { useEffect, useState } from "react";

interface TypewriterProps {
  lines: string[];
  speed?: number;
  pause?: number;
  className?: string;
  cursorClassName?: string;
  loop?: boolean;
}

export function Typewriter({
  lines,
  speed = 48,
  pause = 1400,
  className = "",
  cursorClassName = "text-[#FF8A3D]",
  loop = true,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blinking, setBlinking] = useState(true);

  useEffect(() => {
    const currentLine = lines[lineIdx];

    if (!deleting && charIdx < currentLine.length) {
      const t = setTimeout(() => {
        setDisplayed(currentLine.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    }

    if (!deleting && charIdx === currentLine.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }

    if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setDisplayed(currentLine.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, speed * 0.5);
      return () => clearTimeout(t);
    }

    if (deleting && charIdx === 0) {
      const t = setTimeout(() => {
        setDeleting(false);
        if (loop || lineIdx < lines.length - 1) {
          setLineIdx((l) => (l + 1) % lines.length);
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [charIdx, deleting, lineIdx, lines, loop, pause, speed]);

  useEffect(() => {
    const interval = setInterval(() => setBlinking((b) => !b), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayed}</span>
      <span
        className={`ml-0.5 font-mono font-light select-none transition-opacity duration-100 ${
          blinking ? "opacity-100" : "opacity-0"
        } ${cursorClassName}`}
        aria-hidden="true"
      >
        |
      </span>
    </span>
  );
}
