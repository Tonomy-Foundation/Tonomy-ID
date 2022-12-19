import React from 'react';
import { Checkbox } from 'react-native-paper';

type TCheckboxType = React.ComponentProps<typeof Checkbox>;
export default function TCheckbox(props: TCheckboxType) {
    return <Checkbox {...props} />;
}
