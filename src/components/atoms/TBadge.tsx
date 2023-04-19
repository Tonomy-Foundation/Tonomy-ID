import React from 'react';
import { Badge } from 'react-native-paper';
import { useAppTheme } from '../../utils/theme';
import { Text, View } from 'react-native';

type TBadgeProps = React.ComponentProps<typeof Text> & { style?: any };

export default function TBadge(props: TBadgeProps) {
    const theme = useAppTheme();
    const style = {
        backgroundColor: theme.colors.accent2,
        color: theme.colors.accent,
        padding: 4,
        borderRadius: 20,
        fontSize: 10,
    };

    return (
        <Text {...props} style={[props.style, style]}>
            {props.children}
        </Text>
    );
}
