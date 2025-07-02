import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Props } from '../screens/VeriffLoadingScreen';
import TSpinner from '../components/atoms/TSpinner';
import useUserStore from '../store/userStore';
s
export default function VeriffLoadingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [loading, setLoading] = React.useState(false);

    const {user} = useUserStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            navigation.navigate('VeriffDataSharing');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    useEffect(() => {
        // Listen for Veriff verification message
         // First, subscribe to verification messages
        user.subscribeToVerificationUpdates()
         .then((verifications) => {
             if (verifications) {

                 if (verifications?.length > 0 ) {
                     navigation.navigate('VeriffDataSharing', { verifications });
                 } else {
                     // throw error
                 }
             }
         })
         .catch(error => {
             console.error('Error subscribing to verification updates:', error);
         });
    }, [navigation]);

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
