const { execSync } = require('child_process');

try {
    let currentBranch;
    const githubRef = process.env.GITHUB_REF || 'refs/heads/default-branch';
    const branchPrefix = 'refs/heads/';

    if (githubRef.startsWith(branchPrefix)) {
        currentBranch = githubRef.substring(branchPrefix.length);
    } else {
        console.error('Invalid GITHUB_REF format:', githubRef);
    }

    // execSync('git symbolic-ref --short HEAD', {
    //     encoding: 'utf8',
    //     stdio: ['pipe', 'pipe', 'ignore'], // Redirect stdout and stderr to pipes
    // }).trim();
    console.log('current branch', currentBranch);

    // if (currentBranch === '' || !currentBranch) {
    //     currentBranch = process.env.GITHUB_REF.match(/refs\/heads\/(.*)/)[1];
    // }

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
