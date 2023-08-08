import React from 'react';
import SplashScreenContainer from '../containers/SplashContainer';
import settings from '../settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import useUserStore, { UserStatus } from '../store/userStore';

export type SplashTransparencyScreenProps = NativeStackScreenProps<RouteStackParamList, 'SplashTransparency'>;

export default function SplashTransparencyScreen({ navigation }: SplashTransparencyScreenProps) {
    const { setStatus } = useUserStore();
    const onButtonPress = async () => {
        await setStatus(UserStatus.NOT_LOGGED_IN);

        navigation.navigate('Home');
    };

    return (
        <SplashScreenContainer
            navigation={navigation}
            title="Transparency"
            subtitle="This app is built and run in a transparent way"
            imageSource={require('../assets/animations/transparency.gif')}
            icon="transparency"
            description={`The software that runs ${settings.config.appName} is open-source and can be reviewed by anyone. It is maintained by the Tonomy Foundation, a Dutch non-profit that practices radical transparency.`}
            linkUrl={settings.config.links.transparencyLearnMore}
            linkUrlText="Learn More"
            buttonText="GET STARTED"
            buttonOnPress={onButtonPress}
        ></SplashScreenContainer>
    );
}
