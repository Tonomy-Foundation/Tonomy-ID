import React from 'react';
import theme, { commonStyles, useAppTheme } from '../../utils/theme';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';

type CustomButtonProps = {
    theme?: 'primary' | 'secondary';
    stretched?: boolean;
    size?: 'large' | 'medium' | 'huge';
    color?: string;
    icon?: string;
    disabled?: boolean;
};
export type ButtonProps = React.ComponentProps<typeof TouchableOpacity> & CustomButtonProps;

export default function TButton(props: ButtonProps) {
    const theme = useAppTheme();

    const getColor = () => {
        if (props.color) return props.color;
        return props.disabled ? theme.colors.grey2 : getColorBasedOnTheme(props.theme);
    };
    const sizes: Record<keyof CustomButtonProps['size'], number> = {
        huge: 18,
        large: 16,
        medium: 14,
    };
    const textStyle = {
        color: getColor(),
        fontSize: sizes[props.size ?? 'large'],
        textAlign: 'center' as const,
        fontWeight: '500' as const,
    };

    const buttonStyle = {
        paddingHorizontal: props.size !== 'large' ? 16 : 22,
        paddingVertical: props.size !== 'large' ? 11 : 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        // @ts-expect-error style props do not match. FIXME:!
        // eslint-disable-next-line react/prop-types
        <TouchableOpacity {...props} style={[buttonStyle, commonStyles.borderRadius, props.style]}>
            {props.icon && (
                <IconButton
                    icon={props.icon}
                    iconColor={textStyle.color}
                    size={textStyle.fontSize}
                    style={{ margin: 0, marginRight: 3 }}
                ></IconButton>
            )}
            <Text style={textStyle}> {props.children}</Text>
        </TouchableOpacity>
    );
}

export function TButtonContained(props: ButtonProps) {
    const theme = useAppTheme();
    const color = theme.colors.white;
    const style: ViewStyle = {
        backgroundColor: props.disabled ? theme.colors.disabled : getColorBasedOnTheme(props.theme),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: props.size !== 'large' ? 11 : 14,
    };
    const shadowStyle = {
        shadowColor: theme.colors.shadowDark,
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

export function TButtonSecondaryContained(props: ButtonProps) {
    const theme = useAppTheme();
    const color = theme.colors.black;
    const style = {
        backgroundColor: theme.colors.backgroundGray,
    };

    return (
        // eslint-disable-next-line react/prop-types
        <TButton {...props} style={[props.style, style]} color={color}>
            {props.children}
        </TButton>
    );
}

export function TButtonOutlined(props: ButtonProps) {
    const style = {
        borderColor: props.disabled ? theme.colors.grey2 : getColorBasedOnTheme(props.theme),
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
    const colors: Record<keyof ButtonProps['theme'], string> = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
    };

    return colors[buttonTheme];
}
