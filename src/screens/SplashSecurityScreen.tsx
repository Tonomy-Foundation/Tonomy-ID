import TButton from '../components/Tbutton';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <View style={styles.container}>
            <Text><Heading>Security</Heading></Text>
            <Text>You are in control of your identity</Text>
            <Image source="./assets/security-splash.png"></Image>
            <Text>Tonomy secures all transactions and data by only storing keys and your data on your phone - nowhere else!</Text>
            <Text><a href="">Learn more</a></Text>
            <TButton onPress={() => navigation.navigate('home')}>NEXT</TButton>
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
