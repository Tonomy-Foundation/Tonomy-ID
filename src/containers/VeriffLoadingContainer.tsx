import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/VeriffLoadingScreen';

export default function VeriffLoadingContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <Image style={styles.image} source={require('../assets/images/veriff/VeriffLoading.png')} />
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        resizeMode: 'contain',
        marginTop: 160,
    },
});
