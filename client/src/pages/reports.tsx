import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInDays, addDays, subDays, isAfter } from "date-fns";
import { FileText, Download, Printer, Activity, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    const logs = useLiveQuery(() => db.periodLogs.orderBy("startDate").reverse().toArray());

    const calculateStats = () => {
        if (!logs || logs.length === 0) {
            return {
                avgCycleLength: 28,
                avgPeriodLength: 5,
                lastPeriod: new Date(),
                nextPredicted: addDays(new Date(), 28),
                regularity: "Unknown",
                symptomFrequency: [] as { name: string; count: number }[],
                alerts: [] as string[]
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
        const cycleLengths: number[] = [];

        for (let i = 0; i < periods.length - 1; i++) {
            const startCurrent = periods[i][0];
            const startNext = periods[i + 1][0];
            const length = differenceInDays(startNext, startCurrent);
            cycleLengths.push(length);
            totalCycleDays += length;
            cycleCount++;
        }
        const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : 28;

        //regularity check (> 7 days variance)
        let regularity = "Regular";
        if (cycleLengths.length >= 2) {
            const variance = Math.max(...cycleLengths) - Math.min(...cycleLengths);
            if (variance > 7) regularity = "Irregular";
        } else {
            regularity = "Insufficient Data";
        }

        // period length
        let totalPeriodDays = 0;
        periods.forEach(p => {
            if (p.length > 0) {
                const start = p[0];
                const end = p[p.length - 1];
                totalPeriodDays += (differenceInDays(end, start) + 1);
            }
        });
        const avgPeriodLength = periods.length > 0 ? Math.round(totalPeriodDays / periods.length) : 5;

        // predictions
        const lastPeriod = periods.length > 0 ? periods[periods.length - 1][0] : new Date();
        const nextPredicted = addDays(lastPeriod, avgCycleLength);

        // symptom frequency (last 90 days)
        const ninetyDaysAgo = subDays(new Date(), 90);
        const symptomMap: Record<string, number> = {};

        logs.forEach(log => {
            if (isAfter(new Date(log.startDate), ninetyDaysAgo)) {
                log.symptoms.forEach(s => {
                    symptomMap[s] = (symptomMap[s] || 0) + 1;
                });
            }
        });

        const symptomFrequency = Object.entries(symptomMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        //medical alerts
        const alerts: string[] = [];
        if (avgCycleLength < 21) alerts.push("Short Cycle (Polymenorrhea) detected.");
        if (avgCycleLength > 35) alerts.push("Long Cycle (Oligomenorrhea) detected.");
        if (alerts.length === 0) alerts.push("Cycle length within normal range.");

        return { avgCycleLength, avgPeriodLength, lastPeriod, nextPredicted, regularity, symptomFrequency, alerts };
    };

    const { avgCycleLength, lastPeriod, regularity, symptomFrequency, alerts } = calculateStats();

    return (
        <Layout>
            <div className="flex flex-col pt-8 px-6 space-y-6 pb-20 bg-background min-h-screen">
                <div className="flex items-center gap-3 print:hidden">
                    <Link href="/profile">
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <ArrowLeft className="w-5 h-5 text-foreground" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-serif text-foreground">Clinical Reports</h1>
                        <p className="text-muted-foreground text-sm">Summary for your healthcare provider.</p>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="hidden print:block mb-2">
                        <h1 className="text-3xl font-serif text-black mb-2">Cycle-Sync Clinical Report</h1>
                        <p className="text-sm text-[#6b7280]">Generated on {format(new Date(), "PPpp")}</p>
                    </div>
                </div>

                <Card className="border-border shadow-sm print:shadow-none print:border-black">
                    <CardHeader className="bg-primary/5 border-b border-border/40 pb-4 print:bg-transparent print:border-black">
                        <CardTitle className="text-lg font-medium flex items-center gap-2 print:text-black">
                            <Activity className="w-4 h-4 text-primary print:text-black" />
                            Patient Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-[#4b5563]">Avg Length</p>
                            <p className="text-2xl font-serif print:text-black">{avgCycleLength} Days</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-[#4b5563]">Status</p>
                            <p className={cn("text-2xl font-serif", regularity === "Irregular" ? "text-destructive print:text-black print:font-bold" : "text-foreground print:text-black")}>
                                {regularity}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider print:text-[#4b5563]">Last Period</p>
                            <p className="text-lg font-medium print:text-black">{format(lastPeriod, "MMM d, yyyy")}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm print:shadow-none print:border-black">
                    <CardHeader className="pb-2 print:border-b print:border-black">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 print:text-black">
                            <Activity className="w-4 h-4" />
                            Medical Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground print:text-black">
                            {alerts.map(alert => <li key={alert}>{alert}</li>)}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm print:shadow-none print:border-black">
                    <CardHeader className="pb-3 print:border-b print:border-black">
                        <CardTitle className="text-base font-serif print:text-black">Symptom Summary (Last 90 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ul className="space-y-2">
                            {symptomFrequency.slice(0, 5).map(s => (
                                <li key={s.name} className="flex justify-between text-sm print:text-black">
                                    <span className="capitalize">{s.name.replace('_', ' ')}</span>
                                    <span className="font-mono text-muted-foreground print:text-black">{s.count} occurrences</span>
                                </li>
                            ))}
                            {symptomFrequency.length === 0 && <p className="text-sm text-muted-foreground">No symptoms recorded in the last 3 months.</p>}
                        </ul>
                    </CardContent>
                </Card>

                <div className="pt-4 print:hidden no-print">
                    <Button className="w-full h-12 rounded-xl" variant="outline" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" /> Print / Save PDF
                    </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed print:text-black print:mt-8">
                    This report is generated from on-device data. No personal health information is stored on external servers.
                </p>
            </div>
        </Layout>
    );
}
