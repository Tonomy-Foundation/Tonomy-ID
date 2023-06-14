const { execSync } = require('child_process');

try {
    let currentBranch;

    try {
        currentBranch = execSync('git symbolic-ref --short HEAD', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'], // Redirect stdout and stderr to pipes
        }).trim();
    } catch (error) {
        // Fallback command for non-symbolic reference
        currentBranch = execSync('git branch --show-current', {
            encoding: 'utf8',
        }).trim();
    }

    console.log('current branch', currentBranch);

    if (currentBranch !== 'master') {
        console.log('execution start');
        execSync('npm install @tonomy/tonomy-id-sdk@development --no-lockfile', {
            stdio: 'inherit',
        });
        console.log('execution end');
    }
} catch (error) {
    console.error('An error occurred:', error);
    process.exit(1); // Exit the script with a non-zero code to indicate failure
}
