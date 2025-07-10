import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Props } from '../screens/VeriffLoadingScreen';
import TSpinner from '../components/atoms/TSpinner';
import useUserStore from '../store/userStore';
import { KYCPayload, KYCVC, SdkErrors, VeriffStatusEnum, VerificationTypeEnum } from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';

export default function VeriffLoadingContainer({
    navigation,
    kycPayload,
}: {
    navigation: Props['navigation'];
    kycPayload: Promise<KYCPayload>;
}) {
    const [loading, setLoading] = React.useState(false);

    const { user } = useUserStore();
    const errorStore = useErrorStore();

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const startVerificationCheck = async () => {
            if (user) {
                let verificationEvent: KYCPayload;

                try {
                    verificationEvent = await kycPayload;
                    navigation.navigate('VeriffDataSharing', { payload: verificationEvent });
                } catch (error) {
                    if (error.code === SdkErrors.VerificationDataNotFound) {
                        verificationEvent = (
                            (await user.fetchVerificationData(
                                VerificationTypeEnum.KYC,
                                VeriffStatusEnum.DECLINED
                            )) as KYCVC
                        ).getPayload();
                        navigation.navigate('VeriffDataSharing', { payload: verificationEvent });
                    } else {
                        errorStore.setError({ error: error, expected: false });
                    }
                }
            }
        };

        // Start verification check after 3 seconds
        timer = setTimeout(() => {
            setLoading(true);
            startVerificationCheck();
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [navigation, user]);

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
