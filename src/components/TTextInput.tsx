import React from 'react';
import { TextInput } from 'react-native-paper';

export type TTextInputProps = React.ComponentProps<typeof TextInput>;
const props = {
    mode: 'outlined',
    label: 'Label',
    value: '',
};
export default function TTextInput(props: TTextInputProps) {
    return <TextInput {...props} />;
}
