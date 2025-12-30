import Layout from "@/components/layout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { addDays, subDays } from "date-fns";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  //mock marked dates
  const periodDays = [
    subDays(new Date(), 2),
    subDays(new Date(), 3),
    subDays(new Date(), 4),
    subDays(new Date(), 5),
    subDays(new Date(), 28),
    subDays(new Date(), 29),
    subDays(new Date(), 30),
  ];

  return (
    <Layout>
      <div className="flex flex-col pt-8 px-6 space-y-8 min-h-screen">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-foreground">Cycle Log</h1>
          <p className="text-muted-foreground text-sm">View your history and predictions.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-4">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md mx-auto"
            modifiers={{
              period: periodDays,
            }}
            modifiersStyles={{
              period: {
                backgroundColor: "hsl(var(--primary))",
                color: "white",
                borderRadius: "100%"
              }
            }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-serif font-medium">Legend</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">Fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-primary border-dashed" />
              <span className="text-sm text-muted-foreground">Predicted</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
