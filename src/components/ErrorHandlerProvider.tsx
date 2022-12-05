import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import useErrorStore from '../store/errorStore';
import TErrorModal from './TErrorModal';

export default function ErrorHandlerProvider(props: any) {
    const [showModal, setShowModal] = useState(false);

    const errorStore = useErrorStore();

    async function onModalPress() {
        errorStore.unSetError();
        setShowModal(false);
    }

    const errorRef = useRef(useErrorStore.getState().error);

    useEffect(
        () =>
            // subscribe to errorStore changes to update the modal
            // using the `errorStore` variable does not work as changes do not force a re-render
            useErrorStore.subscribe((state) => {
                errorRef.current = state.error;
                if (state.error) {
                    setShowModal(true);
                }
            }),
        []
    );

    return (
        <>
            {props.children}
            <TErrorModal visible={showModal} onPress={onModalPress} error={errorRef.current} expected={false} />
        </>
    );
}
