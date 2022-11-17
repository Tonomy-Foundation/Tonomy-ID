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
        setPin(function (pin) {
            if (pin.length === 5) {
                return pin;
            } else {
                return pin + num;
            }
        });
    }
    function DotOrChar(props: any) {
        if (props.pin.length >= props.pinIndex + 1) {
            return <Text style={styles.dotText}>{props.pin[props.pinIndex]}</Text>;
        } else {
            return <View style={styles.dot}></View>;
        }
    }
    return (
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>Add a PIN</TH1>
            </Text>
            <Text style={styles.headdescription}>This helps keep your account secure</Text>
            {/* TODO separate component for all of this */}
            <View style={styles.dotcontainer}>
                <DotOrChar pinIndex={0} pin={pin}></DotOrChar>
                <DotOrChar pinIndex={1} pin={pin}></DotOrChar>
                <DotOrChar pinIndex={2} pin={pin}></DotOrChar>
                <DotOrChar pinIndex={3} pin={pin}></DotOrChar>
                <DotOrChar pinIndex={4} pin={pin}></DotOrChar>
            </View>
            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('1')}>
                    <Text style={styles.text}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('2')}>
                    <Text style={styles.text}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('2')}>
                    <Text style={styles.text}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('4')}>
                    <Text style={styles.text}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('5')}>
                    <Text style={styles.text}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('6')}>
                    <Text style={styles.text}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('7')}>
                    <Text style={styles.text}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('8')}>
                    <Text style={styles.text}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('9')}>
                    <Text style={styles.text}>9</Text>
                </TouchableOpacity>
                <Text style={styles.gridItem}></Text>
                <TouchableOpacity style={styles.gridItem} onPress={() => onNumberPress('0')}>
                    <Text style={styles.text}>0</Text>
                    {/* TODO justifycontent center instead of two empty spaces */}
                </TouchableOpacity>
                <Text style={styles.gridItem}></Text>
            </View>
            <View style={styles.buttonwrapper}>
                <TButton
                    disabled={pin.length > 4}
                    onPress={() => navigation.navigate('fingerprint')}
                    style={styles.nextbutton}
                >
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
    text: {
        fontSize: 35,
        // Color: '#000000',
        textAlign: 'center',
        alignSelf: 'center',
    },
    dotText: {
        padding: 10,
        fontSize: 35,
        // Color: '#000000',
        textAlign: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
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
    dot: {
        margin: 10,
        marginTop: 20,
        marginBottom: 20,
        height: 20,
        width: 20,
        borderRadius: 1000,
        backgroundColor: theme.colors.disabled,
    },
});
function foreach(loop: number) {
    throw new Error('Function not implemented.');
}
