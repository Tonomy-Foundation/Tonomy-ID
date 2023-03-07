import React from 'react';
import { Badge, useTheme } from 'react-native-paper';

type TBadgeProps = React.ComponentProps<typeof Badge> & { style?: any };

export default function TBadge(props: TBadgeProps) {
    const theme = useTheme();
    const style = { backgroundColor: theme.colors.primary, color: 'white' };

    return <Badge {...props} style={[style, props.style]}></Badge>;
}
