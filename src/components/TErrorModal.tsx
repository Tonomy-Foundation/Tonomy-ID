import React, { useState } from 'react';
import TModal from './TModal';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../utils/theme';
import { TButtonText } from './atoms/Tbutton';
import { TP } from './atoms/THeadings';
import { HttpError, EosioUtil, SdkError } from '@tonomy/tonomy-id-sdk';

export type ModalProps = React.ComponentProps<typeof TModal> & {
    onPress: () => void;
    title?: string;
    error?: Error;
    expected?: boolean;
    visible?: boolean;
    code?: number;
    cause?: string;
};

export default function TErrorModal(props: ModalProps) {
    const [expanded, setExpanded] = useState(false);

    function switchExpanded() {
        setExpanded((expanded) => !expanded);
    }

    if (props?.expected === false) {
        console.log(props.error?.message, JSON.stringify(props.error, null, 2));
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
                    <TP size={1}>Http error:</TP>
                    {props.error.cause && <Text style={styles.greyText}>Cause: {props.error.cause}</Text>}
                    {props.error.code && <Text style={styles.greyText}>HTTP Code: {props.error.code}</Text>}
                    <Text>Path: {props.error.path}</Text>
                    <Text>Response: {props.error.response}</Text>
                    <Text>SourceUrl: {props.error.sourceURL}</Text>
                </View>
            );
        } else if (props.error instanceof EosioUtil.AntelopePushTransactionError) {
            const trxError = props.error.error;

            return (
                <View>
                    <TP size={1}>Trx error:</TP>
                    {props.error.cause && <Text style={styles.greyText}>Cause: {props.error.cause}</Text>}
                    {props.error.code && <Text style={styles.greyText}>HTTP Code: {props.error.code}</Text>}
                    <Text style={styles.greyText}>Antelope Code: {trxError.code}</Text>
                    <Text style={styles.greyText}>Name: {trxError.name}</Text>
                    <Text style={styles.greyText}>What: {trxError.what}</Text>
                    <Text style={styles.greyText}>Details: {JSON.stringify(trxError.details, null, 2)}</Text>
                </View>
            );
        }

        throw new Error('Other error types should not be expandable');
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
                            <Text>The Tonomy Foundation has been notified</Text>
                        </View>
                    )}

                    {isExpandable() && (
                        <>
                            {expanded && (
                                <>
                                    <ErrorDetails />
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
    greyText: {
        color: theme.colors.disabled,
    },
});
