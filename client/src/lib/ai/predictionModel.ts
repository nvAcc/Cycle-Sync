import * as tf from "@tensorflow/tfjs";
import { db } from "../db";
import { differenceInDays, addDays } from "date-fns";

export class CyclePredictor {
    private model: tf.LayersModel | null = null;
    private meta: any = null;
    private isReady = false;

    async init() {
        if (this.isReady) return;
        try {
            this.model = await tf.loadLayersModel('/models/cycle_prediction/model.json');
            const res = await fetch('/models/cycle_prediction/normalization_meta.json');
            this.meta = await res.json();
            this.isReady = true;
            console.log("Cycle Prediction Model loaded.");
        } catch (e) {
            console.error("Failed to load Cycle Prediction Model:", e);
        }
    }

    async predictNextPeriod(): Promise<{ nextDate: Date; confidence: number; source: 'ai' | 'statistical' }> {
        // Force init every time to be safe? No, just await it.
        await this.init();

        const logs = await db.periodLogs.orderBy("startDate").toArray();
        console.log("AI DEBUG: Logs found:", logs.length);

        if (this.isReady && this.model && this.meta && logs.length >= 2) {
            try {
                // 1. Extract Features
                const cycleLengths: number[] = [];
                for (let i = 1; i < logs.length; i++) {
                    const length = differenceInDays(new Date(logs[i].startDate), new Date(logs[i - 1].startDate));

                    // Relaxed Filter: Allow 15 to 90 days to catch more irregular cycles
                    if (length > 15 && length < 90) {
                        cycleLengths.push(length);
                    } else {
                        console.warn("AI DEBUG: Cycle ignored (out of range):", length);
                    }
                }

                console.log("AI DEBUG: Valid Cycle Lengths:", cycleLengths);

                // RELAXED REQUIREMENT: If we have at least 1 valid cycle
                if (cycleLengths.length >= 1) {

                    // Calculate Avg for metadata (cumAvg feature)
                    const sum = cycleLengths.reduce((a, b) => a + b, 0);
                    const cumAvg = sum / cycleLengths.length;

                    // AGGRESSIVE PADDING: Duplicate history to fill 3 slots
                    let last3 = cycleLengths.slice(-3);

                    // If we have 1 cycle [28], become [28, 28, 28]
                    // If we have 2 cycles [30, 28], become [30, 28, 28] (duplicates last known)
                    while (last3.length < 3) {
                        last3.unshift(last3[0]); // Duplicate the oldest known cycle
                    }

                    // Defaults
                    const age = 25;
                    const bmi = 22;

                    const inputs = [...last3.reverse(), cumAvg, age, bmi];
                    console.log("AI DEBUG: Input Features:", inputs);

                    // 2. Normalization
                    const tensor = tf.tensor2d([inputs]);
                    const inputMin = tf.tensor1d(this.meta.inputMin);
                    const inputMax = tf.tensor1d(this.meta.inputMax);

                    const normalized = tensor.sub(inputMin).div(inputMax.sub(inputMin));

                    // 3. Prediction
                    const prediction = this.model.predict(normalized) as tf.Tensor;
                    const normalizedVal = (await prediction.data())[0];

                    console.log("AI DEBUG: Normalized Output:", normalizedVal);

                    // 4. Denormalization
                    const labelMin = this.meta.labelMin[0] || this.meta.labelMin;
                    const labelMax = this.meta.labelMax[0] || this.meta.labelMax;
                    const predictedLength = normalizedVal * (labelMax - labelMin) + labelMin;

                    console.log("AI DEBUG: Predicted Cycle Length:", predictedLength);

                    if (isNaN(predictedLength)) throw new Error("Model predicted NaN");

                    const lastPeriodDate = new Date(logs[logs.length - 1].startDate);
                    const nextPeriod = addDays(lastPeriodDate, Math.round(predictedLength));

                    // Cleanup
                    tensor.dispose(); inputMin.dispose(); inputMax.dispose(); prediction.dispose();

                    return {
                        nextDate: nextPeriod,
                        confidence: 0.95,
                        source: 'ai'
                    };
                } else {
                    console.log("AI DEBUG: Not enough valid cycles after filtering.");
                }

            } catch (e) {
                console.error("AI DEBUG: Prediction Error:", e);
            }
        } else {
            console.log("AI DEBUG: Model not ready or insufficient logs (<2). IsReady:", this.isReady);
        }

        // --- Fallback: Statistical Average ---

        if (logs.length < 2) {
            const lastDate = logs.length > 0 ? new Date(logs[logs.length - 1].startDate) : new Date();
            return {
                nextDate: addDays(lastDate, 28),
                confidence: 0.5,
                source: 'statistical'
            };
        }

        let totalDays = 0;
        let cycles = 0;

        for (let i = 1; i < logs.length; i++) {
            const prev = new Date(logs[i - 1].startDate);
            const curr = new Date(logs[i].startDate);
            const diff = differenceInDays(curr, prev);

            if (diff > 20 && diff < 45) {
                totalDays += diff;
                cycles++;
            }
        }

        const avgCycle = cycles > 0 ? Math.round(totalDays / cycles) : 28;
        const lastPeriod = new Date(logs[logs.length - 1].startDate);

        return {
            nextDate: addDays(lastPeriod, avgCycle),
            confidence: cycles > 3 ? 0.9 : 0.7,
            source: 'statistical'
        };
    }
}

export const cyclePredictor = new CyclePredictor();
