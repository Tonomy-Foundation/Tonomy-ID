import React, { useState } from 'react';
import TModal from './TModal';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../utils/theme';
import { TButtonText } from './atoms/Tbutton';

export type ModalProps = React.ComponentProps<typeof TModal> & {
    onPress: () => void;
    title?: string;
    error?: Error;
};

export default function TErrorModal(props: ModalProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <TModal
            visible={props.visible}
            onPress={props.onPress}
            icon="alert-circle-outline"
            title={props.title ?? 'Something went wrong'}
            buttonLabel="Close"
            iconColor={theme.colors.error}
        >
            {props.children}
            {props.error && (
                <>
                    <View>
                        <Text>{props.error.message}</Text>
                    </View>
                    {expanded && (
                        <>
                            <View>
                                <Text>{props.error.message}</Text>
                            </View>
                            {props.error.stack && (
                                <View>
                                    <Text>
                                        <Text style={styles.boldText}>Stack:</Text> {props.error.stack}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                    <View>
                        <TButtonText>{expanded ? 'Hide Error' : 'View Error'}</TButtonText>
                    </View>
                </>
            )}
        </TModal>
    );
}

const styles = StyleSheet.create({
    boldText: {
        fontWeight: 'bold',
    },
});
