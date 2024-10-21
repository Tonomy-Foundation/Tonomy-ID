import React, { createContext, useState, useEffect, useContext } from 'react';
import { appStorage } from '../utils/StorageManager/setup';

interface AppSettingsContextType {
    developerMode: boolean;
    setDeveloperModeSettings: (mode: boolean) => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [developerMode, setDeveloperModeState] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const mode = await appStorage.getDeveloperMode();
            setDeveloperModeState(mode);
        };
        fetchData();
    }, []);

    const setDeveloperModeSettings = async (mode: boolean) => {
        setDeveloperModeState(mode);
        await appStorage.setDeveloperMode(mode);
    };

    return (
        <AppSettingsContext.Provider value={{ developerMode, setDeveloperModeSettings }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
};
