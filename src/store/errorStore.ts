import { create } from 'zustand';
import Debug from 'debug';

const debug = Debug('tonomy-id:store:errorStore');

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
    setError: async ({
        error,
        title = 'Something went wrong',
        expected,
        onClose,
    }: {
        error: Error;
        title?: string;
        expected?: boolean;
        onClose?: () => Promise<void>;
    }) => {
        debug('setError', error);
        set({ error, title, expected, onClose });
    },
    unSetError: () => {
        debug('unSetError');
        set({ error: undefined, title: undefined, expected: undefined, onClose: undefined });
    },
}));

export default useErrorStore;
