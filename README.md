# Tonomy-ID

Tonomy ID is the cross-platform mobile wallet (Android and iOS) for public and private Antelope blockchains. This application allows you to sign transactions on the block chain, share your DID and Verifiable Credentials containing your identity with others in a consensual way and log into web2 and web3 applications. If you lose your phone several mechanisms exist to allow you to recover your account without trusting anyone with custody of your private keys.

Tonomy ID is a React Native application in typescript.

## Dependancies

- Linux debian distribution (Ubuntu 20.0.4 LTS used)
- [Nodejs](https://nodejs.org) v16.4.1+ suggested installed with [nvm](https://github.com/nvm-sh/nvm)
- [Expo-cli](https://expo.dev)  v45.0.0 globally installed with `npm i -g expo-cli@5.5.1`
- [Eas-cli](https://docs.expo.dev/workflow/expo-cli/) v2.2.1 globally installed with `npm i -g eas-cli@2.2.1`

## Pre-run build (first time and each time new RN only packages are installed)

This is to create an expo build so you can down an `.apk` or `.ipa` file from [https://expo.dev](https://expo.dev) which you can use to run the app.

1. Create an expo account to build the app. [https://expo.dev/signup](https://expo.dev/signup)
2. (for first time build only) Remove the following lines from `app.default.json`

```json
    "extra": {
      "eas": {
        "projectId": "afffe2ee-9f93-4d18-9361-df30429cbd98"
      }
    }
```

3. (to connect to an existing build in [https://expo.dev](https://expo.dev)) change the value of "projectId" in `app.default.json` to the vale of the project in [https://expo.dev](https://expo.dev)
4. (for IOS only) Run `npm run build:ios:create` to create a device profile for your phone
5. Run `npm run build:ios` (ios) or `npm run build:android` (android) to build the app for your phone
6. Return to [https://expo.dev/](https://expo.dev/) and click on the Tonomy ID project build
7. Install the created app on your phone

Having issues here or running the app? Checkout:

https://github.com/Tonomy-Foundation/Tonomy-ID-Integration/blob/development/TROUBLESHOOT.md

# Standalone run

1. clone the [tonomy id](https://github.com/Tonomy-Foundation/Tonomy-ID.git) repo and change the branch to `development` or run

```bash
git clone -b development https://github.com/Tonomy-Foundation/Tonomy-ID.git
```

2. clone the [tonomy id sdk](https://github.com/Tonomy-Foundation/Tonomy-ID-SDK.git) repo and change the branch to `development` or run

```bash
git clone -b development https://github.com/Tonomy-Foundation/Tonomy-ID-SDK.git
```

3. run `npm install` in Tonomy-ID-SDK if it fails run it again, then in Tonomy-ID
4. run `sudo cp -R  ../Tonomy-ID-SDK/. ./node_modules/tonomy-id-sdk/` in the `Tonomy-ID` directory
5. run `export NODE_ENV=designonly` to run the app standalone without the backend. for a whole app environment check this repo [link](https://github.com/Tonomy-Foundation/Tonomy-ID-Integration.git)
5. check that you have followed all the steps in the `pre-run build` section
6. change to the `Tonomy-ID` directory and run `npm start`

To do all steps at once:

```bash
git clone -b development https://github.com/Tonomy-Foundation/Tonomy-ID.git
git clone -b development https://github.com/Tonomy-Foundation/Tonomy-ID-SDK.git
cd Tonomy-ID-SDK
npm i
npm i
cd ../Tonomy-ID
npm i
sudo cp -R  ../Tonomy-ID-SDK/. ./node_modules/tonomy-id-sdk/
export NODE_ENV=designonly
npm start
```


## File structure of components

[https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7](https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7)

## Linting

Linting is done with `eslint`. Install the recommended VS Code plugin to see markers in your code.

```bash
npm run lint
```

### Configuration

Set the configuration variables in the desired file in `./src/config`

`config.json` is used by default. Staging config file is chosing based on the value of environment variable `NODE_ENV`

Other environment variables override the values in the config file:

- BLOCKCHAIN_URL

## Error handling

See [errors.ts](./src/utils/errors.ts). All errors have a registered unique code enum.
