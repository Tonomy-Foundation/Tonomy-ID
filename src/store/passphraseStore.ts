import create from 'zustand';
import settings from '../settings';
import { storageFactory } from '../utils/storage';
import RNKeyManager from '../utils/RNKeyManager';
import { User, createUserObject } from '@tonomy/tonomy-id-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PassphraseStoreState {
    user: User;
    passphraseList: string[];
    defaultPassphraseWord: string[]; // Store entered words in an array
    randomWordIndexes: number[];
}

interface PassphraseStoreActions {
    setPassphraseList: () => void;
    setDefaultPassphraseWord: (index: number, word: string) => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
    generate3PassphraseIndexes: () => number[];
    generatePassphraseWordList: () => string[];
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    user: createUserObject(new RNKeyManager(), storageFactory),
    passphraseList: ['', '', '', '', '', ''],
    defaultPassphraseWord: [],
    randomWordIndexes: [],
    generatePassphraseWordList: (): string[] => {
        const { user } = get();

        return user.generateRandomPassphrase();
    },
    setPassphraseList: () => {
        const { generate3PassphraseIndexes, generatePassphraseWordList } = get();

        set({ passphraseList: generatePassphraseWordList() });
        generate3PassphraseIndexes();
    },

    setDefaultPassphraseWord: (index, word) => {
        const { defaultPassphraseWord } = get();

        defaultPassphraseWord[index] = word;
        set({ defaultPassphraseWord });
    },
    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        return passphraseList[index] === word;
    },
    generate3PassphraseIndexes: (): number[] => {
        const { passphraseList } = get();
        const randomWordIndexesList = [] as number[];

        while (randomWordIndexesList.length < 3) {
            const randomNumber = Math.floor(Math.random() * 6);

            if (!randomWordIndexesList.includes(randomNumber)) {
                randomWordIndexesList.push(randomNumber);
            }
        }

        set({ randomWordIndexes: randomWordIndexesList });

        if (!settings.isProduction()) {
            const defaultPassphraseWord = randomWordIndexesList.map((randomIndex) => passphraseList[randomIndex]);

            set({ defaultPassphraseWord });
        }

        return randomWordIndexesList;
    },
}));

export default usePassphraseStore;
