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

    useEffect(() => {
        // subscribe to errorStore changes to update the modal
        // using the `errorStore` variable does not work as changes do not force a re-render
        const unsubscribe = useErrorStore.subscribe((state) => {
            console.error('Error handler', JSON.stringify(state, null, 2));

            if (errorRef.current.title !== 'Network request failed') {
                // Ensure the error is an instance of Error
                let parsedError: any = state.error;

                if (parsedError && !(parsedError instanceof Error)) {
                    parsedError = new Error(parsedError.message || parsedError.msg || 'Unexpected error occured.');
                }

                errorRef.current.error = parsedError;
                errorRef.current.title = state.title;
                errorRef.current.expected = state.expected;

                if (state.error) {
                    setShowModal(true);
                }
            }
        });

        return () => unsubscribe();
    }, []);

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
