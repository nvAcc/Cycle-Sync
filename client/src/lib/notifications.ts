import { differenceInDays, addDays } from "date-fns";
import { type User } from "@shared/schema";
import { type PeriodLog } from "./db";
import { cyclePredictor } from "./ai/predictionModel";

export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function sendNotification(title: string, body: string) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: "/luna-icon-192.png",
            badge: "/luna-icon-192.png"
        });
    }
}

export async function checkAndNotify(user: Partial<User> | null, logs: PeriodLog[] | undefined) {
    if (!user || !logs || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];
    try {
        const prediction = await cyclePredictor.predictNextPeriod();
        const daysUntil = differenceInDays(prediction.nextDate, new Date());
        if (daysUntil <= 2 && daysUntil >= 0) {
            const lastReminded = localStorage.getItem("luna_last_period_reminder");
            const today = new Date().toDateString();

            if (lastReminded !== today) {
                sendNotification("Period Arriving Soon", `Your cycle is predicted to start in ${daysUntil === 0 ? 'today' : daysUntil + ' days'}.`);
                localStorage.setItem("luna_last_period_reminder", today);
            }
        }
    } catch (e) {
        console.error("Prediction failed for notification", e);
    }

    // 2. Daily Check-in (if no log for > 24 hours)
    // Check if the last log end date is active? No, check if *entry* was made today.
    // Actually, users usually log once a day. Let's see if they logged *today*.
    // A better check: time since last app open? Or just "Have you logged today?"

    const lastLogDate = new Date(lastLog.startDate);
    const today = new Date();

    // If we are in the flow (e.g. bleeding), maybe we want to log flow?
    // Or just general "Log symptoms"

    const lastCheckIn = localStorage.getItem("luna_last_daily_checkin");
    const todayStr = today.toDateString();

    if (lastCheckIn !== todayStr) {
        // If they haven't been reminded today
        // And they haven't logged anything today (we'd need to check logs for today's date)
        const hasLoggedToday = logs.some(l => new Date(l.startDate).toDateString() === todayStr);

        if (!hasLoggedToday) {
            // Maybe only notify if it's evening? Or just on app open as requested.
            // The user asked for "Daily Check-in".
            // We'll delay it slightly to not annoy on immediate open
            setTimeout(() => {
                sendNotification("Daily Check-in", "How are you feeling today? Tap to log your symptoms.");
                localStorage.setItem("luna_last_daily_checkin", todayStr);
            }, 5000);
        }
    }
}
