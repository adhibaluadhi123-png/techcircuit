"use client";

import React from "react";
import { motion, Transition } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
}

export function BlurText({
  text,
  delay = 50,
  className = "",
  animateBy = "words",
  direction = "bottom",
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  const defaultTransition: Transition = {
    duration: 0.6,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: "blur(8px)",
            y: direction === "top" ? -14 : 14,
          }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
          }}
          transition={{
            ...defaultTransition,
            delay: (index * delay) / 1000,
          }}
          className="inline-block will-change-[transform,filter,opacity]"
        >
          {segment}
        </motion.span>
      ))}
    </span>
  );
}
