const { execSync } = require('child_process');

try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
    }).trim();

    if (currentBranch === 'development') {
        execSync('npm install @tonomy/tonomy-id-sdk@development --no-lockfile', {
            stdio: 'inherit',
        });
    }
} catch (error) {
    console.error('An error occurred while retrieving the current branch:', error);
}
