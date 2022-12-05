import create from 'zustand';

interface ErrorState {
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
        set({ error: undefined, title: undefined, expected: undefined });
    },
}));

export default useErrorStore;
