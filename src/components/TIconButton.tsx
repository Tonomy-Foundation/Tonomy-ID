import React from 'react';
import { IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import theme from '../theme';

export type IconButtonProps = React.ComponentProps<typeof IconButton>;

const styles = StyleSheet.create({
    icon: {
        // TODO change to theme
        backgroundColor: '#4CAF50',
    },
});
export default function TButton(props: IconButtonProps) {
    // https://materialdesignicons.com/
    return <IconButton {...props} color="white" style={styles.icon} />;
}
