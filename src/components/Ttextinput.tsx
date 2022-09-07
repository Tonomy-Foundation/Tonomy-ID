import { Children } from 'react';
import { TextInput } from 'react-native-paper';

type Props = {
  children: JSX.Element | JSX.Element[] | string;
};

export default function Ttextinput({ children }: Props) {
  return (
    <TextInput
      multiline={false}
      rows={1}
      name="Username"
      placeholder="Username"
      value={children}
      onChangeText={text => setText(text)}
    />
  );
};