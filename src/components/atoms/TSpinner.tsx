import { ActivityIndicator } from 'react-native';
import theme from '../../utils/theme';
import { ActivityIndicatorProps } from 'react-native';

export default function TSpinner(props: ActivityIndicatorProps) {
    return <ActivityIndicator {...props} color={theme.colors.primary} size={props.size ?? 'large'} />;
}
