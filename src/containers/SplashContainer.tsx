import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { TH1 } from '../components/THeadings';
import TA from '../components/TA';
import theme from '../theme';
import { white } from 'react-native-paper/lib/typescript/styles/colors';

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
            <Text style={styles.headdescription}>{props.subtitle}</Text>
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
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: '#e1f2e2',
        borderRadius: 8,
        padding: 10,
        gap: 10,
        width: '90%',
    },
    head: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
    },
    icon: {
        alignSelf: 'center',
    },
    header: {
        marginTop: 20,
        textAlign: 'center',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 14,
    },
    headdescription: {
        marginTop: 7,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
    description: {
        textAlign: 'center',
        alignSelf: 'center',
        width: '90%',
    },
    image: {
        marginTop: 50,
        alignSelf: 'center',
        width: 330,
        height: 300,
    },
    button: {
        margin: 20,
        alignSelf: 'center',
        width: '90%',
    },
});
