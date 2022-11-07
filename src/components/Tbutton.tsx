import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { customColors } from '../utils/theme';

export type ButtonProps = React.ComponentProps<typeof Button>;

export default function TButton(props: ButtonProps) {
    const styles = StyleSheet.create({
        buttonLabel: {
            color: props.disabled ? customColors.disabledButtonTextColor : customColors.containedButtonTextColor,
        },
    });

    return (
        <Button {...props} labelStyle={styles.buttonLabel}>
            {props.children}
        </Button>
    );
}
