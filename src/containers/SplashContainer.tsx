import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';

type SplashScreenContainerProps = {
    navigation: NavigationProp<any>;
    title: string;
    subtitle: string;
    imageUrl: string;
    description: string;
    learnMoreUrl: string;
    buttonText: string;
    buttonOnPress: () => void;
}

export default function SplashScreenContainer(props: SplashScreenContainerProps) {
    return (
        <View style={styles.container}>
            <View>
                <Text><h1>{props.title}</h1></Text>
            </View>
            <View>
                <Text>{props.subtitle}</Text>
            </View>
            <View>
                <Image source={require(props.imageUrl)}></Image>
            </View>
            <View>
                <Text>{props.description}</Text>
            </View>
            <View>
                <Text><a href={props.learnMoreUrl}>Learn more</a></Text>
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
        // backgroundColor: '#fff',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
});
