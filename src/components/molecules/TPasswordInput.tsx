import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import TTextInput, { TTextInputProps } from './TTextInput';
import theme, { customColors } from '../../utils/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TPasswordInput(props: TTextInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowHideState = () => {
        setShowPassword(!showPassword);
    }

    return (
        <View>
            <TTextInput
                underlineColor="transparent"
                mode="outlined"
                {...props}
                secureTextEntry={showPassword ? true : false}
                style={styles.input}
            />
            <TouchableOpacity style={styles.showHideContainer} onPress={toggleShowHideState}>
                <Ionicons name={showPassword ? 'md-eye' : 'md-eye-off'} size={25} color={customColors.disabledButtonTextColor} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'transparent',
        marginBottom: 4,
        borderRadius: 6,
    },
    showHideContainer: {
        width: 60,
        height: 60,
        position: 'absolute',
        right: 0,
        top: 5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90000
    }
});
