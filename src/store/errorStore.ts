import create from 'zustand';
import NetInfo from '@react-native-community/netinfo';

export interface ErrorState {
    error?: Error;
    title?: string;
    expected?: boolean;
    onClose?: () => Promise<void>;
    setError: ({
        error,
        title,
        expected,
        onClose,
    }: {
        error: Error;
        title?: string;
        expected?: boolean;
        onClose?: () => Promise<void>;
    }) => void;
    unSetError: () => void;
}

const useErrorStore = create<ErrorState>((set, get) => ({
    error: undefined,
    title: undefined,
    expected: undefined,
    onClose: undefined,
    setError: async ({ error, title = '', expected, onClose }) => {
        set({ error, title, expected, onClose });

        const state = await NetInfo.fetch();

        if (state.isConnected) {
            set({ error, title, expected, onClose });
        } else {
            console.log('Network is off. Error will not be thrown.');
        }
    },
    unSetError: () => {
        set({ error: undefined, title: undefined, expected: undefined });
    },
}));

export default useErrorStore;
