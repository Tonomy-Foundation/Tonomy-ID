import React, { useState } from 'react';
import TModal from './TModal';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../utils/theme';
import { TButtonText } from './atoms/Tbutton';
import { TP } from './atoms/THeadings';

export type ModalProps = React.ComponentProps<typeof TModal> & {
    onPress: () => void;
    title?: string;
    error?: Error;
    expected?: boolean;
};

export default function TErrorModal(props: ModalProps) {
    const [expanded, setExpanded] = useState(false);

    function switchExpanded() {
        setExpanded(!expanded);
    }

    if (props?.expected === false) {
        // TODO: log to team
    }

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
                        <TP size={1}>{props.error.message}</TP>
                    </View>

                    {props?.expected === false && (
                        <View>
                            <Text>The Tonomy Foundation has automatically been notified of this error</Text>
                        </View>
                    )}

                    {expanded && (
                        <>
                            {/* TODO Show Antelope error */}
                            {props.error.cause && (
                                <View>
                                    <Text>
                                        <Text style={styles.boldText}>Cause:</Text> {props.error.cause}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                    <View>
                        <TButtonText onPress={switchExpanded}>{expanded ? 'Hide Error' : 'View Error'}</TButtonText>
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
