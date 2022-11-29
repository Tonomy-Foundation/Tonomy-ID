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

export function TButtonContained(props: ButtonProps) {
    return (
        <TButton mode="contained" {...props}>
            {props.children}
        </TButton>
    );
}

export function TButtonOutlined(props: ButtonProps) {
    return (
        <TButton mode="outlined" {...props}>
            {props.children}
        </TButton>
    );
}

export function TButtonText(props: ButtonProps) {
    return (
        <TButton mode="text" {...props}>
            {props.children}
        </TButton>
    );
}
