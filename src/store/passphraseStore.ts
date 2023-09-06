import create from 'zustand';
import settings from '../settings';

interface PassphraseStoreState {
    passphraseList: string[];
    enteredWords: string[]; // Store entered words in an array
    randomNumbers: number[];
}

interface PassphraseStoreActions {
    setPassphraseList: (newList: string[]) => void;
    setEnteredWord: (index: number, word: string) => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
    generateRandomNumbers: () => void;
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: ['', '', '', '', '', ''],
    enteredWords: [], // Initialize as an empty array
    randomNumbers: [],
    setPassphraseList: (newList) => set({ passphraseList: newList }),
    setEnteredWord: (index, word) => {
        const { enteredWords } = get();

        enteredWords[index] = word;
        set({ enteredWords });
    },
    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        console.log('index', passphraseList[index], word);
        return passphraseList[index] === word;
    },
    generateRandomNumbers: () => {
        const { passphraseList } = get();
        const randomNumbersList = [] as number[];

        while (randomNumbersList.length < 3) {
            const randomNumber = Math.floor(Math.random() * 6);

            if (!randomNumbersList.includes(randomNumber)) {
                randomNumbersList.push(randomNumber);
            }
        }

        console.log('random', randomNumbersList);
        set({ randomNumbers: randomNumbersList });

        if (!settings.isProduction()) {
            const enteredWords = randomNumbersList.map((randomIndex) => passphraseList[randomIndex]);

            set({ enteredWords });
        }
    },
}));

export default usePassphraseStore;
