import { Children } from "react";
import { Button } from "react-native-paper";

type Props = {
  children: JSX.Element | JSX.Element[] | string;
  onPress?: () => void;
};

export default function TButton({ children, onPress=()=> null }: Props) {
  return (
    <Button onPress={onPress} mode="contained">{children}</Button>
  );
}