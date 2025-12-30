import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CycleCircleProps {
  day: number;
  totalDays: number;
  status: string; // "Period", "Follicular", "Ovulation", "Luteal"
  className?: string;
}

export default function CycleCircle({ day, totalDays, status, className }: CycleCircleProps) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = day / totalDays;
  const dashoffset = circumference - progress * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} data-testid="cycle-circle">
      {/* outer glow */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90 animate-pulse" />

      <svg
        className="transform -rotate-90 w-72 h-72"
        viewBox="0 0 280 280"
      >
        {/* track */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          fill="transparent"
          className="opacity-30"
        />
        
        {/* progress */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="140"
          cy="140"
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className="drop-shadow-lg"
        />

      </svg>

      <div className="absolute flex flex-col items-center text-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-1 block">
            Day
          </span>
          <span className="text-7xl font-serif text-foreground font-medium">
            {day}
          </span>
          <span className="text-muted-foreground text-sm font-medium mt-2 block">
             of {totalDays} day cycle
          </span>
          <div className="mt-4 px-4 py-1.5 bg-primary/10 text-primary-foreground rounded-full text-sm font-semibold inline-block">
            {status} Phase
          </div>
        </motion.div>
      </div>
    </div>
  );
}
