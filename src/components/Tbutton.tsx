import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { customColors } from '../utils/theme';

export type ButtonProps = React.ComponentProps<typeof Button>;

export default function TButton(props: ButtonProps) {
    return (
        <Button {...props} dark>
            {props.children}
        </Button>
    );
}
