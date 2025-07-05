import { App, DualWalletRequests } from '@tonomy/tonomy-id-sdk';
import { create } from 'zustand';

interface AuthState {
    ssoApp: App | null;
    receivedVia: string | null;
    dualRequests: DualWalletRequests | null;
    setSsoApp: (app: App) => void;
    setDualRequests: (requests: DualWalletRequests) => void;
    setReceivedVia: (receivedVia: string) => void;
    clearAuth: () => void;
}

export const useVerificationStore = create<AuthState>((set) => ({
    ssoApp: null,
    dualRequests: null,
    receivedVia: null,
    setSsoApp: (app: App) => set({ ssoApp: app }),
    setDualRequests: (requests: DualWalletRequests) => set({ dualRequests: requests }),
    setReceivedVia: (receivedVia: string) => set({ receivedVia }),
    clearAuth: () => set({ ssoApp: null, dualRequests: null, receivedVia: null }),
}));
