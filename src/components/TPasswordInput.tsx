import { Children } from 'react';
import { TextInput } from 'react-native-paper';

type Props = {
  children: JSX.Element | JSX.Element[] | string;
};

export default function TPasswordInput({ children }: Props) {
  return (
    <TextInput
      rows={1}
      placeholder={children}
      secureTextEntry={true}
    />
  );
};