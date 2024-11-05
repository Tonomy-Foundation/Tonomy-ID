import { create } from 'zustand';
import { WalletConnectSession } from '../utils/session/walletConnect';

interface SessionState {
    walletConnectSession: WalletConnectSession | null;
    initializeSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    walletConnectSession: null,

    initializeSession: async () => {
        const currentWalletSession = get().walletConnectSession;

        // Create and configure the WalletConnectSession object
        if (currentWalletSession && currentWalletSession.initialized) {
            console.log('initializeWalletState() Already initialized');
        } else {
            const walletConnectSession = new WalletConnectSession();

            await walletConnectSession.initialize();
            walletConnectSession.onEvent();

            // Set the session in the store
            set({ walletConnectSession });
        }
    },
}));
