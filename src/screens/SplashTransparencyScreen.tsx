import React from 'react';
import SplashScreenContainer from '../containers/SplashContainer';
import settings from '../settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import useSplashStore from '../store/splashStore';

export type SplashTransparencyScreenProps = NativeStackScreenProps<RouteStackParamList, 'SplashTransparency'>;

export default function SplashTransparencyScreen({ navigation }: SplashTransparencyScreenProps) {
    const splashStorage = useSplashStore();

    const onButtonPress = async () => {
        splashStorage.finishedSplash = true;
        await splashStorage.finishedSplash;

        navigation.navigate('Home');
    };

    return (
        <SplashScreenContainer
            navigation={navigation}
            title="Transparency"
            subtitle="This app is built and run in a transparent way"
            imageSource={require('../assets/images/transparency-splash.png')}
            icon="transparency"
            description="The software that runs Telos ID is open-source and can be reviewed and run by anyone. It is maintained by a Dutch non profit called the Tonomy Foundation that practices radical transarency."
            linkUrl={settings.config.links.transparencyLearnMore}
            linkUrlText="Learn More"
            buttonText="GET STARTED"
            buttonOnPress={onButtonPress}
        ></SplashScreenContainer>
    );
}
