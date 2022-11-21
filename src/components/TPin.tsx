import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import theme from '../utils/theme';

export default function TPin(props: { onPin: (pin: string) => void }) {
    const [pin, setPin] = useState('');
    useEffect(() => {
        props.onPin(pin);
    }, [pin]);
    function onNumberPress(num: string) {
        setPin(function (pin) {
            if (pin.length === 5) {
                return pin;
            } else {
                return pin + num;
            }
        });
    }
    function DotOrChar(props: { char: string | null }) {
        if (props.char) {
            return <Text style={styles.dotText}>{props.char}</Text>;
        } else {
            return <View style={styles.dot}></View>;
        }
    }
    return (
        <>
            <View style={styles.dotcontainer}>
                <DotOrChar char={pin.length > 0 ? pin[0] : null}></DotOrChar>
                <DotOrChar char={pin.length > 1 ? pin[1] : null}></DotOrChar>
                <DotOrChar char={pin.length > 2 ? pin[2] : null}></DotOrChar>
                <DotOrChar char={pin.length > 3 ? pin[3] : null}></DotOrChar>
                <DotOrChar char={pin.length > 4 ? pin[4] : null}></DotOrChar>
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
                <TouchableOpacity style={styles.gridItemZero} onPress={() => onNumberPress('0')}>
                    <Text style={styles.text}>0</Text>
                </TouchableOpacity>
            </View>
        </>
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
    gridItemZero: {
        paddingTop: 20,
        marginLeft: '33%',
        marginRight: '33%',
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
