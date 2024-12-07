import React, { useCallback, useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import useErrorStore from '../store/errorStore';
import TErrorModal from './TErrorModal';
import setErrorHandlers from '../utils/exceptions';

export default function ErrorHandlerProvider() {
    const [showModal, setShowModal] = useState(false);

    const errorStore = useErrorStore();
    const { onClose, unSetError } = errorStore;

    setErrorHandlers(errorStore);

    const onModalPress = useCallback(async () => {
        const oldOnClose = onClose;

        unSetError();
        if (oldOnClose) await oldOnClose();
        setShowModal(false);
    }, [onClose, unSetError]);

    // gets the initial value of the error state
    const errorRef = useRef(useErrorStore.getState());

    useEffect(() => {
        const unsubscribe = useErrorStore.subscribe((state) => {
            // Only update the modal if there's a change in the error state
            if (JSON.stringify(state.error) === JSON.stringify(errorRef.current.error)) return;

            if (state.error !== errorRef.current.error) {
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

        return () => {
            unsubscribe();
        };
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
