#!/bin/bash

# currentBranch=$(git symbolic-ref --short HEAD)
refBranch=$(git symbolic-ref -q HEAD)
    echo "Checkout Branch [${refBranch:11}]"
if currentBranch=$(git symbolic-ref -q HEAD); then
    currentBranch=${headRef#refs/heads/}
else
    currentBranch=$(git rev-parse HEAD)
fi
echo "current branch 1 $(git name-rev --name-only HEAD)"
echo "current branch 2 $(git symbolic-ref --short)"

echo "current branch 3 $(git rev-parse --abbrev-ref)"

echo "bbbb ${SYSTEM_PULLREQUEST_SOURCEBRANCH}"

if [[ "$currentBranch" != "master" ]]; then
  echo "execution start"
  npm install @tonomy/tonomy-id-sdk@development
  echo "execution end"
fi
