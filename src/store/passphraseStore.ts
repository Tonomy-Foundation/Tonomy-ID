import create from 'zustand';
import settings from '../settings';
import { lib } from '@tonomy/tonomy-id-sdk';

const { generateRandomKeywords, randomNumber } = lib;

interface PassphraseStoreState {
    passphraseList: string[];
    randomWordIndexes: number[];
}

interface PassphraseStoreActions {
    setPassphraseList: () => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
    generate3PassphraseIndexes: () => number[];
    generatePassphraseWordList: () => string[];
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: ['', '', '', '', '', ''],
    randomWordIndexes: [],
    generatePassphraseWordList: (): string[] => {
        return generateRandomKeywords();
    },
    setPassphraseList: () => {
        const { generate3PassphraseIndexes, generatePassphraseWordList } = get();
        let passphrase6Words;

        if (!settings.isProduction()) {
            passphrase6Words = ['above', 'day', 'fever', 'lemon', 'piano', 'sport'];
        } else passphrase6Words = generatePassphraseWordList();
        set({ passphraseList: passphrase6Words });
        generate3PassphraseIndexes();
    },

    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        return passphraseList[index] === word;
    },
    generate3PassphraseIndexes: (): number[] => {
        const randomWordIndexesList = [] as number[];

        while (randomWordIndexesList.length < 3) {
            const randomValue = randomNumber(0, 5);

            if (!randomWordIndexesList.includes(randomValue)) {
                randomWordIndexesList.push(randomValue);
            }
        }

        set({ randomWordIndexes: randomWordIndexesList });

        return randomWordIndexesList;
    },
}));

export default usePassphraseStore;
