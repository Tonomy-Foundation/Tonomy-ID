import { useState, useCallback } from 'react';
import { appStorage } from '../utils/StorageManager/setup';
import { useFocusEffect } from '@react-navigation/native';

function useAppSettings() {
    const [developerMode, setDeveloperMode] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const mode = await appStorage.getDeveloperMode();

                setDeveloperMode(mode);
            };

            fetchData();
        }, [])
    );

    const setDeveloperModeSettings = async (mode: boolean) => {
        setDeveloperMode(mode);
        await appStorage.setDeveloperMode(mode);
    };

    return { developerMode, setDeveloperModeSettings };
}

export default useAppSettings;
