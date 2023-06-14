const { execSync } = require('child_process');

try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
    }).trim();

    if (currentBranch !== 'master') {
        execSync('npm install @tonomy/tonomy-id-sdk --no-lockfile', {
            stdio: 'inherit',
        });
    }
} catch (error) {
    console.error('An error occurred while retrieving the current branch::', error);
}
