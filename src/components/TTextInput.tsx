import { Children } from 'react';
import { TextInput } from 'react-native-paper';

type Props = {
  children: JSX.Element | JSX.Element[] | string;
};

export default function TTextInput({ children }: Props) {
  return (
    <TextInput
      rows={1}
      placeholder={children}
    />
  );
};