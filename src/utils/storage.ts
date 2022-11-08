import AsyncStorage from '@react-native-async-storage/async-storage';
import settings from '../settings';
import { PersistantStorage as PersistentStorage } from 'tonomy-id-sdk';

export default class Storage implements PersistentStorage {
    [x: string]: any;

    async retrieve(key: string): Promise<any> {
        const data = await AsyncStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data);
    }

    async store(key: string, value: any): Promise<void> {
        const str = JSON.stringify(value);
        await AsyncStorage.setItem(key, str);
    }

    async clear(): Promise<void> {
        await AsyncStorage.clear();
    }
}
