import React, { useEffect } from 'react';
import theme, { commonStyles, useAppTheme } from '../../utils/theme';
import { Text, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

type CustomButtonProps = {
    theme?: 'primary' | 'secondary';
    stretched?: boolean;
    size?: 'large' | 'medium';
    color?: string;
    icon?: string;
    disabled?: boolean;
};
export type ButtonProps = React.ComponentProps<typeof TouchableOpacity> & CustomButtonProps;

export default function TButton(props: ButtonProps) {
    const theme = useAppTheme();

    const getColor = () => {
        if (props.color) return props.color;
        return props.disabled ? 'grey' : getColorBasedOnTheme(props.theme);
    };
    const sizes: Record<ButtonProps['size'], number> = {
        large: 15,
        medium: 14,
    };
    const textStyle = {
        color: getColor(),
        fontSize: sizes[props.size ?? 'large'],
        textAlign: 'center',
        fontWeight: '500',
    };

    const buttonStyle = {
        paddingHorizontal: props.size === 'large' ? 22 : 16,
        paddingVertical: props.size === 'large' ? 14 : 11,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        // eslint-disable-next-line react/prop-types
        <TouchableOpacity {...props} style={[buttonStyle, commonStyles.borderRadius, props.style]}>
            {props.icon && (
                <IconButton
                    icon={props.icon}
                    color={textStyle.color}
                    size={textStyle.fontSize}
                    style={{ margin: 0, marginRight: 6 }}
                ></IconButton>
            )}
            <Text style={textStyle}>{props.children}</Text>
        </TouchableOpacity>
    );
}

export function TButtonContained(props: ButtonProps) {
    const theme = useAppTheme();
    const color = theme.colors.white;
    const style = {
        backgroundColor: props.disabled ? theme.colors.primary2 : getColorBasedOnTheme(props.theme),
    };
    const shadowStyle = {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    };

    return (
        // eslint-disable-next-line react/prop-types
        <TButton {...props} style={[props.style, style, !props.disabled ? shadowStyle : null]} color={color}>
            {props.children}
        </TButton>
    );
}

export function TButtonOutlined(props: ButtonProps) {
    const style = {
        borderColor: props.disabled ? 'grey' : getColorBasedOnTheme(props.theme),
        borderWidth: 1,
    };

    return (
        // eslint-disable-next-line react/prop-types
        <TButton {...props} style={[props.style, style]}>
            {props.children}
        </TButton>
    );
}

export function TButtonText(props: ButtonProps) {
    return <TButton {...props}>{props.children}</TButton>;
}

function getColorBasedOnTheme(buttonTheme: ButtonProps['theme'] = 'primary'): string {
    const colors: Record<ButtonProps['theme'], string> = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
    };

    return colors[buttonTheme];
}
