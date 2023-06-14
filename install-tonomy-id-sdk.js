const { execSync } = require('child_process');

try {
    let currentBranch;

    try {
        currentBranch = execSync('git symbolic-ref --short HEAD', {
            encoding: 'utf8',
        }).trim();
    } catch (error) {
        // Fallback command for non-symbolic reference
        currentBranch = execSync('git branch --show-current', {
            encoding: 'utf8',
        }).trim();
    }

    if (currentBranch !== 'master') {
        console.log('execution start');
        execSync('yarn add @tonomy/tonomy-id-sdk@development', {
            stdio: 'inherit',
        });
        console.log('execution end');
    }
} catch (error) {
    console.error('An error occurred:', error);
    process.exit(1); // Exit the script with a non-zero code to indicate failure
}
