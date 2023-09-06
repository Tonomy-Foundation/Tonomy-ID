#!/bin/bash

BRANCH=${1-default}
CHECK=${2-default}

set +e

if [ "${BRANCH}" == "master" ]; then
    VERSION=$(npm view @tonomy/tonomy-id-sdk version)
elif [ "${BRANCH}" == "development" ]; then
    VERSION=$(npm view @tonomy/tonomy-id-sdk@development version)
else
    echo "Usage: yarn run updateSdkVersion master|development [check]"
    echo ""
    echo "Example: yarn run updateSdkVersion development"
    echo "Example: yarn run updateSdkVersion master check"
    echo ""
    exit 1
fi

YARNLOCK_SHA256_OLD=$(sha256sum yarn.lock)

echo "Updating package @tonomy/tonomy-id-sdk@${VERSION}"
yarn up "@tonomy/tonomy-id-sdk@${VERSION}"

YARNLOCK_SHA256_NEW=$(sha256sum yarn.lock)

if [ "${CHECK}" == "check" ]; then
    echo "Checking if yarn.lock has changed"
    if [ "${YARNLOCK_SHA256_NEW}" != "${YARNLOCK_SHA256_OLD}" ]; then
        echo "yarn.lock has changed while updating @tonomy/tonomy-id-sdk@${VERSION}"
        echo "Please run \"yarn run installSdkVersion\" to fix"
        exit 1
    fi
fi