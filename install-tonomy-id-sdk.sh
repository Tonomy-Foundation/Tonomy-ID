#!/bin/bash

currentBranch=$(git symbolic-ref --short HEAD)

if [[ "$currentBranch" != "master" ]]; then
  echo "execution start"
  yarn add @tonomy/tonomy-id-sdk@development
  echo "execution end"
fi
