import * as tf from '@tensorflow/tfjs';
import { isEmotional, addEmpathy } from './empathy';


export class ChatbotModel {
    private model: tf.LayersModel | null = null;
    private vocab: string[] = [];
    private tags: string[] = [];
    private responses: Record<string, string[]> = {};
    private isReady = false;
    private lastResponse: string = "";

    async init() {
        try {
            this.model = await tf.loadLayersModel('/model/model.json');

            const metadataRes = await fetch('/model/metadata.json');
            const metadata = await metadataRes.json();
            this.vocab = metadata.vocab;
            this.tags = metadata.tags;
            this.responses = metadata.responses || {};

            this.isReady = true;
            console.log("Chatbot model loaded successfully.");
        } catch (error) {
            console.error("Failed to load chatbot model:", error);
        }
    }

    tokenize(text: string): string[] {
        return text.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
    }

    bow(text: string): number[] {
        const tokens = this.tokenize(text);
        return this.vocab.map(w => tokens.includes(w) ? 1 : 0);
    }

    async classify(text: string): Promise<string> {
        if (!this.isReady) await this.init();

        const lowerText = text.toLowerCase();

        const rules: Record<string, string> = {
            "mood swings": "faq_532",
            "improve mood": "faq_532",
            "fix mood": "faq_532",
            "mood": "faq_531",
            "cramp": "pain_relief",
            "pain": "pain_relief",
            "bloating": "bloating",
            "bloated": "bloating",
            "acne": "acne",
            "pimple": "acne",
            "sad": "sadness",
            "depressed": "sadness",
            "cry": "sadness",
            "anxiety": "anxiety",
            "anxious": "anxiety",
            "stress": "anxiety",
            "nervous": "anxiety",
            "happy": "happy",
            "good": "happy",
            "great": "happy",
            "tired": "fatigue",
            "fatigue": "fatigue",
            "exhausted": "fatigue",
            "craving": "cravings",
            "hungry": "cravings",
            "eat": "cravings"
        };

        for (const [key, intent] of Object.entries(rules)) {
            if (lowerText.includes(key)) {
                console.log(`[Chatbot] Rule matched: "${key}" -> ${intent}`);
                return intent;
            }
        }

        if (!this.model || !this.isReady) return "general";

        const inputVector = this.bow(text);
        const inputTensor = tf.tensor2d([inputVector]);
        const prediction = this.model.predict(inputTensor) as tf.Tensor;
        const data = await prediction.data();

        const dataArray = Array.from(data);
        const maxIndex = dataArray.indexOf(Math.max(...dataArray));
        const confidence = dataArray[maxIndex];

        console.log(`[Chatbot] Model Prediction: index=${maxIndex}, conf=${confidence}, tag=${this.tags[maxIndex]}`);

        if (confidence < 0.5) return "general";

        return this.tags[maxIndex] || "general";
    }

    getResponse(intent: string, text: string = ""): string {
        console.log(`[Chatbot] Getting response for intent: ${intent}`);
        console.log(`[Chatbot] Available keys: ${Object.keys(this.responses).length}`);

        const options = this.responses[intent] || this.responses['general'] || ["I'm not sure I understood."];
        let availableOptions = options.filter(r => r !== this.lastResponse);

        if (intent === 'cravings' && text) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('salt') || lowerText.includes('chip') || lowerText.includes('fries') || lowerText.includes('savory')) {
                const saltyOptions = availableOptions.filter(r => r.includes('salty') || r.includes('salt') || r.includes('electrolytes'));
                if (saltyOptions.length > 0) availableOptions = saltyOptions;
            } else if (lowerText.includes('chocolate') || lowerText.includes('sugar') || lowerText.includes('sweet') || lowerText.includes('candy')) {
                const sweetOptions = availableOptions.filter(r => r.includes('chocolate') || r.includes('treat') || r.includes('sweet'));
                if (sweetOptions.length > 0) availableOptions = sweetOptions;
            }
        }

        if (availableOptions.length === 0) availableOptions = options;

        let response = availableOptions[Math.floor(Math.random() * availableOptions.length)];
        this.lastResponse = response;

        if (isEmotional(text)) {
            response = addEmpathy(response);
        }

        return response;
    }
}
export const chatbot = new ChatbotModel();