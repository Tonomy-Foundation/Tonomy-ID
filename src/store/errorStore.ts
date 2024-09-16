import { create } from 'zustand';

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
    setError: async ({ error, title = 'Something went wrong', expected, onClose }) => {
        if (typeof error === 'string') {
            set({ error: new Error(error), title, expected, onClose });
        } else if (!(error instanceof Error)) {
            console.error('The provided error is not an instance of Error', error);
            set({ error: new Error('Unexpected Error'), title, expected, onClose });
        } else set({ error, title, expected, onClose });
    },
    unSetError: () => {
        set({ error: undefined, title: undefined, expected: undefined });
    },
}));

export default useErrorStore;
