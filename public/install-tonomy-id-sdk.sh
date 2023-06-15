#!/bin/bash

# currentBranch=$(git symbolic-ref --short HEAD)
if currentBranch=$(git symbolic-ref -q HEAD); then
    currentBranch=${headRef#refs/heads/}
else
    currentBranch=$(git rev-parse HEAD)
fi
echo "current branch $(git symbolic-ref -q HEAD) $(git rev-parse HEAD) ${headRef#refs/heads/}  $(git branch)}"
if [[ "$currentBranch" != "master" ]]; then
  echo "execution start"
  npm install @tonomy/tonomy-id-sdk@development
  echo "execution end"
fi
