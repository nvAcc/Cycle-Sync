import fs from 'fs';
import csv from 'csv-parser';

const results = [];

fs.createReadStream('server/training/data/cycle_data.csv')
    .pipe(csv())
    .on('data', (data) => {
        if (results.length < 1) {
            console.log('--- First Row Keys ---');
            // Log keys as array to see hidden chars
            console.log(JSON.stringify(Object.keys(data)));
            console.log('--- First Row Values ---');
            console.log(data);
        }
        results.push(data);
    })
    .on('end', () => {
        console.log(`Parsed ${results.length} rows.`);
    });
