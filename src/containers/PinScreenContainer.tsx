import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import theme from '../utils/theme';
import { NavigationProp } from '@react-navigation/native';
import DotsContainer from '../components/dotsContainer';

export default function PinScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [pin, setPin] = useState('');
    function onNumberPress(num: string) {
        setPin((pin) => pin + num);
        // TODO deny input after 5 characters
    }
    function DotOrChar(props: any) {
        if (props.pin === true) {
            return <DotsContainer></DotsContainer>;
        } else {
            return <Text>1</Text>;
        }
    }

    return (
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>Add a PIN</TH1>
            </Text>
            <Text style={styles.headdescription}>This helps keep your account secure</Text>
            <View style={styles.dotcontainer}>
                <DotOrChar pin={false}></DotOrChar>
                <DotsContainer></DotsContainer>
                <DotsContainer></DotsContainer>
                <DotsContainer></DotsContainer>
                <DotsContainer></DotsContainer>
            </View>
            <View style={styles.grid}>
                <TouchableOpacity onPress={() => onNumberPress('1')} style={styles.gridItem}>
                    <Text style={styles.gridItem}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNumberPress('2')} style={styles.gridItem}>
                    <Text style={styles.gridItem}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>9</Text>
                </TouchableOpacity>
                <Text style={styles.gridItem}></Text>
                <TouchableOpacity>
                    <Text style={styles.gridItem}>0</Text>
                </TouchableOpacity>
                <Text style={styles.gridItem}></Text>
            </View>
            <View style={styles.buttonwrapper}>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.nextbutton}>
                    Next
                </TButton>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.skipbutton}>
                    Skip
                </TButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dotcontainer: {
        alignContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        paddingTop: 20,
        width: '33%',
        height: 90,
        fontSize: 35,
        // Color: '#000000',
        textAlign: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    grid: {
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '90%',
    },
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
    buttonwrapper: {
        marginTop: 20,
    },
    skipbutton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
    },
    nextbutton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: theme.colors.disabled,
    },
});
