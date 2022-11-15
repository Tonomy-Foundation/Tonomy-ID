import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType } from 'react-native';
import theme from '../utils/theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type MainSplashScreenContainerProps = {
    imageSource: ImageSourcePropType;
};

export default function MainSplashScreenContainer(
    props: MainSplashScreenContainerProps,
    { navigation }: { navigation: NavigationProp<any> }
) {
    const navi = useNavigation();
    useEffect(() => {
        setTimeout(() => {
            navi.navigate('securitySplash');
        }, 300);
    }, [navigation]);
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
        margin: 180,
        alignSelf: 'center',
        width: 220,
        height: 220,
    },
    tonomylogo: {
        margin: 10,
        alignSelf: 'center',
        width: 40,
        height: 40,
    },
    text: {
        marginTop: 7,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
});
