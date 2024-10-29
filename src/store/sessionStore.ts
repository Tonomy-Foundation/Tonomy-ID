import { create } from 'zustand';
import { WalletConnectSession } from '../utils/session/walletConnect';

interface SessionState {
    walletConnectSession: WalletConnectSession | null;
    setWalletConnectSession: (session: WalletConnectSession) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    walletConnectSession: null,
    setWalletConnectSession: (session: WalletConnectSession) => set({ walletConnectSession: session }),
}));
