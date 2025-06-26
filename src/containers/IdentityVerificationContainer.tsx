import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../utils/theme';
import useUserStore from '../store/userStore';
import { Props } from '../screens/IdentityVerificationScreen';
import settings from '../settings';
import { util } from '@tonomy/tonomy-id-sdk';
import { handleVeriffIfRequired } from '../utils/veriff';
import { TButtonContained } from '../components/atoms/TButton';

type VeriffPayload = {
    appName: string;
    proof?: string;
};

export default function IdentityVerificationContainer({ navigation }: { navigation: Props['navigation'] }) {
    const userStore = useUserStore();
    const user = userStore.user;

    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsername = async () => {
            const u = await user.getUsername();

            const appName = settings.config.appName;

            const customPayload: VeriffPayload = {
                appName,
            };
            const issuer = await user.getIssuer();
            const did = await user.getDid();

            const proofVc = await util.VerifiableCredential.sign<VeriffPayload>(
                did,
                'VerifiableCredential',
                { appName },
                issuer
            );

            const jwt = proofVc.toString();

            // const isVerified = await handleVeriffIfRequired(jwt);
            // if (!isVerified) {
            //     console.log('Verification failed or was cancelled.');
            //     return;
            // }

            setUsername(u.getBaseUsername());
        };

        if (user) {
            fetchUsername();
        }
    }, [user]);

    const onStartVerification = async () => {
        const appName = settings.config.appName;

        const issuer = await user.getIssuer();
        const did = await user.getDid();

        const proofVc = await util.VerifiableCredential.sign<VeriffPayload>(
            did,
            'VerifiableCredential',
            { appName },
            issuer
        );

        const jwt = proofVc.toString();

        const isVerified = await handleVeriffIfRequired(jwt);
        // Verification was successful from user
        if (isVerified) {
            // Check Veriff Status using websocket
            // if user is verified, set isVerified to true in store and setStatus to LOGGED_IN
            // if user is not verified, set isVerified to false in store and show the error message
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <Text style={styles.title}>Identity Verification Required</Text>
                <Text style={styles.message}>
                    To continue using your account, please complete identity verification. This is required for security
                    and compliance.
                </Text>

                <View style={styles.notes}>
                    <Text style={styles.noteTitle}>You'll need:</Text>
                    <Text>• A government-issued ID</Text>
                    <Text>• A device with a working camera</Text>
                    <Text>• A few minutes to complete the process</Text>
                </View>

                <TButtonContained
                    loading={loading}
                    disabled={loading}
                    style={{ width: '100%' }}
                    size="large"
                    onPress={onStartVerification}
                >
                    Verify Now
                </TButtonContained>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        paddingBottom: 18,
        ...commonStyles.primaryFontFamily,
    },
    message: {
        fontSize: 16,
        marginBottom: 24,
    },
    notes: {
        marginBottom: 32,
    },
    noteTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
