import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { A, H1 } from '@expo/html-elements';

type SplashScreenContainerProps = {
    navigation: NavigationProp<any>;
    title: string;
    subtitle: string;
    imageSource: any;
    description: string;
    learnMoreUrl: string;
    buttonText: string;
    buttonOnPress: () => void;
}

export default function SplashScreenContainer(props: SplashScreenContainerProps) {
    return (
        <View style={styles.container}>
            <View>
                <Text><H1>{props.title}</H1></Text>
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
                <Text><A href={props.learnMoreUrl}>Learn more</A></Text>
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
