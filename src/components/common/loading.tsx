import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "default" | "overlay" | "button" | "page";
  className?: string;
  text?: string;
}

export function Loading({ variant = "default", className, text }: LoadingProps) {
  const variants = {
    default: (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2 className="w-6 h-6 text-white animate-spin" />
        {text && <span className="ml-2 text-white/80">{text}</span>}
      </div>
    ),
    overlay: (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#23124d] p-4 rounded-lg shadow-xl">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          {text && <span className="mt-2 text-white/80 text-sm">{text}</span>}
        </div>
      </div>
    ),
    button: (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        {text && <span>{text}</span>}
      </div>
    ),
    page: (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0850] via-[#2a0c73] to-[#1e1a4b] flex items-center justify-center">
        <div className="bg-[#23124d] p-8 rounded-2xl shadow-xl">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          {text && <span className="mt-4 text-white/80 text-sm">{text}</span>}
        </div>
      </div>
    ),
  };

  return variants[variant];
} 