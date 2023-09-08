import create from 'zustand';
import settings from '../settings';
import { lib } from '@tonomy/tonomy-id-sdk';

interface PassphraseStoreState {
    passphraseList: string[];
    randomWordIndexes: number[];
}

interface PassphraseStoreActions {
    getPassphrase: () => string;
    generatePassphraseList: () => void;
    unsetPassphraseList: () => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
    set3PassphraseIndexes: () => void;
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

function generate3PassphraseIndexes(): number[] {
    const randomWordIndexesList = [] as number[];

    while (randomWordIndexesList.length < 3) {
        const randomValue = lib.randomNumber(0, 5);

        if (!randomWordIndexesList.includes(randomValue)) {
            randomWordIndexesList.push(randomValue);
        }
    }

    return randomWordIndexesList;
}

export const DEFAULT_DEV_PASSPHRASE_LIST = ['above', 'day', 'fever', 'lemon', 'piano', 'sport'];

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: !settings.isProduction() ? DEFAULT_DEV_PASSPHRASE_LIST : lib.generateRandomKeywords(),
    randomWordIndexes: generate3PassphraseIndexes(),
    getPassphrase: () => {
        const list = get().passphraseList;

        if (list.length === 0) {
            throw new Error('Passphrase list is empty');
        }

        return list.join(' ');
    },
    generatePassphraseList: () => {
        set({ passphraseList: lib.generateRandomKeywords() });
        get().set3PassphraseIndexes();
    },
    unsetPassphraseList: () => {
        set({ passphraseList: [] });
    },
    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        return passphraseList[index] === word;
    },
    set3PassphraseIndexes: () => {
        const randomWordIndexesList = generate3PassphraseIndexes();

        set({ randomWordIndexes: randomWordIndexesList });
    },
}));

export default usePassphraseStore;
