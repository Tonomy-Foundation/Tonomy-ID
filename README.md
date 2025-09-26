# Tonomy-ID

Tonomy ID is the cross-platform mobile wallet (Android and iOS) for public and private Antelope blockchains. This application allows you to sign transactions on the block chain, share your DID and Verifiable Credentials containing your identity with others in a consensual way and log into web2 and web3 applications. If you lose your phone several mechanisms exist to allow you to recover your account without trusting anyone with custody of your private keys.

Tonomy ID is a React Native application in typescript.

## Dependencies

MAKE SURE YOU ARE WORKING FROM THE `DEVELOPMENT` BRANCH!!!

- Linux debian distribution (Ubuntu 20.0.4 LTS used)
- [Nodejs](https://nodejs.org) v20+ suggested installed with [nvm](https://github.com/nvm-sh/nvm)
- [eas-cli](https://expo.dev) ^16.3.3 installed globally

## Install

MAKE SURE YOU ARE WORKING FROM THE `DEVELOPMENT` BRANCH!!!

```bash
npm install -g eas-cli@16.3.3
yarn
```

## Pre-run build (first time and each time new RN only packages are installed)

This is to create an expo build so you can down an `.apk` or `.ipa` file from [https://expo.dev](https://expo.dev) which you can use to run the app. You can't Run from the Official Expo App.

1. Create an expo account to build the app. [https://expo.dev/signup](https://expo.dev/signup)
2. (for first time build only) `export EXPO_FIRST_TIME=true`
3. (for every time after first time only) Change the value of `"expoProjectId"` in `./src/config/config.json` to the vale of the `"Project ID"` in [https://expo.dev](https://expo.dev)
4. (for IOS only) Run `yarn run build:ios:create` to create a device profile for your phone. Follow the steps below:

    If you provide your Apple account credentials we will be able to generate all necessary build credentials and fully validate them.

    This is optional, but without Apple account access you will need to provide all the missing values manually and we can only run minimal validation on them.

    - Do you want to log in to your Apple account? (Y/n)
    - Login to your Apple Developer account to continue
        - Enter Apple ID and Password
    - Select Team [Stichting Tonomy - Company/Organization (6BLD42QR78)]
    - Select Provider [Stichting Tonomy (125811354)]
    - How would you like to register your devices?
        - Select Website - generate a registration URL to be opened on your devices

    After choosing Website, it will generate the URL and QR code. Open the link or scan the QR code and follow the instructions to install the development profile on ios device.

5. Run `yarn run build:ios` (ios) or `yarn run build:android` (android) to build the app for your phone
6. Return to [https://expo.dev/](https://expo.dev/) and click on the Tonomy ID project build and download the App.
7. Install the created app on your phone.

## Run

MAKE SURE YOU ARE WORKING FROM THE `DEVELOPMENT` BRANCH!!!

You NEED to follow the above `Pre-run build` steps above before you can start the app!

```bash
DEBUG=tonomy* yarn run start
```

## Installing new packages

```bash
# install as dependency
npx expo install expo-sqlite
# install as devDependency
npx expo install typescript -- -D
```

To check or fix compatibility issues

```bash
npx expo install typescript --check
npx expo install --fix
```

To check other expo issues

```bash
npx expo-doctor
```

### Update Tonomy-ID-SDK package version to the latest

```bash
yarn run updateSdkVersion development
# or
yarn run updateSdkVersion master
# or 
yarn run updateSdkVersion testnet
```

## Run the production environment locally

Run production (Tonomy ID), testnet (Tonomy ID Testnet) or staging (Tonomy ID Staging) locally without needing to wait for deploy to Play store. This has the advantage of being able to see logs as it runs

Instructions for `staging`. Change to `testnet` or `production` below to change environment:

1. Change to `"appName": "Tonomy ID Development"` in `config.staging.json`
2. Run `DEBUG=tonomy* EXPO_NODE_ENV=staging yarn run start`
3. Connect via QR and load the app

To run it with the same building as production:

1. Scroll down >> "Open React Native dev men"
2. Click "Settings"
3. Turn ON "JS Minify"
4. Turn OFF "JS Dev Mode"
5. Reload

This is now running in production mode connected to the staging/testnet environment.

## View debug logs of production apps installed from Google Play App Store, Apple App Store or Testflight

### Android

1. Install adb on your pc (<https://dl.google.com/android/repository/platform-tools-latest-windows.zip>)
2. Put the location of the folder inside Path env system variable or you can navigate to the folder and call adb.exe directly
3. Run `adb logcat *:S ReactNative:V ReactNativeJS:V` or `./adb.exe logcat*:S ReactNative:V ReactNativeJS:V` in the command line to catch debug messages of reactNative only. Try `adb logcat -s ReactNative:V ReactNativeJS:V` if that doesn't work.
4. Enable developer mode on your phone.
5. Enable USB debug on your phone.
6. Connect your phone to the pc with a usb cable.
7. Open the the react native app you want to debug.

### iOS

TODO: iOS

## Testing app upgrades

Check if upgrading from one app version to the next will break anything for users

### Developer mode

Note: this will NOT work if new expo/react-native packages have been installed in the upgrade

```bash
git checkout testnet
yarn
git checkout {{previousVersionCommitId}}
DEBUG=tonomy* EXPO_NODE_ENV=testnet yarn run start
# Then login or create an account, checkout assets and do a few other things.
# Then stop the app
git checkout testnet
DEBUG=tonomy* EXPO_NODE_ENV=testnet yarn run start
# See if you stay logged in, or if any other errors occure
```

### Android with built .apk files

1. Delete the app storage from OS settings
2. Install previous version using apk from the github action (Build Android APK) install it
<https://github.com/Tonomy-Foundation/Tonomy-ID/actions/workflows/build-apk.yaml>
3. Create account or login with the existing account
4. Go to the latest version of the app from the github actions
5. Test again and if face any error mention it in github issues with the replicate steps

### iOS with Testflight

1. iOS use testflight versions
2. Delete the app storage from OS settings → General → iPhone Storage.
3. Install previous version from the testflight
4. Create account or login with the existing account
5. Go to the testflight update the app to the latest version
6. Test again and if face any error mention it in github issues with the replicate steps

## File structure of components

[https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7](https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7)

## Configuration and environment variables

Set the configuration variables in the desired file in `./src/config`

`config.json` is used by default. Staging config file is choosing based on the value of environment variable `EXPO_NODE_ENV`

Values for EXPO_NODE_ENV

- EXPO_NODE_ENV=development - uses the default `./src/config/config.json`
- EXPO_NODE_ENV=test - same as `development`. this is set when `yarn run test` is run
- EXPO_NODE_ENV=local - same as `development`. this resolves the `@tonomy/tonomy-id-sdk` package to the local repository at `../Tonomy-ID-SDK` which is used for the `Tonomy-ID-Integration` repository when locally testing all software together.
- EXPO_NODE_ENV=staging - uses `./src/config/config.staging.json`
- EXPO_NODE_ENV=testnet - uses `./src/config/config.testnet.json`
- EXPO_NODE_ENV=production - throws an error. Will be used for the production deploy.

Values for EXPO_PLATFORM

- EXPO_PLATFORM=android - tells `prepare.app.config.ts` to configure app for Android
- EXPO_PLATFORM=ios - tells `prepare.app.config.ts` to configure app for iOS

Other environment variables override the values in the config file:

- BLOCKCHAIN_URL
- SSO_WEBSITE_ORIGIN
- VITE_COMMUNICATION_URL
- SENTRY_SECRET_KEY which **must be set** on any production environments

## Linting

Linting is done with `eslint`. Install the recommended VS Code plugin to see markers in your code.

```bash
yarn run lint
```

## How to deploy hotfix to master

- To ensure correct ios release to master
- Always do the conventional commit with fix bump version

## Error handling

See [errors.ts](./src/utils/errors.ts). All errors have a registered unique code enum.

### Debugging

Uses [debug](https://www.npmjs.com/package/debug) package. Use `export DEBUG="tonomy*"` to see all debug logs.

## Releases

Release versioning is done automatically with [https://github.com/marketplace/actions/automated-version-bump](automated-version-bump). This will do a major, minor or patch release based on words in the commits. See [Workflow](https://github.com/marketplace/actions/automated-version-bump#workflow) for details.
