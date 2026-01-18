import { PeriodLog } from "@/lib/db";
import { format, differenceInDays } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function CycleHistoryChart({ logs }: { logs?: PeriodLog[] }) {
    // Transformation Logic



    // Transformation Logic
    const sortedLogs = logs?.slice().sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) || [];

    const data = sortedLogs
        .map((log, index) => {
            if (index === sortedLogs.length - 1) return null; // Can't calculate for the last one
            const nextLog = sortedLogs[index + 1];

            const currentStart = new Date(log.startDate);
            const nextStart = new Date(nextLog.startDate);
            const length = differenceInDays(nextStart, currentStart);

            return {
                date: format(currentStart, "MMM dd"),
                length,
            };
        })
        .filter((item): item is { date: string; length: number } => item !== null);

    // Empty State
    if (!data || data.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Cycle Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex flex-col items-center justify-center text-center p-4 border rounded-lg border-dashed text-muted-foreground bg-muted/20">
                        <p>Not enough data yet.</p>
                        <p className="text-sm mt-1">Found {logs?.length || 0} period logs.</p>
                        <p className="text-xs text-muted-foreground mt-1">Log at least 2 separate periods (e.g., Jan & Feb) to see trends.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Cycle Trends
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                stroke="#888888"
                                fontSize={12}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                hide={false}
                                tickLine={false}
                                axisLine={false}
                                stroke="#888888"
                                fontSize={12}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                itemStyle={{ color: "#E91E63", fontWeight: "bold" }}
                                cursor={{ stroke: "#E91E63", strokeWidth: 1, strokeDasharray: "4 4" }}
                            />
                            <ReferenceLine y={28} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "28 Days", position: "right", fill: "#22c55e", fontSize: 10 }} />
                            <Line
                                type="monotone"
                                dataKey="length"
                                stroke="#E91E63"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
