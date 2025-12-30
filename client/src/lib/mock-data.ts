import { addDays, subDays, format } from "date-fns";

export type PeriodLog = {
  date: Date;
  flow: "light" | "medium" | "heavy" | "spotting" | null;
  mood: "happy" | "sad" | "anxious" | "irritated" | "calm" | "energetic" | null;
  symptoms: string[];
};

export const MOCK_LOGS: PeriodLog[] = [
  {
    date: subDays(new Date(), 2),
    flow: "heavy",
    mood: "irritated",
    symptoms: ["cramps", "bloating"],
  },
  {
    date: subDays(new Date(), 3),
    flow: "medium",
    mood: "sad",
    symptoms: ["headache"],
  },
  {
    date: subDays(new Date(), 28),
    flow: "medium",
    mood: "calm",
    symptoms: [],
  },
  {
    date: subDays(new Date(), 56),
    flow: "heavy",
    mood: "anxious",
    symptoms: ["acne"],
  },
];

export const CYCLE_LENGTH = 28;
export const PERIOD_LENGTH = 5;

export const NEXT_PERIOD_PREDICTION = addDays(new Date(), 12);
export const FERTILE_WINDOW_START = addDays(new Date(), -2);
export const FERTILE_WINDOW_END = addDays(new Date(), 3);

export const CHAT_SUGGESTIONS = [
  "I have intense cramps",
  "Why is my cycle late?",
  "How to improve mood swings?",
  "Best foods for period week",
];

export type Thread = {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
  tags: string[];
};

export const MOCK_THREADS: Thread[] = [
  {
    id: "1",
    author: "Emma_W",
    avatar: "🌿",
    title: "Best tea for severe cramps?",
    content: "Hi everyone! I've been struggling with really bad cramps this month. Has anyone found a specific herbal tea that actually works? I've tried chamomile but it's not cutting it.",
    likes: 24,
    replies: 8,
    timestamp: "2h ago",
    tags: ["Remedies", "Pain Relief"],
  },
  {
    id: "2",
    author: "YogaLover99",
    avatar: "🧘‍♀️",
    title: "Gentle yoga flow for day 1",
    content: "Just wanted to share a routine that helps me so much when I have zero energy. It's mostly floor poses. Let me know if anyone wants the link!",
    likes: 45,
    replies: 12,
    timestamp: "5h ago",
    tags: ["Fitness", "Wellness"],
  },
  {
    id: "3",
    author: "NewHere_22",
    avatar: "🌸",
    title: "Is this symptom normal?",
    content: "I've started getting really bad migraines right before my cycle starts. Is this common? Should I be worried?",
    likes: 12,
    replies: 5,
    timestamp: "1d ago",
    tags: ["Advice", "Health"],
  },
];

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  timestamp: string;
};

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "TeaMaster",
    avatar: "🍵",
    content: "Raspberry leaf tea is a game changer! It strengthens the uterine muscles. Highly recommend.",
    likes: 10,
    timestamp: "1h ago",
  },
  {
    id: "c2",
    author: "Sarah_M",
    avatar: "🌸",
    content: "Ginger tea with honey helps me a lot with the nausea too.",
    likes: 5,
    timestamp: "30m ago",
  },
];
