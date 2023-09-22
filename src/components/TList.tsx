import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import theme from '../utils/theme';

export type TListProps = React.ComponentProps<typeof Text> & { bulletIcon?: string; text?: string };

export default function TList(props: TListProps) {
    return (
        <View style={styles.inputContainer}>
            <View style={styles.iconBullet}>
                <Text style={styles.textColor}>{props.bulletIcon}</Text>
            </View>
            <View>
                <Text style={styles.textColor}>{props.text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: 4,
        marginRight: 4,
        paddingLeft: 2,
    },
    iconBullet: {
        marginRight: 5,
    },
    textColor: {
        color: theme.colors.textGray,
    },
});
