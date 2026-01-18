import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, 'data', 'cycle_data.csv');
const MODEL_DIR = path.join(__dirname, '../../client/public/models/cycle_prediction');
const WEIGHTS_FILE = path.join(MODEL_DIR, 'weights.bin');
const MODEL_FILE = path.join(MODEL_DIR, 'model.json');

// Ensure model output directory exists
if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
}

const features = [];
const labels = [];

console.log('Loading data...');

fs.createReadStream(DATA_PATH)
    .pipe(csv())
    .on('data', (row) => {
        // Extract raw values
        const c1 = parseFloat(row['CycleLength-1']);
        const c2 = parseFloat(row['CycleLength-2']);
        const c3 = parseFloat(row['CycleLength-3']);
        const ca = parseFloat(row['CumulativeAverages']);
        let age = parseFloat(row['Age']);
        let bmi = parseFloat(row['BMI']);
        const label = parseFloat(row['LengthofCycle']);

        // Defaults for missing demographics
        if (isNaN(age)) age = 30; // Median age
        if (isNaN(bmi)) bmi = 22; // Average BMI

        // Validation: Only skip if cycle history or target is truly invalid
        // We accept 0 for C1-C3 as valid "no history" marker, but we prefer data with history.
        // Actually, if C1, C2, C3 are ALL 0, it's a first cycle. We want to include these?
        // Yes, to handle new users. But we really want rows with history.
        // The issue before was purely Age/BMI being NaN causing drop.

        if (isNaN(c1) || isNaN(c2) || isNaN(c3) || isNaN(ca) || isNaN(label)) {
            return;
        }

        const featureRow = [c1, c2, c3, ca, age, bmi];
        features.push(featureRow);
        labels.push(label);
    })
    .on('end', async () => {
        console.log(`Data loaded. Found ${features.length} valid samples.`);
        if (features.length > 0) {
            console.log('Sample features (first 5):', features.slice(0, 5));
        }
        await trainModel();
    });

async function trainModel() {
    if (features.length === 0) {
        console.error("No features loaded! Aborting.");
        return;
    }
    // 1. Convert to Tensors
    const inputTensor = tf.tensor2d(features);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    // 2. Normalize Data (Min-Max Scaling)
    const inputMin = inputTensor.min(0);
    const inputMax = inputTensor.max(0);

    console.log("Input Min:", await inputMin.array());
    console.log("Input Max:", await inputMax.array());
    const labelMin = labelTensor.min();
    const labelMax = labelTensor.max();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    // Save normalization metadata
    const metaData = {
        inputMin: await inputMin.array(),
        inputMax: await inputMax.array(),
        labelMin: await labelMin.array(),
        labelMax: await labelMax.array()
    };
    fs.writeFileSync(path.join(MODEL_DIR, 'normalization_meta.json'), JSON.stringify(metaData));
    console.log('Normalization metadata saved.');

    // 3. Define Model
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mse']
    });

    console.log('Starting training...');

    await model.fit(normalizedInputs, normalizedLabels, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        verbose: 0
    });

    console.log('Training complete.');

    // 4. Save Model with Custom Handler
    // Pure TFJS node saving workaround
    const saveHandler = {
        save: async function (modelArtifacts) {
            modelArtifacts.modelTopology.dateSaved = new Date().toISOString();

            // Save weights
            const weights = Buffer.from(modelArtifacts.weightData);
            fs.writeFileSync(WEIGHTS_FILE, weights);

            // Save model topology
            // We need to fix the weights manifest path to be relative
            const manifest = modelArtifacts.weightSpecs;
            const modelJSON = {
                modelTopology: modelArtifacts.modelTopology,
                format: modelArtifacts.format,
                generatedBy: modelArtifacts.generatedBy,
                convertedBy: modelArtifacts.convertedBy,
                weightsManifest: [{
                    paths: ['./weights.bin'],
                    weights: manifest
                }]
            };

            fs.writeFileSync(MODEL_FILE, JSON.stringify(modelJSON));
            return {
                modelArtifactsInfo: {
                    dateSaved: new Date(),
                    modelTopologyType: 'JSON',
                    modelTopologyBytes: JSON.stringify(modelJSON).length,
                    weightSpecsBytes: JSON.stringify(manifest).length,
                    weightDataBytes: weights.length,
                }
            };
        }
    };

    await model.save(saveHandler);
    console.log(`Model saved to ${MODEL_DIR}`);
}
