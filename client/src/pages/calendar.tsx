import Layout from "@/components/layout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { addDays, subDays } from "date-fns";
import { FloatingBubbles } from "@/components/floating-bubbles";
import { Switch } from "@/components/ui/switch";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const periodDays = [
    subDays(new Date(), 2),
    subDays(new Date(), 3),
    subDays(new Date(), 4),
    subDays(new Date(), 5),
    subDays(new Date(), 28),
    subDays(new Date(), 29),
    subDays(new Date(), 30),
  ];

  const fertileDays = [
    addDays(new Date(), 5),
    addDays(new Date(), 6),
    addDays(new Date(), 7),
    addDays(new Date(), 8),
    addDays(new Date(), 9),
  ];

  const predictedDays = [
    addDays(new Date(), 22),
    addDays(new Date(), 23),
    addDays(new Date(), 24),
  ];

  const [showBubbles, setShowBubbles] = useState(true);

  return (
    <Layout>
      {showBubbles && <FloatingBubbles />}

      <div className="flex flex-col pt-6 px-4 space-y-6 min-h-screen max-w-lg mx-auto w-full pb-24 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-serif text-foreground">Cycle Log</h1>
            <p className="text-muted-foreground text-sm">View your history and predictions.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-full border border-border/20">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Vibes</span>
            <Switch
              checked={showBubbles}
              onCheckedChange={setShowBubbles}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-border/50 p-6 flex justify-center transition-all duration-300">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            style={{
              // @ts-ignore - Custom CSS variable for sizing
              "--cell-size": "3.2rem",
              "--font-size": "1.1rem"
            }}
            modifiers={{
              period: periodDays,
              fertile: fertileDays,
              predicted: predictedDays,
            }}
            modifiersStyles={{
              period: {
                backgroundColor: "hsl(var(--primary))",
                color: "white",
                borderRadius: "100%"
              },
              fertile: {
                backgroundColor: "hsl(var(--secondary))",
                color: "white",
                borderRadius: "100%"
              },
              predicted: {
                border: "2px dashed hsl(var(--primary))",
                borderRadius: "100%"
              }
            }}
          />
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
          <h2 className="text-sm font-serif font-medium mb-3 text-foreground/80">Legend</h2>
          <div className="flex flex-wrap gap-4 justify-start">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
              <span className="text-xs text-muted-foreground font-medium">Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary shadow-sm" />
              <span className="text-xs text-muted-foreground font-medium">Fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-primary border-dashed" />
              <span className="text-xs text-muted-foreground font-medium">Predicted</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
