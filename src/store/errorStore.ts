import create from 'zustand';

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
    setError: ({ error, title = '', expected, onClose }) => {
        set({ error, title, expected, onClose });
    },
    unSetError: () => {
        set({ error: undefined, title: undefined, expected: undefined });
    },
}));

export default useErrorStore;
