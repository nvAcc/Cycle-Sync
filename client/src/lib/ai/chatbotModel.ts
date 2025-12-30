import * as tf from '@tensorflow/tfjs';

// pre defined vocab and intents for the lightweight model
const VOCAB = ['cramp', 'pain', 'mood', 'sad', 'happy', 'food', 'diet', 'bleeding', 'heavy', 'tired'];
const INTENTS = ['pain_relief', 'emotional_support', 'nutrition', 'symptom_check'];

export class ChatbotModel {
    private model: tf.Sequential | null = null;
    private isReady = false;

    async init() {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 8, inputShape: [VOCAB.length], activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: INTENTS.length, activation: 'softmax' }));

        this.model.compile({ optimizer: 'sgd', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
        this.isReady = true;
    }

    encode(text: string): tf.Tensor2D {
        const tokens = text.toLowerCase().split(/\s+/);
        const vector = VOCAB.map(word => tokens.some(t => t.includes(word)) ? 1 : 0);
        return tf.tensor2d([vector]);
    }

    async classify(text: string): Promise<string> {
        if (!this.isReady) await this.init();
        if (!this.model) return "unknown";

        const input = this.encode(text);
        const prediction = this.model.predict(input) as tf.Tensor;
        const index = (await prediction.argMax(1).data())[0];

        if (text.includes('cramp') || text.includes('pain')) return 'pain_relief';
        if (text.includes('mood') || text.includes('sad')) return 'emotional_support';
        if (text.includes('food') || text.includes('eat')) return 'nutrition';

        return INTENTS[index] || "general";
    }

    private lastResponse: string = "";

    getResponse(intent: string): string {
        const responses: Record<string, string[]> = {
            pain_relief: [
                "I'm sorry you're hurting. Try a warm compress and gentle stretches.",
                "Magnesium supplements or dark chocolate might help with the cramps.",
                "Rest is important. Have you tried drinking chamomile tea?"
            ],
            emotional_support: [
                "It's completely normal to feel this way. Be kind to yourself.",
                "Your hormones are shifting right now. Take it easy today.",
                "Sending you a virtual hug! Maybe watch your favorite comfort movie?"
            ],
            nutrition: [
                "Focus on iron-rich foods like spinach and lean proteins.",
                "Stay hydrated! Water helps with bloating and headaches.",
                "Avoid too much caffeine/salt today if you can."
            ],
            general: [
                "I'm here to listen. Tell me more about how you're feeling.",
                "Could you describe your symptoms in more detail?",
                "I'm Luna, your cycle assistant."
            ]
        };

        const options = responses[intent] || responses['general'];
        let availableOptions = options.filter(r => r !== this.lastResponse);
        if (availableOptions.length === 0) availableOptions = options;

        const response = availableOptions[Math.floor(Math.random() * availableOptions.length)];
        this.lastResponse = response;
        return response;
    }
}

export const chatbot = new ChatbotModel();
