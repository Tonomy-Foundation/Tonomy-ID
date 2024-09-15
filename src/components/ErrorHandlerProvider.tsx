import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import useErrorStore from '../store/errorStore';
import TErrorModal from './TErrorModal';

export default function ErrorHandlerProvider() {
    const [showModal, setShowModal] = useState(false);

    const errorStore = useErrorStore();

    async function onModalPress() {
        const onClose = errorStore.onClose;

        errorStore.unSetError();
        if (onClose) await onClose();
        setShowModal(false);
    }

    // gets the initial value of the error state
    const errorRef = useRef(useErrorStore.getState());
    const parseError = (error: any) => {
        let parsedError = error;

        // Attempt to parse the error if it's a string
        if (typeof error === 'string') {
            try {
                parsedError = JSON.parse(error);
            } catch (e) {
                // If parsing fails, use the original error string
                parsedError = error;
            }
        }

        // Handle nested error structures
        if (parsedError && typeof parsedError === 'object' && parsedError.error) {
            parsedError = parsedError.error;
        }

        return new Error(parsedError.message || parsedError.msg || 'Unknown error');
    };

    useEffect(
        () =>
            // subscribe to errorStore changes to update the modal
            // using the `errorStore` variable does not work as changes do not force a re-render
            useErrorStore.subscribe((state) => {
                console.error(JSON.stringify(state, null, 2));

                if (errorRef.current.title !== 'Network request failed') {
                    errorRef.current.error = parseError(state.error);
                    errorRef.current.title = state.title;
                    errorRef.current.expected = state.expected;

                    if (state.error) {
                        setShowModal(true);
                    }
                }
            }),
        []
    );

    return (
        <TErrorModal
            visible={showModal}
            onPress={onModalPress}
            error={errorRef.current.error}
            title={errorRef.current.title}
            expected={errorRef.current.expected}
        />
    );
}
