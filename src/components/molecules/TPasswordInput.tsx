import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import TTextInput, { TTextInputProps } from './TTextInput';
import theme from '../../utils/theme';

export default function TPasswordInput(props: TTextInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const openEyeImage = require('../../assets/images/openEye.png');
    const closedEyeImage = require('../../assets/images/closedEye.png');

    const toggleShowHideState = ()=>{
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
                <Image source={showPassword? closedEyeImage: openEyeImage} style={styles.showHideImage}/>
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
    },
    showHideImage:{
        tintColor: '#0000008A',
        resizeMode:'contain',
        height:26,
        width:26,
    }
});
