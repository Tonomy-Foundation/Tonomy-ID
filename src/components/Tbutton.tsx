import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import theme from '../theme';

export type ButtonProps = React.ComponentProps<typeof Button>;

export default function TButton(props: ButtonProps) {
    const styles = StyleSheet.create({
        buttonLabel: {
            color: props.disabled ? 'darkgrey' : 'white',
        },
    });

    return (
        <Button {...props} mode="contained" labelStyle={styles.buttonLabel}>
            {props.children}
        </Button>
    );
}
