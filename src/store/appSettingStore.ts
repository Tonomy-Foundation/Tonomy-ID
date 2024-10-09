import { create } from 'zustand';
import { appStorage } from '../utils/StorageManager/setup'; // Update with the correct import path

interface AppSettingsState {
    developerMode: boolean;
    setDeveloperMode: (mode: boolean) => void;
    getDeveloperMode: () => Promise<boolean>;
}

export const appSettingStore = create<AppSettingsState>((set) => ({
    developerMode: false,

    setDeveloperMode: (mode) => {
        set({ developerMode: mode });
        appStorage.setDeveloperMode(mode);
    },

    getDeveloperMode: async () => {
        const developerSetting = await appStorage.getDeveloperMode();

        return developerSetting;
    },
}));
