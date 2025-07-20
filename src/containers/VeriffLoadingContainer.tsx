import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Props } from '../screens/VeriffLoadingScreen';
import TSpinner from '../components/atoms/TSpinner';
import useUserStore from '../store/userStore';
import { KYCPayload, KYCVC, SdkErrors, VeriffStatusEnum, VerificationTypeEnum, util } from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import settings from '../settings';
import { handleVeriffIfRequired } from '../utils/veriff';

type VeriffPayload = {
    appName: string;
    proof?: string;
};

export default function VeriffLoadingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [loading, setLoading] = React.useState(false);

    const { user } = useUserStore();
    const errorStore = useErrorStore();

    async function startVeriffFlow() {
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
        const verificationEventPromise: Promise<KYCPayload> = user.waitForNextVeriffVerification();

        try {
            const isVerified = await handleVeriffIfRequired(jwt, navigation);

            // Verification was successful from user
            if (isVerified) {
                let verificationEvent: KYCPayload;

                try {
                    verificationEvent = await verificationEventPromise;

                    navigation.navigate('VeriffDataSharing', { payload: verificationEvent });
                } catch (error) {
                    if (error.code === SdkErrors.VerificationDataNotFound) {
                        verificationEvent = (
                            (await user.fetchVerificationData(
                                VerificationTypeEnum.KYC,
                                VeriffStatusEnum.APPROVED
                            )) as KYCVC
                        ).getPayload();
                        navigation.navigate('VeriffDataSharing', { payload: verificationEvent });
                    } else {
                        errorStore.setError({ error: error, expected: false });
                    }
                }
            } else {
                // show error message
                errorStore.setError({ error: new Error('Verification failed'), expected: false });
                navigation.navigate('VeriffLogin');
            }
        } catch (error) {
            console.error('Error during Veriff flow:', error);
            errorStore.setError({ error, expected: false });
            navigation.navigate('VeriffLogin');
        }
    }

    useEffect(() => {
        startVeriffFlow();
        // Start verification check after 3 seconds
        const timer = setTimeout(() => {
            setLoading(true);
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [user, navigation, errorStore]);

    return (
        <View style={styles.container}>
            {loading ? (
                // This View is centered by its parent
                <View style={styles.inner}>
                    <TSpinner size={80} />
                    <Text style={styles.title}>Verifying your identity</Text>
                    <Text style={styles.subtitle}>This may take a few moments</Text>
                </View>
            ) : (
                <Image style={styles.image} source={require('../assets/images/veriff/VeriffLoading.png')} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 110,
    },
    inner: {
        alignItems: 'center',
    },
    image: {
        resizeMode: 'contain',
        width: 200,
        height: 200,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -15,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 8,
    },
});
