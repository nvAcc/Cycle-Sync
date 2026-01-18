// Ported from ml/model.py

export const EMOTIONAL_CUES = [
    "sad", "anxious", "overwhelmed", "tired", "depressed",
    "stressed", "lonely", "upset", "cry", "hurt", "exhausted",
    "pain", "hurts", "dying", "help"
];

export const EMPATHETIC_OPENERS = [
    "I'm really glad you told me.",
    "That sounds like a lot to carry.",
    "I'm here with you.",
    "You're not overreacting — this matters.",
    "I hear you, and I'm here.",
    "It's okay to feel this way."
];

export const GENTLE_FOLLOWUPS = [
    "Do you want to talk a bit more about it?",
    "Would it help to describe how today has been?",
    "I'm listening.",
    "Take your time, I'm here.",
    "Is there anything specific helping you cope right now?"
];

export function isEmotional(text: string): boolean {
    const lower = text.toLowerCase();
    return EMOTIONAL_CUES.some(cue => lower.includes(cue));
}

export function addEmpathy(baseResponse: string): string {
    const opener = EMPATHETIC_OPENERS[Math.floor(Math.random() * EMPATHETIC_OPENERS.length)];
    const followup = GENTLE_FOLLOWUPS[Math.floor(Math.random() * GENTLE_FOLLOWUPS.length)];

    return `${opener}\n\n${baseResponse}\n\n${followup}`;
}
