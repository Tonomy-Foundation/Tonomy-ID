import { create } from 'zustand';
import { WalletConnectSession } from '../utils/session/walletConnect';

interface SessionState {
    walletConnectSession: WalletConnectSession | null;
    initializeSessions: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    walletConnectSession: null,
    initializeSessions: () => {
        const walletConnectSession = new WalletConnectSession();

        // Initialize other sessions here i.e antelope, pangea
        set({ walletConnectSession });
    },
}));
