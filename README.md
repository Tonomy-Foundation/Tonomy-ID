# Tonomy-ID

Tonomy ID is the cross-platform mobile wallet (Android and iOS) for public and private EOSIO blockchains. This application allows you to sign transactions on the block chain, share your DID and Verifiable Credentials containing your identity with others in a consensual way and log into web2 and web3 applications. If you lose your phone several mechanisms exist to allow you to recover your account without trusting anyone with custody of your private keys.

Tonomy ID is a React Native application in typescript.

Features:

1. EOSIO blockchain tx signing
2. EOSIO blockchain multi-sig signing
3. Social recovery
4. Hardware recovery
5. Security question recovery
6. Non-custodial third party recovery ("guardians in Wallet+ paper)
7. Verifiable Credential sharing
8. Peer-to-peer EOSIO account communication network
9. SSO login to web2 and web3 applications
10. Sovereign data cloud storage (client-side encrypted using a recoverable key)

## Dependancies

- [Expo](https://expo.dev)  v45.0.0
- Linux debian distribution (Ubuntu 20.0.4 LTS used)
- [Nodejs](https://nodejs.org) v16.4.1+ suggested installed with [nvm](https://github.com/nvm-sh/nvm)
- [Eas-cli](https://docs.expo.dev/workflow/expo-cli/) v2.2.1 globally installed with npm

## Pre-run build (first time and each time new RN only packages are installed)

This is to create an expo build so you can down an `.apk` or `.ipa` file from [https://expo.dev](https://expo.dev) which you can use to run the app.

1. Create an expo account to build the app. [https://expo.dev/signup](https://expo.dev/signup)
2. Move to the Tonomy-ID directory `cd ./Tonomy-ID`
3. Remove the following lines from `app.json`

```json
    "extra": {
      "eas": {
        "projectId": "afffe2ee-9f93-4d18-9361-df30429cbd98"
      }
    }
```

4. (for IOS only) Run `eas device:create` to create a device profile for your phone
5. Run `eas build --profile development --platform ios` (ios) or `eas build --profile development --platform android` (android) to build the app for your phone
6. Return to [https://expo.dev/](https://expo.dev/) and click on the Tonomy ID project build
7. Install the created app on your phone


## Linting

Linting is done with `eslint`. Install the recommended VS Code plugin to see markers in your code.

```bash
npm run lint
```

### Configuration

Set the configuration variables in the desired file in `./src/config`

`config.json` is used by default. Staging config file is chosing based on the value of environment variable `NODE_ENV`

## Error handling

See [errors.ts](./src/utils/errors.ts). All errors have a registered unique code. All errors are either expected or unexpected, depending on weather the user will create the error, or somethig has gone wrong nothing to do with the user. This helps us distinguish errors that we should fix as developers. Please maintain the list of files and their error code numeration in [errors.ts](./src/utils/errors.ts).

# Standalone run

1. clone the [tonomy id](https://github.com/Tonomy-Foundation/Tonomy-ID.git) repo and change the branch to `development` or run 
```bash
git clone -b development https://github.com/Tonomy-Foundation/Tonomy-ID.git
```
2. clone the [tonomy id sdk](https://github.com/Tonomy-Foundation/Tonomy-ID-SDK.git) repo and change the branch to `development` or run 

```bash
git clone -b development https://github.com/Tonomy-Foundation/Tonomy-ID-SDK.git
```

3. run `npm install` in both repos if it fails run it again
4. run `sudo cp -R  ../Tonomy-ID-SDK/. ./node_modules/tonomy-id-sdk/` in the `Tonomy-ID` directory
5. run `export NODE_ENV=designonly` to run the app standalone without the backend. for a whole app environment check this repo [link](https://github.com/Tonomy-Foundation/Tonomy-ID-Integration.git)
5. check that you have followed all the steps in the `pre-run build` section
6. change to the `Tonomy-ID` directory and run `npm start` 