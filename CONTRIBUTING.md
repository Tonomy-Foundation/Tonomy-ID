# Tonomy-ID Contributor's Guide
A big welcome and thank you for considering contributing to Tonomy! It is people like you that help shape the future where your identity is in your hands.

Reading and following these guidelines will help us make the contribution process easy and effective for everyone involved. It also communicates that you respect the time of the developers managing and developing these open source projects. In return, we will reciprocate this by adressing your issue, assessing changes and helping you finalize your pull requests.

## Quicklinks
* [Getting Started](#getting-started)
    * [Tonomy ID Workshop](#tonomy-id-workshop)
    * [Design](#design)
    * [Software Repositories](#software-repositories)
    * [Integration](#integration)
    * [General Practices](#general-practices)
* [Issues](#issues)
* [Pull Requests](#pull-requests)
* [Getting Help](#getting-help)
#
## Getting Started

### Tonomy ID Workshop
https://www.loom.com/share/d29cda0913bf4f569ed501aee76c5337

### Design
https://www.figma.com/file/cvV48t0f7O2znT6QBxK0Zj/Tonomy-ID

### Software Repositories
We use the Ubuntu 20.04 / 22.04 environments. Please use them, as Windows is not suggested & Mac is untested. 
If you have a Windows PC, it's suggested to install VirtualBox.

### Integration
[Integration Repo](https://github.com/Tonomy-Foundation/Tonomy-ID-Integration)

 * Follow these steps one by one & read them carefully. Do not rush through it.
    * Clone the repo
    * `git checkout development`
    * go through [this](https://github.com/Tonomy-Foundation/Tonomy-ID-Integration/blob/development/scripts/install_prerequisits.sh) script, line by line, and install the dependencies you don't have.
    * `./app.sh` and read what each command does
    * `./app.sh gitinstall`
    * `./app.sh install`
    * `./app.sh init`
    * Now, you can do one of the following;
        * `./app.sh start`
            * Check out the links shown
            * Scan the QR code with the expo app
        * `./app.sh test` or `./app.sh test all`
        * `./app.sh log eosio`
        * `./app.sh stop` or `./app.sh reset` or `./app.sh reset all`


For visual aid, a recording of a full walkthrough with a junior dev can be found [here](https://www.loom.com/share/f44be75ce80044a08a73c53ea64a3afd)

A recording which explains how it all works, and how to run tests can be found [here](https://www.loom.com/share/8566b834759742309ebc96c74e955767)

* [ID (React native app)](https://github.com/Tonomy-Foundation/Tonomy-ID)
    * [Directory Structure](https://learn.habilelabs.io/best-folder-structure-for-react-native-project-a46405bdba7)
* [SDK](https://github.com/Tonomy-Foundation/Tonomy-ID-SDK)
* [Contracts](https://github.com/Tonomy-Foundation/Tonomy-Contracts)
* [Demo](https://github.com/Tonomy-Foundation/Tonomy-ID-Demo)

### General practices
* The JavaScript variables capital convention is [CamelCase](https://textcaseconvert.com/blog/what-is-camel-case/)

#
### Issues
Issues should be used to report problems with the library, request a new feature, or to discuss potential changes before a PR is created. 

If you find an issue that adresses the problems you're having, please add your own reproduction information to the existing issue rather than creating a new one. Adding a [reaction](link) can also help with indicating to our maintainers and developers.

### Pull Requests
PRs are the best and quickest way to get your fix, improvement or feature merged. In general, PRs should:

- Only fix/add the functionality in the issue
- Address a single concern in the least number of changed lines as possible

#
## Getting Help
Send a message to contact@tonomy.foundation for help.
