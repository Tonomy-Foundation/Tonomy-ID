import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistentStorage } from 'tonomy-id-sdk';

export default class Storage implements PersistentStorage {
    [x: string]: any;
    scope: string;

    constructor(scope: string) {
        this.scope = scope;
    }

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

export function storageFactory(scope: string): PersistentStorage {
    return new Storage(scope);
}
