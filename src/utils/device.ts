import { Platform, Dimensions } from 'react-native';

export const isIpad = Platform.OS === 'ios' && Dimensions.get('window').width >= 768;
