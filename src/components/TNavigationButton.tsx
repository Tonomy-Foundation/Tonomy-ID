import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { commonStyles } from '../utils/theme';
import { TCaption, TP } from './atoms/THeadings';

export type NavigationButtonProps = {
    onPress: () => void;
    icon?: string;
    title: string;
    description?: string;
};

export default function TNavigationButton(props: NavigationButtonProps) {
    return (
        <TouchableOpacity onPress={props.onPress} style={[styles.button, commonStyles.marginBottom]}>
            {props.icon && (
                <View style={styles.iconContainer}>
                    <IconButton icon={props.icon} />
                </View>
            )}
            {props.description ? (
                <View style={styles.textContainer}>
                    <TP>{props.title}</TP>
                    <TCaption>{props.description}</TCaption>
                </View>
            ) : (
                <View style={styles.titleContainer}>
                    <TP>{props.title}</TP>
                </View>
            )}
            <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chevronStyle: {
        alignSelf: 'center',
        marginLeft: 20,
    },
    textContainer: {
        width: '75%',
    },
    iconContainer: {
        alignSelf: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        textAlignVertical: 'top',
    },
});
