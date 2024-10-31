/* eslint-disable indent */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../utils/theme';
import { TCaption, TP } from './atoms/THeadings';

export type NavigationButtonProps = {
    onPress: () => void;
    icon?: string | React.ReactNode;
    title: string;
    description?: string;
    disabled?: boolean;
    color?: string;
    textColor?: string;
};

export default function TNavigationButton(props: NavigationButtonProps) {
    const theme = useAppTheme();
    const getAlignmentBasenOnDescription = () => {
        return props.description ? 'flex-start' : 'center';
    };

    return (
        <TouchableOpacity onPress={props.onPress} style={[styles.button]} disabled={props.disabled}>
            {props.icon && typeof props.icon === 'string' && (
                <View style={{ alignSelf: getAlignmentBasenOnDescription() }}>
                    <IconButton color={props?.textColor} icon={props.icon} style={styles.icons} />
                </View>
            )}
            {props.icon && typeof props.icon === 'object' && (
                <View style={{ alignSelf: getAlignmentBasenOnDescription() }}>{props.icon}</View>
            )}

            <View style={{ ...styles.titleContainer }}>
                <TP
                    style={{
                        color: `${
                            props?.disabled
                                ? theme.colors.textGray
                                : props?.textColor
                                ? props.textColor
                                : theme.colors.text
                        }`,
                    }}
                >
                    {props.title}
                </TP>
                {props.description && <TCaption>{props.description}</TCaption>}
            </View>

            <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    chevronStyle: {
        alignSelf: 'center',
        marginLeft: 20,
    },
    textContainer: {
        width: '75%',
    },

    icons: {
        margin: 0,
    },
    titleContainer: {
        flex: 1,
        textAlignVertical: 'top',
    },
});
