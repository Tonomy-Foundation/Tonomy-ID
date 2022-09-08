import { Children } from 'react';
import { TextInput } from 'react-native-paper';

type Props = {
  children: JSX.Element | JSX.Element[] | string;
};

export default function Ttextinput({ children }: Props) {
  return (
    <TextInput
    
    style={{
      width: 340,
      height: 50
      }}
      rows={1}
      placeholder={children}
    />
  );
};