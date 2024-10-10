import { useState, useEffect } from 'react';
import { appStorage } from '../utils/StorageManager/setup';

function useAppSettings() {
    const [developerMode, setDeveloperMode] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const mode = await appStorage.getDeveloperMode();

            setDeveloperMode(mode);
        };

        fetchData();
    }, []);

    const setDeveloperModeSettings = async (mode: boolean) => {
        setDeveloperMode(mode);
        await appStorage.setDeveloperMode(mode);
    };

    return { developerMode, setDeveloperModeSettings };
}

export default useAppSettings;
