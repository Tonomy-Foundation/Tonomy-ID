#!/bin/bash

currentBranch=$(git symbolic-ref --short HEAD)
echo "current branch $currentBranch"
if [[ "$currentBranch" != "master" ]]; then
  echo "execution start"
  npm install @tonomy/tonomy-id-sdk@development
  echo "execution end"
fi
