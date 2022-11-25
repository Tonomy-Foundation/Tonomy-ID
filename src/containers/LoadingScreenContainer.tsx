import React from 'react';
import { StyleSheet, Text, Image, View, ImageSourcePropType } from 'react-native';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';

type LoadingScreenProps = {
    navigation: NavigationProp<any>;
    creditText: string;
    appLogoUrl: string;
    tonomyLogoUrl: string;
};

export default function LoadingScreenContainer(props: LoadingScreenProps) {
    return (
        <View>
            <View>
                <Image source={props.appLogoUrl}></Image>
            </View>
            <View>
                <Image source={props.tonomyLogoUrl}></Image>
            </View>
            <View>
                <Text>Brought to you by Tonomy</Text>
            </View>
        </View>
    );
}
