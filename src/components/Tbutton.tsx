import { Children } from "react";
import { Button } from "react-native-paper";

type Props = {
  children: JSX.Element | JSX.Element[] | string;
};

export default function TButton({ children }: Props) {
  return (
    <Button mode="contained">{children}</Button>
  );
}