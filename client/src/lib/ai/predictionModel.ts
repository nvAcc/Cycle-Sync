import { db } from "../db";
import { differenceInDays, addDays } from "date-fns";

export class CyclePredictor {
    // simple statistical prediction based on user's history
    async predictNextPeriod(userId?: number): Promise<{ nextDate: Date; confidence: number }> {
        const logs = await db.periodLogs.orderBy("startDate").toArray();

        if (logs.length < 2) {
            // fallback relative to last cycle or today if no data
            const lastDate = logs.length > 0 ? logs[logs.length - 1].startDate : new Date();
            return {
                nextDate: addDays(lastDate, 28),
                confidence: 0.5
            };
        }

        // calculate avg cycle length
        let totalDays = 0;
        let cycles = 0;

        for (let i = 1; i < logs.length; i++) {
            const prev = logs[i - 1].startDate;
            const curr = logs[i].startDate;
            const diff = differenceInDays(curr, prev);

            // filter out outliers (eg: missed logging > 45 days)
            if (diff > 20 && diff < 45) {
                totalDays += diff;
                cycles++;
            }
        }

        const avgCycle = cycles > 0 ? Math.round(totalDays / cycles) : 28;
        const lastPeriod = logs[logs.length - 1].startDate;

        return {
            nextDate: addDays(lastPeriod, avgCycle),
            confidence: cycles > 3 ? 0.9 : 0.7
        };
    }
}

export const cyclePredictor = new CyclePredictor();
