FROM cimg/android:2022.12.1-ndk
# See Android SDK and NDK version here https://circleci.com/developer/images/image/cimg/android

# TODO lock to v16.4.1
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

RUN node -v

COPY . /app
WORKDIR /app

# maybe not needed in the Github action
RUN sudo chmod 777 /app

ENV EXPO_TOKEN=KKfrb8iG413jwIXjYNE1LNMvEW6Z3kME2smuOpvO
ENV NODE_ENV=development

RUN npm run build:prepare

RUN npx eas build --clear-cache --profile "${NODE_ENV}" --platform android --local

RUN find . -name "*.apk"