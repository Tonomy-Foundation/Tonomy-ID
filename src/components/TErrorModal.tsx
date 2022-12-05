import React, { useState } from 'react';
import TModal from './TModal';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../utils/theme';
import { TButtonText } from './atoms/Tbutton';
import { TP } from './atoms/THeadings';
import { HttpError, EosioUtil, SdkError } from 'tonomy-id-sdk';

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
        // TODO: log to Tonomy Foundation team
    }

    function isExpandableErrorType() {
        return props?.error instanceof HttpError || props?.error instanceof EosioUtil.AntelopePushTransactionError;
    }
    function isExpandable() {
        return isExpandableErrorType() || props?.code || props?.cause;
    }

    function ErrorDetails() {
        if (props.error instanceof HttpError) {
            return (
                <View>
                    <TP size={2}>Path: {props.error.path}</TP>
                    <TP size={2}>Response: {props.error.response}</TP>
                    <TP size={2}>SourceUrl: {props.error.sourceURL}</TP>
                </View>
            );
        } else if (props.error instanceof EosioUtil.AntelopePushTransactionError) {
            const trxError = props.error.error;

            return (
                <View>
                    <TP size={2}>Trx error:</TP>
                    <TP size={2}>Code: {trxError.code}</TP>
                    <TP size={2}>Name: {trxError.name}</TP>
                    <TP size={2}>What: {trxError.what}</TP>
                    <TP size={2}>Details: {JSON.stringify(trxError.details, null, 2)}</TP>
                </View>
            );
        }
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

                    {isExpandable() && expanded && (
                        <>
                            {expanded && (
                                <>
                                    {isExpandableErrorType() && <ErrorDetails />}
                                    {props.error.code && (
                                        <View>
                                            <Text>
                                                <Text style={styles.boldText}>Code:</Text> {props.error.code}
                                            </Text>
                                        </View>
                                    )}
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
                                <TButtonText onPress={switchExpanded}>
                                    {expanded ? 'Hide Error' : 'View Error'}
                                </TButtonText>
                            </View>
                        </>
                    )}
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
