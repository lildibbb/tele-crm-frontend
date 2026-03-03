"use client";

import React, { useEffect, useRef } from "react";
import NextImage from "next/image";
import {
  ArrowCounterClockwise,
  SpinnerGap,
  CaretDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomisePanelTrigger } from "@/components/dashboard/CustomisePanel";

// ── Types ──────────────────────────────────────────────────────
export const PERIODS = [
  "yesterday",
  "today",
  "this_week",
  "this_month",
  "last_30_days",
  "last_90_days",
  "all_time",
] as const;

export type PeriodValue = (typeof PERIODS)[number];

interface HeroBannerProps {
  period: PeriodValue;
  onPeriodChange: (period: PeriodValue) => void;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: Date;
  periodLabel: (v: PeriodValue) => string;
  t: (key: string) => string;
}

// ── Component ──────────────────────────────────────────────────
export const HeroBanner = React.memo(function HeroBanner({
  period,
  onPeriodChange,
  onRefresh,
  refreshing,
  lastRefresh,
  periodLabel,
  t,
}: HeroBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafId = useRef<number>(0);

  // Parallax on hero video — rAF-guarded for performance
  useEffect(() => {
    const main = document.getElementById("dashboard-main");
    if (!main || !videoRef.current) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId.current = requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.style.transform = `translateY(${main.scrollTop * 0.28}px)`;
        }
        ticking = false;
      });
    };

    main.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      main.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden mb-7 rounded-2xl md:mt-2"
      style={{ height: 264 }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full object-cover will-change-transform"
        poster="/assets/bg/dashboard-night.jpeg"
        style={{ height: "130%", top: "-15%", left: 0, right: 0 }}
      >
        <source src="/assets/bg/dashboard-loop.mp4" type="video/mp4" />
        <NextImage
          src="/assets/bg/dashboard-night.jpeg"
          width={1920}
          height={1080}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </video>

      {/* Always-dark cinematic overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, rgba(4,4,12,0.65) 0%, rgba(8,8,20,0.50) 45%, var(--void) 100%)",
        }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
          opacity: 0.035,
        }}
      />

      {/* Hero content */}
      <div className="hero-content absolute inset-0 z-10 flex flex-col justify-end px-5 pb-5 md:px-7 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest bg-white/10 text-white/80 backdrop-blur-sm border border-white/10">
                <span className="live-dot !w-1.5 !h-1.5" />
                LIVE DATA
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-[30px] text-white tracking-tight leading-tight drop-shadow-lg">
              {t("nav.commandCenter")}
            </h1>
            <p className="text-white/50 text-sm font-sans mt-1.5">
              {t("dashboard.subtitle")} —{" "}
              {lastRefresh.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border-transparent text-white/80 hover:bg-white/20 hover:text-white/90 disabled:cursor-not-allowed h-[30px] px-3 text-xs font-medium"
            >
              {refreshing ? (
                <SpinnerGap size={13} weight="bold" className="animate-spin" />
              ) : (
                <ArrowCounterClockwise size={13} weight="bold" />
              )}
              {refreshing ? t("common.loading") : t("dashboard.refresh")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border-transparent text-white/80 hover:bg-white/20 hover:text-white/90 h-[30px] px-3 text-xs font-medium"
                >
                  {periodLabel(period)}
                  <CaretDown size={11} weight="bold" className="opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="min-w-[140px] border-transparent"
              >
                {PERIODS.map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity ${
                        period === p ? "bg-crimson opacity-100" : "opacity-0"
                      }`}
                    />
                    {periodLabel(p)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <CustomisePanelTrigger />
          </div>
        </div>
      </div>
    </div>
  );
});
