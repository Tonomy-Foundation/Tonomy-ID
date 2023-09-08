import create from 'zustand';
import settings from '../settings';
import { lib } from '@tonomy/tonomy-id-sdk';

interface PassphraseStoreState {
    passphraseList: string[];
    randomWordIndexes: number[];
}

interface PassphraseStoreActions {
    setPassphraseList: () => void;
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

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: !settings.isProduction()
        ? ['above', 'day', 'fever', 'lemon', 'piano', 'sport']
        : lib.generateRandomKeywords(),
    randomWordIndexes: generate3PassphraseIndexes(),
    setPassphraseList: () => {
        set({ passphraseList: lib.generateRandomKeywords() });
        get().set3PassphraseIndexes();
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
