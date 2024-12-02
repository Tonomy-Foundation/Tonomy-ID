import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

const TSpinner = ({ size = 70 }: { size?: number }) => {
    return (
        <View style={styles.animationContainer}>
            <LottieView
                style={{ width: size, height: size }}
                source={require('../../assets/images/loading-gif.json')}
                loop={true}
                autoPlay={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    animationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

export default TSpinner;
