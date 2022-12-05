import create from 'zustand';

interface ErrorState {
    error: Error | undefined;
    setError: (error: Error) => void;
    unSetError: () => void;
}

const useErrorStore = create<ErrorState>((set, get) => ({
    error: undefined,
    setError: (error: Error) => {
        set({ error });
    },
    unSetError: () => {
        set({ error: undefined });
    },
}));

export default useErrorStore;
