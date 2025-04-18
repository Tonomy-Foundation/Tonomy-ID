/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import TModal from './TModal';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../utils/theme';
import { TButtonText } from './atoms/TButton';
import { TP } from './atoms/THeadings';
import { HttpError, EosioUtil, CommunicationError, AntelopePushTransactionError } from '@tonomy/tonomy-id-sdk';
import { Modal } from 'react-native';
import { captureError } from '../utils/sentry';

export type TErrorModalProps = React.ComponentProps<typeof Modal> & {
    onPress: () => void;
    title?: string;
    error?: Error;
    expected?: boolean;
    visible?: boolean;
    code?: number;
    cause?: string;
    children?: React.ReactNode;
};

export default function TErrorModal(props: TErrorModalProps) {
    const [expanded, setExpanded] = useState(false);

    function switchExpanded() {
        setExpanded((expanded) => !expanded);
    }

    if (props.expected === false) {
        if (!props.error) {
            captureError(`TErrorModal() ${props.title}`, new Error('unexpected error: no error provided'), 'warning');
        } else {
            captureError(`TErrorModal() unexpected error: ${props.title}`, props.error);
        }
    }

    function isExpandableErrorType() {
        return (
            props?.error instanceof HttpError ||
            props?.error instanceof CommunicationError ||
            props?.error instanceof EosioUtil.AntelopePushTransactionError
        );
    }

    function isExpandable() {
        return isExpandableErrorType();
    }

    function ErrorDetails() {
        if (props.error instanceof HttpError) {
            const error = props.error as HttpError;

            return (
                <View>
                    <TP size={1}>Http error:</TP>
                    {error.code && <Text style={styles.greyText}>HTTP Code: {error.code}</Text>}
                    <Text>Path: {error.path}</Text>
                    <Text>Response: {JSON.stringify(error.response, null, 2)}</Text>
                    <Text>SourceUrl: {error.sourceURL}</Text>
                </View>
            );
        } else if (props.error instanceof AntelopePushTransactionError) {
            const error = props.error as AntelopePushTransactionError;
            const trxError = error.error;

            return (
                <View>
                    <TP size={1}>Trx error:</TP>
                    {error.code && <Text style={styles.greyText}>HTTP Code: {error.code}</Text>}
                    <Text style={styles.greyText}>Antelope Code: {trxError.code}</Text>
                    <Text style={styles.greyText}>Name: {trxError.name}</Text>
                    <Text style={styles.greyText}>What: {trxError.what}</Text>
                    <Text style={styles.greyText}>Details: {JSON.stringify(trxError.details, null, 2)}</Text>
                </View>
            );
        } else if (props.error instanceof CommunicationError) {
            const exception = (props.error as CommunicationError).exception;

            return (
                <View>
                    <TP size={1}>Communication error:</TP>
                    <Text style={styles.greyText}>Message: {exception.message}</Text>
                    <Text style={styles.greyText}>Status: {exception.status}</Text>
                    <Text style={styles.greyText}>Name: {exception.name}</Text>
                </View>
            );
        }

        throw new Error('Other error types should not be expandable');
    }

    try {
        return (
            <TModal
                visible={props.visible}
                icon="alert-circle-outline"
                onPress={props.onPress}
                buttonLabel="Close"
                title={props.title ?? 'Something went wrong'}
                iconColor={theme.colors.error}
            >
                {props.children}
                {props?.error && (
                    <>
                        <View>
                            <TP size={1}>{props?.error?.message}</TP>
                        </View>

                        {/* {props?.expected === false && (
                            <View>
                                <Text>The Tonomy Foundation has been notified</Text>
                            </View>
                        )} */}

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
    } catch (error) {
        captureError('TErrorModal() rendering', error);
        return null;
    }
}

const styles = StyleSheet.create({
    boldText: {
        fontWeight: 'bold',
    },
    greyText: {
        color: theme.colors.disabled,
    },
});
