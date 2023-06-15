#!/bin/bash

currentBranch=$(git branch -- show-current)
echo "current branch $currentBranch"
if [[ "$currentBranch" != "master" ]]; then
  echo "execution start"
  npm install @tonomy/tonomy-id-sdk@development
  echo "execution end"
fi
