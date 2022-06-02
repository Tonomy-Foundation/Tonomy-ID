#!/bin/bash

# Ubuntu 20 machine

sudo apt update

# nvm with node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
## Close and open terminal again
nvm install v16.4.1

# Install Android studio. Follow instructions here: https://reactnative.dev/docs/environment-setup

## Java
sudo apt install openjdk-11-jdk -y

## Android studio
sudo add-apt-repository ppa:maarten-fonville/android-studio -y
sudo apt update
sudo apt install android-studio -y

sudo apt install watchman -y

cat .bash_profile >> ~/.bash_profile
source ~/.bash_profile
echo $ANDROID_SDK_ROOT
echo $PATH