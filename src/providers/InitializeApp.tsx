import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DebugAndLog from '../utils/debug';
import { connect } from '../utils/StorageManager/setup';
import TSpinner from '../components/atoms/TSpinner';
import useErrorStore from '../store/errorStore';
import settings from '../settings';
import { runTests } from '../utils/runtime-tests';

const debug = DebugAndLog('tonomy-id:providers:InitializeApp');

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
                const { default: Root } = await import('../navigation/Root');

                debug('Root navigation loaded');
                console.log('Root:', Root);

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
                    title: 'Runtime Tests Failed',
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
