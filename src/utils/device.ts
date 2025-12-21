import { Platform, Dimensions } from 'react-native';

export const isIpad = Platform.OS === 'ios' && Dimensions.get('window').width >= 768;

export const isPlatformAndroid = Platform.OS === 'android' ? true : false;
