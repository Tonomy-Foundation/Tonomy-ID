import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistantStorage } from 'tonomy-id-sdk';

export default class Storage implements PersistantStorage {


  async retrieve(key: string): Promise<any> {
    const data = await AsyncStorage.getItem(key);
    return data;
  }

  async store(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }


}