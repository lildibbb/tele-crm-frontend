"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
}: BackgroundGradientAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(undefined);
  const positionRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });

  const animate = useCallback(() => {
    if (!interactiveRef.current) return;

    const { curX, curY, tgX, tgY } = positionRef.current;
    positionRef.current.curX = curX + (tgX - curX) / 20;
    positionRef.current.curY = curY + (tgY - curY) / 20;

    interactiveRef.current.style.transform = `translate(${Math.round(positionRef.current.curX)}px, ${Math.round(positionRef.current.curY)}px)`;

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (interactive) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [interactive, animate]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current.tgX = event.clientX - rect.left;
        positionRef.current.tgY = event.clientY - rect.top;
      }
    },
    [],
  );

  const gradientStyle = {
    width: size,
    height: size,
    mixBlendMode: blendingValue as React.CSSProperties["mixBlendMode"],
  };

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{
        background: `linear-gradient(40deg, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
      }}
      onMouseMove={interactive ? handleMouseMove : undefined}
    >
      {/* SVG filter for goo effect */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="goo-filter">
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation="10"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              result="goo"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Gradient blobs container */}
      <div className="absolute inset-0 blur-lg [filter:url(#goo-filter)_blur(40px)]">
        {/* First blob */}
        <motion.div
          className="absolute rounded-full"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgb(${firstColor}) 0%, rgb(${firstColor}) 50%, transparent 50%)`,
            top: `calc(50% - ${size} / 2)`,
            left: `calc(50% - ${size} / 2)`,
            transformOrigin: "center center",
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Second blob */}
        <motion.div
          className="absolute rounded-full opacity-80"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${secondColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${size} / 2)`,
            left: `calc(50% - ${size} / 2)`,
            transformOrigin: "calc(50% - 400px) center",
          }}
          animate={{
            rotate: [0, -360],
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
          }}
          transition={{
            rotate: {
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            x: {
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            y: {
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Third blob */}
        <motion.div
          className="absolute rounded-full opacity-80"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${thirdColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${size} / 2)`,
            left: `calc(50% - ${size} / 2)`,
            transformOrigin: "calc(50% + 400px) center",
          }}
          animate={{
            rotate: [0, 360],
            x: [0, -120, 80, 0],
            y: [0, 100, -40, 0],
          }}
          transition={{
            rotate: {
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            x: {
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            y: {
              duration: 16,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Fourth blob */}
        <motion.div
          className="absolute rounded-full opacity-70"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${fourthColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${size} / 2)`,
            left: `calc(50% - ${size} / 2)`,
            transformOrigin: "calc(50% - 200px) center",
          }}
          animate={{
            rotate: [0, -360],
            x: [0, 60, -100, 0],
            y: [0, -60, 80, 0],
          }}
          transition={{
            rotate: {
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            x: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            y: {
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Fifth blob */}
        <motion.div
          className="absolute rounded-full opacity-80"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${fifthColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${size} / 2)`,
            left: `calc(50% - ${size} / 2)`,
            transformOrigin: "calc(50% - 800px) calc(50% + 800px)",
          }}
          animate={{
            rotate: [0, 360],
            x: [0, -80, 120, 0],
            y: [0, 120, -60, 0],
          }}
          transition={{
            rotate: {
              duration: 22,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            x: {
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            y: {
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Interactive pointer gradient */}
        {interactive && (
          <div
            ref={interactiveRef}
            className="absolute w-full h-full -top-1/2 -left-1/2 opacity-70"
            style={{
              background: `radial-gradient(circle at center, rgba(${pointerColor}, 0.8) 0%, transparent 50%)`,
              mixBlendMode:
                blendingValue as React.CSSProperties["mixBlendMode"],
            }}
          />
        )}
      </div>

      {/* Content layer */}
      {children && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
};

export default function BackgroundGradientAnimationDemo() {
  return <BackgroundGradientAnimation />;
}

// BackgroundGradientAnimationProps is already exported as an interface above
