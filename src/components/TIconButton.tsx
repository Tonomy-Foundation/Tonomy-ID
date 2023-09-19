import React from 'react';
import { IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import theme from '../utils/theme';

export type IconButtonProps = React.ComponentProps<typeof IconButton> & { color?: string };

export default function TButton(props: IconButtonProps) {
    const styles = StyleSheet.create({
        icon: {
            backgroundColor: props.color ? props.color : theme.colors.success,
        },
    });

    // https://materialdesignicons.com/
    return <IconButton {...props} color="white" style={styles.icon} />;
}
