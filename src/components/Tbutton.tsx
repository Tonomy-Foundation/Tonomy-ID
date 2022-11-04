import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export type ButtonProps = React.ComponentProps<typeof Button>;

export default function TButton(props: ButtonProps) {
    const styles = StyleSheet.create({
        buttonLabel: {
            color: props.disabled ? 'darkgrey' : 'white',
        },
    });

    return (
        <Button {...props} labelStyle={styles.buttonLabel}>
            {props.children}
        </Button>
    );
}
