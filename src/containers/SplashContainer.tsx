import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { TH1 } from '../components/THeadings';
import TA from '../components/TA';

type SplashScreenContainerProps = {
    navigation: NavigationProp<any>;
    title: string;
    subtitle: string;
    imageSource: any;
    description: string;
    learnMoreUrl: string;
    buttonText: string;
    buttonOnPress: () => void;
};

export default function SplashScreenContainer(props: SplashScreenContainerProps) {
    return (
        <View style={styles.container}>
            <View>
                <Text>
                    <TH1>{props.title}</TH1>
                </Text>
            </View>
            <View>
                <Text>{props.subtitle}</Text>
            </View>
            <View>
                <Image source={props.imageSource}></Image>
            </View>
            <View>
                <Text>{props.description}</Text>
            </View>
            <View>
                <Text>
                    <TA href={props.learnMoreUrl}>Learn more</TA>
                </Text>
            </View>
            <View>
                <TButton onPress={props.buttonOnPress}>{props.buttonText}</TButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
