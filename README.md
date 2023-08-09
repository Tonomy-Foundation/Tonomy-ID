# Tonomy-ID

Tonomy ID is the cross-platform mobile wallet (Android and iOS) for public and private Antelope blockchains. This application allows you to sign transactions on the block chain, share your DID and Verifiable Credentials containing your identity with others in a consensual way and log into web2 and web3 applications. If you lose your phone several mechanisms exist to allow you to recover your account without trusting anyone with custody of your private keys.

Tonomy ID is a React Native application in typescript.

## Dependencies

MAKE SURE YOU ARE WORKING FROM THE `DEVELOPMENT` BRANCH!!!

- Linux debian distribution (Ubuntu 20.0.4 LTS used)
- [Nodejs](https://nodejs.org) v18.12.1+ suggested installed with [nvm](https://github.com/nvm-sh/nvm)

## Install

MAKE SURE YOU ARE WORKING FROM THE `DEVELOPMENT` BRANCH!!!

```bash
npm i && npm install --no-lockfile @tonomy/tonomy-id-sdk@development 
```

## Pre-run build (first time and each time new RN only packages are installed)

This is to create an expo build so you can down an `.apk` or `.ipa` file from [https://expo.dev](https://expo.dev) which you can use to run the app. You can't Run from the Official Expo App.

1. Create an expo account to build the app. [https://expo.dev/signup](https://expo.dev/signup)
2. (for first time build only) `export EXPO_FIRST_TIME=true`
3. Change the value of `"projectId"` in `prepare.app.config.ts` to the vale of the `"Project ID"` in [https://expo.dev](https://expo.dev)
4. (for IOS only) Run `npm run build:ios:create` to create a device profile for your phone
5. Run `npm run build:ios` (ios) or `npm run build:android` (android) to build the app for your phone
6. Return to [https://expo.dev/](https://expo.dev/) and click on the Tonomy ID project build and download the App.
7. Install the created app on your phone.

Having issues here or running the app? Checkout:

<https://github.com/Tonomy-Foundation/Tonomy-ID-Integration/blob/development/TROUBLESHOOT.md>

## Run

MAKE SURE YOU ARE WORKING FROM THE `DEVELOPMENT` BRANCH!!!

```bash
npm start
```

### Run with the staging / demo environment and build

Testing Staging / Demo Tonomy ID locally without needing to wait for deploy to Play store. This has the advantage of being able to see logs inside Tonomy ID as it runs

1. Modify `"appName": "Tonomy ID Development"` in `config.staging.json` or `config.demo.json`
2. Run `EXPO_NODE_ENV=staging npm start` or `EXPO_NODE_ENV=demo npm start`
3. Connect via QR and bundle and load the app
4. Scroll down >> "Open React Native dev men"
5. Click "Settings"
6. Turn ON "JS Minify"
7. Turn OFF "JS Dev Mode"
8. Reload

This is now running in production mode connected to the staging environment.

## Run Staging or Demo and see debug logs (Android only)

1. Install adb on your pc (<https://dl.google.com/android/repository/platform-tools-latest-windows.zip>)
2. Put the location of the folder inside Path env system variable or you can navigate to the folder and call adb.exe directly
3. Run `adb logcat *:S ReactNative:V ReactNativeJS:V` or `./adb.exe logcat*:S ReactNative:V ReactNativeJS:V` in the command line to catch debug messages of reactNative only.
4. Enable developer mode on your phone.
5. Enable USB debug on your phone.
6. Connect your phone to the pc with a usb cable.
7. Open the the react native app you want to debug.

## File structure of components

[https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7](https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7)

### Configuration and environment variables

Set the configuration variables in the desired file in `./src/config`

`config.json` is used by default. Staging config file is choosing based on the value of environment variable `EXPO_NODE_ENV`

Values for EXPO_NODE_ENV

- EXPO_NODE_ENV=development - uses the default `./src/config/config.json`
- EXPO_NODE_ENV=test - same as `development`. this is set when `npm test` is run
- EXPO_NODE_ENV=local - same as `development`. this resolves the `@tonomy/tonomy-id-sdk` package to the local repository at `../Tonomy-ID-SDK` which is used for the `Tonomy-ID-Integration` repository when locally testing all software together.
- EXPO_NODE_ENV=demo - uses `./src/config/config.demo.json`
- EXPO_NODE_ENV=staging - uses `./src/config/config.staging.json`
- EXPO_NODE_ENV=production - throws an error. Will be used for the production deploy.

Values for EXPO_PLATFORM

- EXPO_PLATFORM=android - tells `prepare.app.config.ts` to configure app for Android
- EXPO_PLATFORM=ios - tells `prepare.app.config.ts` to configure app for iOS

Other environment variables override the values in the config file:

- BLOCKCHAIN_URL
- SSO_WEBSITE_ORIGIN
- VITE_COMMUNICATION_URL

### Linting

Linting is done with `eslint`. Install the recommended VS Code plugin to see markers in your code.

```bash
npm run lint
```

### Error handling

See [errors.ts](./src/utils/errors.ts). All errors have a registered unique code enum.

## Releases

Release versioning is done automatically with [https://github.com/marketplace/actions/automated-version-bump](automated-version-bump). This will do a major, minor or patch release based on words in the commits. See [Workflow](https://github.com/marketplace/actions/automated-version-bump#workflow) for details.
