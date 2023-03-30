import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { commonStyles } from '../utils/theme';
import { TCaption, TP } from './atoms/THeadings';

export type NavigationButtonProps = {
    onPress: () => void;
    icon?: string | React.ReactNode;
    title: string;
    description?: string;
    disabled?: boolean;
    color?: string;
};

export default function TNavigationButton(props: NavigationButtonProps) {
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={[styles.button, commonStyles.marginBottom]}
            disabled={props.disabled}
        >
            {props.icon && typeof props.icon === 'string' && (
                <View style={styles.iconContainer}>
                    <IconButton icon={props.icon} />
                </View>
            )}
            {props.icon && typeof props.icon === 'object' && <View style={styles.iconContainer}>{props.icon}</View>}
            {props.description ? (
                <View style={styles.textContainer}>
                    <TP>{props.title}</TP>
                    <TCaption>{props.description}</TCaption>
                </View>
            ) : (
                <View style={{ ...styles.titleContainer }}>
                    <TP
                        style={{
                            fontWeight: `${props?.disabled === false ? 'bold' : '100'}`,
                            color: `${props?.disabled === false ? 'black' : 'gray'}`,
                        }}
                    >
                        {props.title}
                    </TP>
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
