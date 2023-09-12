import create from 'zustand';
import settings from '../settings';
import { util } from '@tonomy/tonomy-id-sdk';
import { ApplicationErrors, throwError } from '../utils/errors';

interface PassphraseStoreState {
    passphraseList: string[];
    randomWordIndexes: number[];
}

interface PassphraseStoreActions {
    getPassphrase: () => string;
    generatePassphraseList: () => void;
    unsetPassphraseList: () => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

function generate3PassphraseIndexes(): number[] {
    const randomWordIndexesList = [] as number[];

    while (randomWordIndexesList.length < 3) {
        const randomValue = util.randomNumber(0, 5);

        if (!randomWordIndexesList.includes(randomValue)) {
            randomWordIndexesList.push(randomValue);
        }
    }

    return randomWordIndexesList;
}

export const DEFAULT_DEV_PASSPHRASE_LIST = ['above', 'day', 'fever', 'lemon', 'piano', 'sport'];

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: settings.isProduction() ? util.generateRandomKeywords() : DEFAULT_DEV_PASSPHRASE_LIST,
    randomWordIndexes: generate3PassphraseIndexes(),
    getPassphrase: () => {
        const list = get().passphraseList;

        if (list.length === 0) {
            throwError('Passphrase list is empty', ApplicationErrors.NoDataFound);
        }

        return list.join(' ');
    },
    generatePassphraseList: () => {
        set({ passphraseList: util.generateRandomKeywords() });
        const randomWordIndexesList = generate3PassphraseIndexes();

        set({ randomWordIndexes: randomWordIndexesList });
    },
    unsetPassphraseList: () => {
        set({ passphraseList: settings.isProduction() ? [] : DEFAULT_DEV_PASSPHRASE_LIST });
    },
    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        return passphraseList[index] === word;
    },
}));

export default usePassphraseStore;
