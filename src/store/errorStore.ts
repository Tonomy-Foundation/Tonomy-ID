import create from 'zustand';

interface ErrorState {
    error: Error | null;
    setError: (error: Error) => void;
    unSetError: () => void;
}

const useErrorStore = create<ErrorState>((set, get) => ({
    error: null,
    setError: (error: Error) => {
        set({ error });
    },
    unSetError: () => {
        set({ error: null });
    },
}));

export default useErrorStore;
