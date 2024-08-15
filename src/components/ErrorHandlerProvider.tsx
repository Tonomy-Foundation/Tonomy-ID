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

    useEffect(
        () =>
            // subscribe to errorStore changes to update the modal
            // using the `errorStore` variable does not work as changes do not force a re-render
            useErrorStore.subscribe((state) => {
                console.log('state', state);
                errorRef.current.error = state.error;
                errorRef.current.title = state.title;
                errorRef.current.expected = state.expected;

                if (state.error) {
                    setShowModal(true);
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
