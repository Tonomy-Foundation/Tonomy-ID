#!/bin/bash

# currentBranch=$(git symbolic-ref --short HEAD)
refBranch=$(git symbolic-ref -q HEAD)
    echo "Checkout Branch [${refBranch:11}]"
if currentBranch=$(git symbolic-ref -q HEAD); then
    currentBranch=${headRef#refs/heads/}
else
    currentBranch=$(git rev-parse HEAD)
fi
echo "current branch $(git symbolic-ref -q HEAD) $(git rev-parse --abbrev-ref HEAD) ${headRef#refs/heads/}  $(git branch)}"
if [[ "$currentBranch" != "master" ]]; then
  echo "execution start"
  npm install @tonomy/tonomy-id-sdk@development
  echo "execution end"
fi
