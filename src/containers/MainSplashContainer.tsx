import React from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType } from 'react-native';
import theme from '../utils/theme';
import { NavigationProp } from '@react-navigation/native';

type MainSplashScreenContainerProps = {
    ImageSource: ImageSourcePropType;
};

export default function MainSplashScreenContainer(props: MainSplashScreenContainerProps) {
    return (
        <View>
            <Image style={styles.mainlogo} source={props.imageSource}></Image>
            <Image style={styles.tonomylogo} source={require('../assets/tonomy/tonomy-logo1024.png')}></Image>
            <Text style={styles.text}>Brought to you by the Tonomy Foundation</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    mainlogo: {
        backgroundColor: '#ffffff',
    },
    tonomylogo: {
        backgroundColor: '#ffffff',
    },
    text: {
        marginTop: 7,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
});
