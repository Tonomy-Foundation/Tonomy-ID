import { create } from 'zustand';
import Core from '@walletconnect/core';
import Web3Wallet from '@walletconnect/web3wallet';

//Structure for WalletConnect protocol
interface WalletConnectProtocol {
    web3wallet: Web3Wallet | null;
    core: Core | null;
    initialized: boolean;
    setWalletConnectState: (state: { web3wallet: Web3Wallet; core: Core; initialized: boolean }) => void;
}

// Define the structure for the whole session store
interface SessionStore {
    protocols: {
        WalletConnect: WalletConnectProtocol;
        // Add additional protocols
    };
}
const useSessionStore = create<SessionStore>((set) => ({
    protocols: {
        WalletConnect: {
            web3wallet: null,
            core: null,
            initialized: false,
            setWalletConnectState: ({ web3wallet, core, initialized }) =>
                set((state) => ({
                    protocols: {
                        ...state.protocols,
                        WalletConnect: {
                            ...state.protocols.WalletConnect,
                            web3wallet,
                            core,
                            initialized,
                        },
                    },
                })),
        },
        // Additional protocols can be added here
    },
}));

export default useSessionStore;
