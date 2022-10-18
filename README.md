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

## Pre-run (one time)

1. Create an expo account to build the app. [https://expo.dev/signup](https://expo.dev/signup)
2. Remove the following lines from `app.json`

```json
"extra": {
    "eas": {
        "projectId": "afffe2ee-9f93-4d18-9361-df30429cbd98"
    }
}
```

For future runs, make sure the `projectId` matches the one in [https://expo.dev/](https://expo.dev/) website.

3. (for IOS only) Run `eas device:create` to create a device profile for your phone
4. Run `eas build --profile development --platform ios` (ios) or `eas build --profile development --platform android` (android) to build the app for your phone
5. Return to [https://expo.dev/](https://expo.dev/) and click on the Tonomy ID project build
6. Install the created app on your phone

## Run

1. Install packages with `npm install`.
2. (optional) To run in staging mode call `export NODE_ENV=staging`
3. Run `npm start` to start the development server.
4. Scan the QR via your phone camera to run the app on your phone or login in the installed app on your phone and select the project

## Linting

Linting is done with `eslint`. Install the recommended VS Code plugin to see markers in your code.

```bash
npm run lint
```

### Configuration

Set the configuration variables in the desired file in `./src/config`

`config.json` is used by default. Staging config file is chosing based on the value of environment variable `NODE_ENV`
