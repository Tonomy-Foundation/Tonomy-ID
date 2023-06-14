const { execSync } = require('child_process');

const currentBranch = execSync('git symbolic-ref --short HEAD', {
    encoding: 'utf8',
}).trim();

if (currentBranch === 'development') {
    execSync('npm install @tonomy/tonomy-id-sdk@development --no-lockfile', {
        stdio: 'inherit',
    });
}
