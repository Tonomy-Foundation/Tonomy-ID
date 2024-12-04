const fs = require('fs');
const path = require('path');

const version = process.argv[2];
const branch = process.argv[3];

let customVersion;

if (branch === 'master') {
    customVersion = version;
} else if (branch === 'testnet') {
    const [major, minor, patch] = version.split('.');

    customVersion = `${major}.${minor}.30000${patch.split('-')[1].split('.')[1]}`;
} else if (branch === 'development') {
    const [major, minor, patch] = version.split('.');

    customVersion = `${major}.${minor}.20000${patch.split('-')[1].split('.')[1]}`;
}

console.log(`Custom version: ${customVersion}`);

// Update package.json with the custom version
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.version = customVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));