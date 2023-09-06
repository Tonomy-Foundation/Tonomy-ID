import create from 'zustand';
import settings from '../settings';
import { generateRandomKeywords } from '@tonomy/tonomy-id-sdk/src/sdk/util/passphrase';
import { randomNumber } from '@tonomy/tonomy-id-sdk/src/sdk/util/crypto';

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
    passphraseList: !settings.isProduction()
        ? ['above', 'day', 'fever', 'lemon', 'piano', 'sport']
        : get().generatePassphraseWordList(),
    randomWordIndexes: get().generate3PassphraseIndexes(),
    generatePassphraseWordList: (): string[] => {
        return generateRandomKeywords();
    },
    setPassphraseList: () => {
        const { generate3PassphraseIndexes, generatePassphraseWordList } = get();

        set({ passphraseList: generatePassphraseWordList() });
        generate3PassphraseIndexes();
    },

    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        return passphraseList[index] === word;
    },
    generate3PassphraseIndexes: (): number[] => {
        const { passphraseList } = get();
        const randomWordIndexesList = [] as number[];

        while (randomWordIndexesList.length < 3) {
            const randomValue = randomNumber(0, 5);

            if (!randomWordIndexesList.includes(randomValue)) {
                randomWordIndexesList.push(randomValue);
            }
        }

        console.log('randomvalue', randomWordIndexesList);
        set({ randomWordIndexes: randomWordIndexesList });

        if (!settings.isProduction()) {
            const defaultPassphraseWord = randomWordIndexesList.map((randomIndex) => passphraseList[randomIndex]);

            set({ defaultPassphraseWord });
        }

        return randomWordIndexesList;
    },
}));

export default usePassphraseStore;
