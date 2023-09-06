import create from 'zustand';
import settings from '../settings';

interface PassphraseStoreState {
    passphraseList: string[];
    firstWord: string;
    secondWord: string;
    thirdWord: string;
    randomNumbers: number[];
}

interface PassphraseStoreActions {
    setPassphraseList: (newList: string[]) => void;
    setFirstWord: (firstWord: string) => void;
    setSecondWord: (secondWord: string) => void;
    setThirdWord: (thirdWord: string) => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
    generateRandomNumbers: () => void;
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: ['', '', '', '', '', ''],
    firstWord: '',
    secondWord: '',
    thirdWord: '',
    randomNumbers: [],
    setPassphraseList: (newList) => set({ passphraseList: newList }),
    setFirstWord: (word) => set({ firstWord: word }),
    setSecondWord: (word) => set({ secondWord: word }),
    setThirdWord: (word) => set({ thirdWord: word }),

    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

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

        set({ randomNumbers: randomNumbersList });

        if (!settings.isProduction()) {
            set({ firstWord: passphraseList[randomNumbersList[0]] });
            set({ secondWord: passphraseList[randomNumbersList[1]] });
            set({ thirdWord: passphraseList[randomNumbersList[2]] });
        } else {
            set({ firstWord: '' });
            set({ secondWord: '' });
            set({ thirdWord: '' });
        }
    },
}));

export default usePassphraseStore;
