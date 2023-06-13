import { execSync } from 'child_process';

const currentBranch = execSync('git symbolic-ref --short HEAD', {
    encoding: 'utf8',
}).trim();

if (currentBranch === 'development') {
    execSync('npm install --no-lockfile @tonomy/tonomy-id-sdk@development', {
        stdio: 'inherit',
    });
}
