const { execSync } = require('child_process');

const currentBranch = execSync('git symbolic-ref --short HEAD', {
    encoding: 'utf8',
}).trim();

if (currentBranch === 'feature/232-sdk-deployment') {
    execSync('npm install --no-lockfile @tonomy/tonomy-id-test@development', {
        stdio: 'inherit',
    });
}
