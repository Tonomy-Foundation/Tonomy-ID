# for android studio
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

# extra android step
# https://stackoverflow.com/questions/38835931/react-native-adb-reverse-enoent
export ANDROID_HOME=~/Android/Sdk