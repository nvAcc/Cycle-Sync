import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTENTS_PATH = path.join(__dirname, 'intents.json');
const OUTPUT_DIR = path.join(__dirname, '../../client/public/model');

const data = JSON.parse(fs.readFileSync(INTENTS_PATH, 'utf8'));
const intents = data.intents;
const words = new Set();
const classes = [];
const documents = [];

function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 0);
}

const responseMap = {};
intents.forEach(intent => {
    if (!classes.includes(intent.tag)) {
        classes.push(intent.tag);
    }
    responseMap[intent.tag] = intent.responses;

    intent.patterns.forEach(pattern => {
        const w = tokenize(pattern);
        w.forEach(word => words.add(word));
        documents.push({ words: w, tag: intent.tag });
    });
});

const vocab = Array.from(words).sort();
const tags = classes.sort();

const metadata = {
    vocab: vocab,
    tags: tags,
    responses: responseMap
};

const trainingData = [];
const outputData = [];

documents.forEach(doc => {
    const bag = vocab.map(w => doc.words.includes(w) ? 1 : 0);

    const outputRow = new Array(tags.length).fill(0);
    outputRow[tags.indexOf(doc.tag)] = 1;

    trainingData.push(bag);
    outputData.push(outputRow);
});

const xs = tf.tensor2d(trainingData);
const ys = tf.tensor2d(outputData);

const model = tf.sequential();
model.add(tf.layers.dense({
    inputShape: [vocab.length],
    units: 16,
    activation: 'relu'
}));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
}));
model.add(tf.layers.dense({
    units: tags.length,
    activation: 'softmax'
}));

model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: tf.train.adam(0.01),
    metrics: ['accuracy']
});

async function train() {
    console.log('Training started...');
    await model.fit(xs, ys, {
        epochs: 100,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 10 === 0) {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
                }
            }
        }
    });
    console.log('Training finished.');

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log(`Creating directory: ${OUTPUT_DIR}`);
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const saveHandler = {
        save: async function (modelArtifacts) {
            const modelTopology = modelArtifacts.modelTopology;
            const weightData = modelArtifacts.weightData;
            const weightSpecs = modelArtifacts.weightSpecs;

            if (weightData) {
                const buffer = Buffer.from(weightData);
                fs.writeFileSync(path.join(OUTPUT_DIR, 'weights.bin'), buffer);
            }

            const modelJson = {
                modelTopology: modelTopology,
                format: modelArtifacts.format,
                generatedBy: modelArtifacts.generatedBy,
                convertedBy: modelArtifacts.convertedBy,
                weightsManifest: [{
                    paths: ['./weights.bin'],
                    weights: weightSpecs
                }]
            };

            fs.writeFileSync(path.join(OUTPUT_DIR, 'model.json'), JSON.stringify(modelJson));

            return {
                modelArtifactsInfo: {
                    dateSaved: new Date(),
                    modelTopologyType: 'JSON',
                    weightDataBytes: weightData ? weightData.byteLength : 0
                }
            };
        }
    };

    await model.save(saveHandler);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(metadata));
    console.log(`Model and metadata saved to ${OUTPUT_DIR}`);

    // Verification Step
    console.log('\n--- VERIFICATION ---');
    const testPhrases = ["im sad", "period cramps", "what is pcos", "heavy flow"];
    testPhrases.forEach(text => {
        const tokens = tokenize(text);
        const bag = vocab.map(w => tokens.includes(w) ? 1 : 0);
        const tensor = tf.tensor2d([bag]);
        const prediction = model.predict(tensor).dataSync();
        const maxIdx = prediction.indexOf(Math.max(...prediction));
        console.log(`Input: "${text}" -> Intent: ${tags[maxIdx]} (Conf: ${prediction[maxIdx].toFixed(4)})`);
    });
}

train();
