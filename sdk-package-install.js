import { execSync } from 'child_process';

try {
    const currentBranch = execSync('git symbolic-ref --short HEAD', {
        encoding: 'utf8',
    }).trim();

    if (currentBranch === 'feature/232-sdk-deployment') {
        execSync('yarn add @tonomy/tonomy-id-test@development', {
            stdio: 'inherit',
        });
    } else {
        console.log('Current branch is not feature/232-sdk-deployment.');
    }
} catch (error) {
    console.error('An error occurred while executing Git command:', error);
}
