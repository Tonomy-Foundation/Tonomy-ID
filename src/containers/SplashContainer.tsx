import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { TH1 } from '../components/THeadings';
import theme from '../utils/theme';
import TInfoBox from '../components/TInfoBox';

type SplashScreenContainerProps = {
    navigation: NavigationProp<any>;
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    icon: string;
    description: string;
    linkUrl: string;
    linkUrlText: string;
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
            <TInfoBox
                description={props.description}
                icon={props.icon}
                linkUrl={props.linkUrl}
                linkUrlText={props.linkUrlText}
            ></TInfoBox>
            <TButton style={styles.button} mode="contained" onPress={props.buttonOnPress}>
                {props.buttonText}
            </TButton>
        </View>
    );
}

const styles = StyleSheet.create({
    head: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
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
