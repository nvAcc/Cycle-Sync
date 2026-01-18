import Layout from "@/components/layout";
import CycleCircle from "@/components/cycle-circle";
import LogModal from "@/components/log-modal";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Info, CalendarClock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cyclePredictor } from "@/lib/ai/predictionModel";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import CycleHistoryChart from "@/components/dashboard/CycleHistoryChart";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [prediction, setPrediction] = useState<{ nextDate: Date, confidence: number, source: 'ai' | 'statistical' } | null>(null);

  // real time query to local DB
  const logs = useLiveQuery(() => db.periodLogs.orderBy("startDate").toArray());

  useEffect(() => {
    cyclePredictor.predictNextPeriod().then(setPrediction);
  }, [logs]);

  // Calculate real cycle day based on last period
  const lastLog = logs && logs.length > 0 ? logs[logs.length - 1] : null;
  const currentCycleDay = lastLog
    ? differenceInDays(new Date(), new Date(lastLog.startDate)) + 1
    : 1;

  // Ensure day is positive (if future date logged, fallback to 1)
  const displayDay = currentCycleDay > 0 ? currentCycleDay : 1;

  const daysUntil = prediction ? differenceInDays(prediction.nextDate, new Date()) : 0;

  return (
    <Layout>
      <div className="flex flex-col items-center pt-8 px-6 space-y-8">

        {/* header */}
        <div className="text-center space-y-1 relative w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 text-muted-foreground hover:text-primary"
            onClick={() => setLocation("/history")}
          >
            <CalendarClock className="w-5 h-5" />
          </Button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif text-foreground"
          >
            Hello, {user?.username || "Sarah"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm"
          >
            {format(new Date(), "EEEE, MMMM do")}
          </motion.p>
        </div>

        {/* cycle visual */}
        <CycleCircle day={displayDay} totalDays={28} status={displayDay < 14 ? "Follicular" : "Luteal"} />

        {/* prediction & action */}
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          <div className="text-center space-y-1">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Next Period</p>
            <p className="text-2xl font-serif text-primary flex items-center justify-center gap-2">
              {prediction && !isNaN(prediction.nextDate.getTime()) ? format(prediction.nextDate, "MMM d") : "Calculating..."}
              {prediction?.source === 'ai' && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-sans tracking-wide">
                  ✨ AI
                </span>
              )}
            </p>
            <p className="text-sm font-sans text-muted-foreground font-normal">
              {daysUntil > 0 ? `in ${daysUntil} days` : "Arriving soon"}
            </p>
            {/* Clean UI - No Debug Info */}
          </div>

          <LogModal />
        </div>

        {/* Cycle History Graph */}
        <div className="w-full max-w-md space-y-4">
          <CycleHistoryChart logs={logs} />
        </div>

        {/* AI Insights / cards */}
        <div className="w-full max-w-md space-y-4 pb-8">
          <h2 className="text-lg font-serif font-medium px-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
            Today's Insights
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/50 backdrop-blur-sm border-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="bg-secondary/20 p-2.5 rounded-full text-secondary-foreground">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Phase Predicted</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Based on your local data, you are likely in your {daysUntil > 14 ? "Follicular" : "Luteal"} phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/50 backdrop-blur-sm border-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="bg-accent/20 p-2.5 rounded-full text-accent-foreground">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Privacy Active</h3>
                  <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    AI predictions running locally. <br />
                    {logs?.length || 0} secure entries found.

                    {/* Debugging Tools Removed */}
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </Layout >
  );
}
