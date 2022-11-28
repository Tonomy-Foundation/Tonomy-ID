import React from 'react';
import TTextInput, { TTextInputProps } from './TTextInput';

export default function TPasswordInput(props: TTextInputProps) {
    return <TTextInput {...props} secureTextEntry={true} />;
}
