import { create } from 'zustand';
import { WalletConnectSession } from '../utils/session/walletConnect';
import { AntelopeSession } from '../utils/session/antelope';

interface SessionState {
    walletConnectSession: WalletConnectSession | null;
    antelopeSession: AntelopeSession | null;
    initializeSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    walletConnectSession: null,
    antelopeSession: null,
    initializeSession: async () => {
        const walletConnectSession = new WalletConnectSession();

        await walletConnectSession.initialize();
        walletConnectSession.onEvent();

        const antelopeSession = new AntelopeSession();

        await antelopeSession.initialize();
        // Set the session in the store
        set({ walletConnectSession, antelopeSession });
    },
}));
