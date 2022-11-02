import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { TH1 } from '../components/THeadings';
import TA from '../components/TA';

type SplashScreenContainerProps = {
    navigation: NavigationProp<any>;
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    iconSource: ImageSourcePropType;
    description: string;
    learnMoreUrl: string;
    buttonText: string;
    buttonOnPress: () => void;
};

export default function SplashScreenContainer(props: SplashScreenContainerProps) {
    return (
        <View style={styles.head}>
            <Image style={styles.icon} source={props.iconSource}></Image>
            <Text style={styles.header}>
                <TH1>{props.title}</TH1>
            </Text>
            <Text style={styles.description}>{props.subtitle}</Text>
            <Image style={styles.image} source={props.imageSource}></Image>
            <Text style={styles.description}>{props.description}</Text>
            <Text style={styles.description}>
                <TA href={props.learnMoreUrl}>Learn more</TA>
            </Text>
            <TButton style={styles.button} onPress={props.buttonOnPress}>
                {props.buttonText}
            </TButton>
        </View>
    );
}

const styles = StyleSheet.create({
    head: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    icon: {
        alignSelf: 'center',
    },
    header: {
        textAlign: 'center',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '800',
    },
    description: {
        textAlign: 'center',
        alignSelf: 'center',
        color: 'gray',
        width: '90%',
    },
    image: {
        alignSelf: 'center',
        width: '60%',
        height: '30%',
    },
    button: {
        alignSelf: 'center',
        width: '90%',
        backgroundColor: 'linear-gradient(90deg, #1AD6FF 9.11%, #571AFF 100%)',
    },
});
