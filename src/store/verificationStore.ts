import { App, DualWalletRequests } from '@tonomy/tonomy-id-sdk';
import { create } from 'zustand';

interface AuthState {
    ssoApp: App | null;
    receivedVia: string | null;
    dualRequests: DualWalletRequests | null;

    isUsernameRequested: boolean;
    setSsoApp: (app: App) => void;
    setUsernameRequested: (isRequested: boolean) => void;
    setDualRequests: (requests: DualWalletRequests) => void;
    setReceivedVia: (receivedVia: string) => void;
    clearAuth: () => void;
}

export const useVerificationStore = create<AuthState>((set) => ({
    ssoApp: null,
    dualRequests: null,
    receivedVia: null,
    isUsernameRequested: false,
    setSsoApp: (app: App) => set({ ssoApp: app }),
    setDualRequests: (requests: DualWalletRequests) => set({ dualRequests: requests }),
    setUsernameRequested: (isRequested: boolean) => set({ isUsernameRequested: isRequested }),
    setReceivedVia: (receivedVia: string) => set({ receivedVia }),
    clearAuth: () => set({ ssoApp: null, dualRequests: null, receivedVia: null }),
}));
