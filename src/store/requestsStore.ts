import create from 'zustand';
import { CheckedRequest } from '@tonomy/tonomy-id-sdk';

export interface RequestsState {
    checkedRequests?: CheckedRequest[];
    setCheckedRequests: (checkedRequests: CheckedRequest[]) => void;
    clearCheckedRequests: () => void;
}

const useRequestsStore = create<RequestsState>((set, get) => ({
    checkedRequests: undefined,
    setCheckedRequests: (checkedRequests) => set({ checkedRequests }),
    clearCheckedRequests: () => set({ checkedRequests: undefined }),
}));

export default useRequestsStore;
