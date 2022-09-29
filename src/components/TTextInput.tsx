import React from 'react';
import { TextInput } from 'react-native-paper';


export type TTextInputProps = React.ComponentProps<typeof TextInput>;

export default function TTextInput(props: TTextInputProps) {
  return (
    <TextInput
      {...props}
    />
  );
};