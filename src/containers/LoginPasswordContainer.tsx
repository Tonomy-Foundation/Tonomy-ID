import React from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/homeScreen';

export default function LoginPasswordContainer({ navigation }: { navigation: Props['navigation'] }) {
    const {
        colors: { text },
    } = useTheme();
    const stylesColor = StyleSheet.create({
        text: {
            color: text,
        },
    });
    return <LayoutComponent body={<></>}></LayoutComponent>;
}
