import fs from 'fs';
import path from 'path';

async function readAbi() {
    try {
        // Path to the ABI file
        const abiPath = path.join(__dirname, '../Tonomy-ID/build/contracts/SimpleStorage.json');

        // Read the ABI file
        const abiFile = fs.readFileSync(abiPath, 'utf-8');

        // Parse the ABI file content
        const abiJson = JSON.parse(abiFile);

        // Extract the ABI from the JSON file
        const abi = abiJson.abi;

        // Log the extracted ABI
        console.log('ABI:', abi);
    } catch (err) {
        console.error('Error reading ABI:', err);
    }
}

readAbi();
