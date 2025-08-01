import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Debug from 'debug';
import { connect } from '../utils/StorageManager/setup';
import TSpinner from '../components/atoms/TSpinner';
import useErrorStore from '../store/errorStore';
import settings from '../settings';
import { runTests } from '../utils/runtimeTests';

const debug = Debug('tonomy-id:providers:InitializeApp');

const InitializeAppProvider: React.FC = () => {
    const [RootNavigation, setRootNavigation] = useState<React.ComponentType | null>(null);

    const { setError } = useErrorStore();

    useEffect(() => {
        const initialize = async () => {
            try {
                debug('App setup started');

                await connect();
                debug('Storage connected');
                // need import dynamically, to ensure that it's sub-components do not call getSettings()
                // from @tonomy/tonomy-id-sdk before setSettings() is called, or try connect to storage before
                // it's connected
                // @ts-expect-error dynamic imports only supported in ESM
                const { default: Root } = await import('../navigation/Root');

                debug('Root navigation loaded');

                setRootNavigation(() => Root);
            } catch (error) {
                setError({
                    error,
                    title: 'App Setup Failed',
                    expected: false,
                });
            }
        };

        const runRuntimeTests = async () => {
            try {
                if (settings.isProduction()) return;
                await runTests();
            } catch (error) {
                setError({
                    error,
                    title: 'Runtime Test Failed',
                    expected: false,
                });
            }
        };

        initialize();
        runRuntimeTests();
    }, [setError]);

    if (!RootNavigation) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TSpinner />
            </View>
        );
    }

    return <RootNavigation />;
};

export default InitializeAppProvider;
