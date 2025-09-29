import { useState, useCallback } from 'react';
import { appStorage } from '../utils/StorageManager/setup';
import { useFocusEffect } from '@react-navigation/native';
import useErrorStore from './errorStore';
import { toggleDebugLogs } from '../utils/debug';

function useAppSettings() {
    const [developerMode, setDeveloperMode] = useState<boolean>(false);
    const errorStore = useErrorStore();

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    const mode = await appStorage.getDeveloperMode();

                    setDeveloperMode(mode);
                } catch (error) {
                    errorStore.setError({ error, expected: false });
                }
            };

            fetchData();
        }, [errorStore])
    );

    const setDeveloperModeSettings = async (mode: boolean) => {
        try {
            setDeveloperMode(mode);
            toggleDebugLogs(mode);
            await appStorage.setDeveloperMode(mode);
        } catch (error) {
            errorStore.setError({ error, expected: false });
        }
    };

    return { developerMode, setDeveloperModeSettings };
}

export default useAppSettings;
