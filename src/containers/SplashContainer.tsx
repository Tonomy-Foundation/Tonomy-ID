import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { TH1 } from '../components/THeadings';
import TA from '../components/TA';
import theme from '../theme';

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
            <Text style={styles.header}>
                <TH1>{props.title}</TH1>
            </Text>
            <Text style={styles.description}>{props.subtitle}</Text>
            <Image style={styles.image} source={props.imageSource}></Image>
            <View style={styles.infoContainer}>
                <Image style={styles.icon} source={props.iconSource}></Image>
                <Text style={styles.description}>{props.description}</Text>
                <Text style={styles.description}>
                    <TA href={props.learnMoreUrl}>Learn more</TA>
                </Text>
            </View>
            <TButton style={styles.button} onPress={props.buttonOnPress}>
                {props.buttonText}
            </TButton>
        </View>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e1f2e2',
        borderRadius: 8,
        padding: 10,
        width: '90%',
        alignContent: 'center',
    },
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
        color: theme.colors.disabled,
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
    },
});
