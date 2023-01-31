import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import theme from '../utils/theme';
import TButton from './atoms/Tbutton';

function DotOrChar(props: { char: string | null }) {
    if (props.char) {
        return <Text style={[dotStyles.dotText]}>{props.char}</Text>;
    } else {
        return <View style={dotStyles.dot}></View>;
    }
}

const dotStyles = StyleSheet.create({
    dotTextView: {
        height: 20,
        width: 20,
    },
    dotText: {
        padding: 10,
        fontSize: 30,
        textAlign: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dot: {
        height: 20,
        width: 20,
        margin: 10,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 1000,
        backgroundColor: theme.colors.disabled,
    },
});

export default function TPin(props: { pin?: string; onChange: (pin: string) => void }) {
    const [pin, setPin] = useState(props.pin ? props.pin : '');

    useEffect(() => {
        if (props.pin !== undefined && props.pin !== pin) {
            setPin(props.pin);
        }
    }, [props.pin]);

    function onNumberPress(num: string) {
        const newPin = pin.length === 5 ? pin : pin + num;

        setPin(newPin);
        props.onChange(newPin);
    }

    const onDeletePress = () => {
        const newPin = pin.substring(0, pin.length - 1);
        setPin(newPin);
        props.onChange(newPin);
    };

    return (
        <>
            <View style={styles.dotContainer}>
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
                <TouchableOpacity style={styles.gridIcon} onPress={onDeletePress}>
                    <IconButton icon={'backspace-outline'} color="black" style={styles.icon} />
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    dotContainer: {
        alignContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    text: {
        fontSize: 35,
        textAlign: 'center',
        alignSelf: 'center',
    },
    gridItem: {
        paddingTop: 10,
        width: '33%',
        height: 70,
        justifyContent: 'center',
        alignContent: 'center',
    },
    gridItemZero: {
        paddingTop: 10,
        marginLeft: '33%',
        width: '33%',
        height: 70,
        justifyContent: 'center',
        alignContent: 'center',
    },
    grid: {
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '90%',
    },
    gridIcon: {
        paddingTop: 10,
        width: '33%',
        height: 70,
        justifyContent: 'center',
        alignContent: 'center',
    },
    icon: {
        marginHorizontal: '33%',
    },
});
