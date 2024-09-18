import React, { useState, useEffect } from 'react';
import useErrorStore from '../store/errorStore';
import TErrorModal from './TErrorModal';

export default function ErrorHandlerProvider() {
    const [showModal, setShowModal] = useState(false);
    const [errorDetails, setErrorDetails] = useState<{
        error: Error;
        title: string;
        expected: boolean;
    }>({});

    const errorStore = useErrorStore();

    async function onModalPress() {
        const onClose = errorStore.onClose;

        try {
            errorStore.unSetError();
            if (onClose) await onClose();
        } catch (e) {
            console.error('Error during modal close:', e);
            setShowModal(false);
        } finally {
            setShowModal(false);
        }
    }

    useEffect(() => {
        // Subscribe to errorStore changes to update the modal
        const unsubscribe = useErrorStore.subscribe((state) => {
            console.error('Error handler', JSON.stringify(state, null, 2));

            if (state.error) {
                setErrorDetails({
                    error: state.error,
                    title: state.title || 'Something went wrong',
                    expected: state.expected || false,
                });
                setShowModal(true);
            } else {
                setShowModal(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <TErrorModal
            visible={showModal}
            onPress={onModalPress}
            error={errorDetails.error}
            title={errorDetails.title}
            expected={errorDetails.expected}
        />
    );
}
