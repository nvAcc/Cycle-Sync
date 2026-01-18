import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.join(__dirname, '../../../ml/dataset.json');
const INTENTS_PATH = path.join(__dirname, 'intents.json');

// Read source dataset
console.log(`Reading dataset from ${DATASET_PATH}...`);
if (!fs.existsSync(DATASET_PATH)) {
    console.error("Dataset file not found!");
    process.exit(1);
}

const rawData = fs.readFileSync(DATASET_PATH, 'utf-8');
let faqData;
try {
    faqData = JSON.parse(rawData);
} catch (e) {
    console.error("Failed to parse dataset.json:", e);
    process.exit(1);
}

// Read existing intents
console.log(`Reading intents from ${INTENTS_PATH}...`);
let intentsData = { intents: [] };
if (fs.existsSync(INTENTS_PATH)) {
    intentsData = JSON.parse(fs.readFileSync(INTENTS_PATH, 'utf-8'));
}

// Transform and Merge
console.log(`Found ${faqData.length} FAQs to merge.`);
let addedCount = 0;

faqData.forEach((item, index) => {
    const question = item["instruction (string)"];
    const answer = item["output (string)"];

    if (!question || !answer) return;

    // Check for duplicates (simple check by pattern)
    const exists = intentsData.intents.some(i => i.patterns.includes(question));
    if (exists) return;

    // Create new intent
    // Tag generation: faq_001, faq_002...
    const tag = `faq_${String(index).padStart(3, '0')}`; // simple numeric tag
    // Or derive from text? numeric is safer for uniqueness.

    const newIntent = {
        tag: tag,
        patterns: [question],
        responses: [answer]
    };

    intentsData.intents.push(newIntent);
    addedCount++;
});

// Save
fs.writeFileSync(INTENTS_PATH, JSON.stringify(intentsData, null, 2));
console.log(`Successfully added ${addedCount} new intents.`);
console.log(`Total intents: ${intentsData.intents.length}`);
