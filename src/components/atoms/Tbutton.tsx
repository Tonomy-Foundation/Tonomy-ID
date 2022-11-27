import React from 'react';
import { Button } from 'react-native-paper';

export type ButtonProps = React.ComponentProps<typeof Button>;

export default function TButton(props: ButtonProps) {
    return (
        <Button {...props} dark>
            {props.children}
        </Button>
    );
}
