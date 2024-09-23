#!/bin/bash

BRANCH=${1-default}
CHECK=${2-default}

echo "yarn run updateSdkVersion $@"

set +e

# Get the latest version of the SDK for the correct npmjs tag based on branch
if [ "${BRANCH}" == "master" ]; then
    VERSION=$(npm view @tonomy/tonomy-id-sdk@latest version)
elif [ "${BRANCH}" == "testnet" ]; then
    VERSION=$(npm view @tonomy/tonomy-id-sdk@testnet version)
elif [ "${BRANCH}" == "development" ]; then
    VERSION=$(npm view @tonomy/tonomy-id-sdk@development version)
else
    # Print help
    echo "Usage: yarn run updateSdkVersion master|testnet|development [check]"
    echo ""
    echo "Example: yarn run updateSdkVersion development"
    echo "Example: yarn run updateSdkVersion master check"
    echo ""
    exit 1
fi

# Get the sha256sum of yarn.lock before updating the SDK
YARNLOCK_SHA256_OLD=$(sha256sum yarn.lock)

# Update the SDK
echo "Updating package @tonomy/tonomy-id-sdk@${VERSION}"
yarn up "@tonomy/tonomy-id-sdk@${VERSION}"

# Get the sha256sum of yarn.lock after updating the SDK
YARNLOCK_SHA256_NEW=$(sha256sum yarn.lock)

if [ "${CHECK}" == "check" ]; then
    echo "Checking if yarn.lock has changed"
    if [ "${YARNLOCK_SHA256_NEW}" != "${YARNLOCK_SHA256_OLD}" ]; then
        echo "yarn.lock has changed while updating @tonomy/tonomy-id-sdk@${VERSION}"
        echo "Please run \"yarn run installSdkVersion\" to fix"
        exit 1
    fi
fi