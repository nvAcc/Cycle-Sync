import Layout from "@/components/layout";
import CycleCircle from "@/components/cycle-circle";
import LogModal from "@/components/log-modal";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { cyclePredictor } from "@/lib/ai/predictionModel";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function Home() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<{ nextDate: Date, confidence: number } | null>(null);

  // real time query to local DB
  const logs = useLiveQuery(() => db.periodLogs.orderBy("startDate").toArray());

  useEffect(() => {
    cyclePredictor.predictNextPeriod().then(setPrediction);
  }, [logs]);

  const daysUntil = prediction ? differenceInDays(prediction.nextDate, new Date()) : 0;

  return (
    <Layout>
      <div className="flex flex-col items-center pt-8 px-6 space-y-8">

        {/* header */}
        <div className="text-center space-y-1">
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
        <CycleCircle day={28 - daysUntil} totalDays={28} status={daysUntil > 0 ? "Follicular" : "Menstrual"} />

        {/* prediction & action */}
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          <div className="text-center space-y-1">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Next Period</p>
            <p className="text-2xl font-serif text-primary">
              {prediction ? format(prediction.nextDate, "MMM d") : "Calculating..."}
              <span className="text-sm font-sans text-muted-foreground ml-2 font-normal">
                ({daysUntil > 0 ? `in ${daysUntil} days` : "Arriving soon"})
              </span>
            </p>
          </div>

          <LogModal />
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
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    AI predictions running locally. <br />
                    {logs?.length || 0} secure entries found on this device.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </Layout>
  );
}
