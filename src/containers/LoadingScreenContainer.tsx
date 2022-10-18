import React from 'react';
import { StyleSheet, Text, Image, View, ImageSourcePropType } from 'react-native';
import settings from '../settings';

export default function LoadingScreenContainer() {
    return (
        <View>
            <View>
                <Image source={settings.config.appLogoUrl}></Image>
            </View>
            <View>
                <Image source={settings.config.tonomyLogoUrl}></Image>
            </View>
            <View>
                <Text>
                    {settings.config.creditText}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})