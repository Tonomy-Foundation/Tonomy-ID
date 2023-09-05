import create from 'zustand';

interface PassphraseStoreState {
    passphraseList: string[];
    thirdWord: string;
    firstWord: string;
}

interface PassphraseStoreActions {
    setPassphraseList: (newList: string[]) => void;
    setThirdWord: (thirdWord: string) => void;
    setFirstWord: (firstWord: string) => void;
    checkWordAtIndex: (index: number, word: string) => boolean;
}

type PassphraseStore = PassphraseStoreState & PassphraseStoreActions;

const usePassphraseStore = create<PassphraseStore>((set, get) => ({
    passphraseList: ['', '', '', '', '', ''],
    thirdWord: '',
    firstWord: '',
    setPassphraseList: (newList) => set({ passphraseList: newList }),
    setThirdWord: (word) => set({ thirdWord: word }),
    setFirstWord: (word) => set({ firstWord: word }),
    checkWordAtIndex: (index, word) => {
        const { passphraseList } = get();

        console.log('passphrase', passphraseList, passphraseList[index - 1], word);
        return passphraseList[index - 1] === word;
    },
}));

export default usePassphraseStore;
