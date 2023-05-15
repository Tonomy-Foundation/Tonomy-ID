import create from 'zustand';

export interface ErrorState {
    error?: Error;
    title?: string;
    expected?: boolean;
    setError: ({ error, title, expected }: { error: Error; title?: string; expected?: boolean }) => void;
    unSetError: () => void;
}

const useErrorStore = create<ErrorState>((set, get) => ({
    error: undefined,
    title: undefined,
    expected: undefined,
    setError: ({ error, title, expected }) => {
        set({ error, title, expected });
    },
    unSetError: () => {
        set({ error: undefined, title: undefined, expected: undefined, onClose: undefined });
    },
}));

export default useErrorStore;
