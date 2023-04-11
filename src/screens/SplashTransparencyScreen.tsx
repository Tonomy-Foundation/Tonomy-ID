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
            description="The software that runs Telos ID is open-source and can be reviewed and run by anyone. It is maintained by a Dutch non profit called the Tonomy Foundation that practices radical transarency."
            linkUrl={settings.config.links.transparencyLearnMore}
            linkUrlText="Learn More"
            buttonText="GET STARTED"
            buttonOnPress={onButtonPress}
        ></SplashScreenContainer>
    );
}
