import React from "react";
import { Activity, Radio, Sparkles } from "lucide-react";

interface HirePulseLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showSubtitle?: boolean;
  className?: string;
}

export const HirePulseLogo: React.FC<HirePulseLogoProps> = ({
  size = "md",
  variant = "light",
  showSubtitle = true,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const containerSizes = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl sm:text-3xl",
  };

  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem Badge with Pulse Wave Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${containerSizes[size]} bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300`}>
        {/* Glowing pulse ring */}
        <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 opacity-30 blur-xs group-hover:opacity-70 transition-opacity" />
        
        {/* Pulse & Target Fusion Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Activity className={`${iconSizes[size]} stroke-[2.5]`} />
        </div>

        {/* Live Status Pulse Dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${titleSizes[size]} ${isDark ? "text-white" : "text-slate-900"} flex items-center gap-1`}>
          <span>Hire</span>
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
            Pulse
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5 animate-pulse" />
        </div>
        {showSubtitle && (
          <p className={`text-[10px] font-semibold tracking-wider uppercase ${isDark ? "text-slate-400" : "text-slate-500"} mt-0.5`}>
            Recruitment Platform
          </p>
        )}
      </div>
    </div>
  );
};
