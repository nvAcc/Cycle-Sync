import Dexie, { type Table } from 'dexie';

export interface PeriodLog {
    id?: number;
    startDate: Date;
    endDate?: Date;
    flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
    symptoms: string[]; // JSON stringified array
    notes?: string;
    createdAt: Date;
}

export interface DailyStat {
    id?: number;
    date: Date;
    mood?: string;
    energyLevel?: number; // 1-10
    waterIntake?: number; // glasses
    sleepHours?: number;
    createdAt: Date;
}

export interface Thread {
    id?: number;
    title: string;
    content: string;
    category: string;
    author: string;
    avatar: string;
    likes: number;
    timestamp: string;
    createdAt: Date;
}

export interface Comment {
    id?: number;
    threadId: number;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    createdAt: Date;
}

export class CycleSyncDB extends Dexie {
    periodLogs!: Table<PeriodLog>;
    dailyStats!: Table<DailyStat>;
    threads!: Table<Thread>;
    comments!: Table<Comment>;

    constructor() {
        super('CycleSyncDB');
        this.version(1).stores({
            periodLogs: '++id, startDate, endDate',
            dailyStats: '++id, date'
        });

        this.version(2).stores({
            periodLogs: '++id, startDate, endDate',
            dailyStats: '++id, date',
            threads: '++id, category, createdAt',
            comments: '++id, threadId, createdAt'
        });
    }
}

export const db = new CycleSyncDB();
