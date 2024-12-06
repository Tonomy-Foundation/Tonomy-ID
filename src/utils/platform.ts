// platform.ts
import { Linking, Platform } from 'react-native';

export async function redirectToMobileBrowser(url: string): Promise<void> {
    // Detect if the user is on an iOS or Android device using React Native's Platform module
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';

    // console.log('Device', Device.deviceType);
    // Detect if the user is on a mobile browser
    const userAgent = navigator.userAgent || navigator.vendor;

    const isMobileBrowser = /android|iPad|iPhone|iPod/.test(userAgent);

    console.log('isMobileBrowser');

    if ((isIOS || isAndroid) && isMobileBrowser) {
        // Redirect to the device's default browser by opening the URL
        await Linking.openURL(url);
    } else {
        console.log('No need to redirect. Not on a mobile device.');
    }
}
