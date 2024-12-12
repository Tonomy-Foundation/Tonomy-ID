import { create } from 'zustand';
import Debug from 'debug';
import { serializeAny } from '../utils/strings';

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
        error: Error | unknown;
        title?: string;
        expected?: boolean;
        onClose?: () => Promise<void>;
    }) => {
        debug('setError', error instanceof Error ? error.message : error);
        const currentState = get();

        // Only show an error if it is not already shown
        if (currentState.error || currentState.title) {
            debug('Error already set', currentState);
            return;
        }

        const newError = error instanceof Error ? error : new Error(serializeAny(error));

        set((state) => {
            if (
                state.error?.message !== newError.message ||
                state.title !== title ||
                state.expected !== expected ||
                state.onClose !== onClose
            ) {
                return { error: newError, title, expected, onClose };
            }

            return state; // No change, do not update state
        });
    },
    unSetError: () => {
        debug('unSetError');
        set({ error: undefined, title: undefined, expected: undefined, onClose: undefined });
    },
}));

export default useErrorStore;
