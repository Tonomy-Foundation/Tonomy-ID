import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistantStorage } from 'tonomy-id-sdk';

export default class Storage implements PersistantStorage {
  [x: string]: any;

  async retrieve(key: string): Promise<any> {
    const data = await AsyncStorage.getItem(key);
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
