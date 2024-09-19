import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import useErrorStore from '../store/errorStore';
import TErrorModal from './TErrorModal';
import Debug from 'debug';

const debug = Debug('tonomy-id:components:ErrorHandlerProvider');

export default function ErrorHandlerProvider() {
    debug('ErrorHandlerProvider');
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
        const unsubscribe = useErrorStore.subscribe((state) => {
            debug('errorStore.subscribe', state, errorRef.current);

            // Only update the modal if there's a change in the error state
            if (JSON.stringify(state.error) !== JSON.stringify(errorRef.current.error)) {
                errorRef.current.error = state.error;
                errorRef.current.title = state.title;
                errorRef.current.expected = state.expected;

                if (state.error) {
                    setShowModal(true);
                } else {
                    setShowModal(false);
                }
            }
        });

        return () => unsubscribe(); // Cleanup on component unmount
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
