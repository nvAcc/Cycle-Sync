import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInDays, addDays } from "date-fns";
import { FileText, Download, Share2, Printer, Activity, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function DoctorReportPage() {
  const logs = useLiveQuery(() => db.periodLogs.orderBy("startDate").reverse().toArray());

  const calculateStats = () => {
    if (!logs || logs.length === 0) {
      return {
        avgCycleLength: 28,
        avgPeriodLength: 5,
        lastPeriod: new Date(),
        nextPredicted: addDays(new Date(), 28)
      };
    }

    const sortedLogs = [...logs].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const periods: Date[][] = [];
    let currentPeriod: Date[] = [];

    for (let i = 0; i < sortedLogs.length; i++) {
      const date = new Date(sortedLogs[i].startDate);
      if (currentPeriod.length === 0) {
        currentPeriod.push(date);
      } else {
        const lastDate = currentPeriod[currentPeriod.length - 1];
        const diff = differenceInDays(date, lastDate);
        if (diff <= 2) {
          currentPeriod.push(date);
        } else {
          periods.push(currentPeriod);
          currentPeriod = [date];
        }
      }
    }
    if (currentPeriod.length > 0) periods.push(currentPeriod);

    let totalCycleDays = 0;
    let cycleCount = 0;
    for (let i = 0; i < periods.length - 1; i++) {
      const startCurrent = periods[i][0];
      const startNext = periods[i + 1][0];
      totalCycleDays += differenceInDays(startNext, startCurrent);
      cycleCount++;
    }
    const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : 28;

    let totalPeriodDays = 0;
    periods.forEach(p => {
      if (p.length > 0) {
        const start = p[0];
        const end = p[p.length - 1];
        totalPeriodDays += (differenceInDays(end, start) + 1);
      }
    });
    const avgPeriodLength = periods.length > 0 ? Math.round(totalPeriodDays / periods.length) : 5;

    const lastPeriod = periods.length > 0 ? periods[periods.length - 1][0] : new Date();
    const nextPredicted = addDays(lastPeriod, avgCycleLength);

    return { avgCycleLength, avgPeriodLength, lastPeriod, nextPredicted };
  };

  const { avgCycleLength, avgPeriodLength, lastPeriod, nextPredicted } = calculateStats();

  return (
    <Layout>
      <div className="flex flex-col pt-8 px-6 space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-serif text-foreground">Medical Report</h1>
            <p className="text-muted-foreground text-sm">Summary for your healthcare provider.</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full ml-auto">
            <Printer className="w-4 h-4" />
          </Button>
        </div>

        {/* summary card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Cycle Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Cycle</p>
              <p className="text-2xl font-serif">{avgCycleLength} Days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Period</p>
              <p className="text-2xl font-serif">{avgPeriodLength} Days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Period</p>
              <p className="text-lg font-medium">{format(lastPeriod, "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Predicted</p>
              <p className="text-lg font-medium">{format(nextPredicted, "MMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        {/* symptom log */}
        <div className="space-y-3">
          <h2 className="text-lg font-serif font-medium">Recent Symptoms Log</h2>
          <div className="space-y-2">
            {logs && logs.slice(0, 10).map((log, index) => (
              <Card key={index} className="border-border/50 shadow-sm bg-white/60">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{format(new Date(log.startDate), "MMM d, yyyy")}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Flow: {log.flowIntensity || "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                    {log.symptoms.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!logs || logs.length === 0 && (
              <div className="text-center p-4 text-muted-foreground text-sm">No recent logs found.</div>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button className="w-full h-12 rounded-xl" variant="outline">
            <Download className="w-4 h-4 mr-2" /> PDF Export
          </Button>
          <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Share2 className="w-4 h-4 mr-2" /> Share Securely
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
          This report is generated from on-device data. No personal health information is stored on external servers.
        </p>
      </div>
    </Layout>
  );
}