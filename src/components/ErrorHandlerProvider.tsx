import React, { useState } from 'react';
import useErrorStore from '../store/errorStore';
import TErrorModal from './TErrorModal';

export default function ErrorHandlerProvider(props: any) {
    const errorStore = useErrorStore();

    const [showModal, setShowModal] = useState(errorStore.error !== null);

    async function onModalPress() {
        errorStore.unSetError();
        setShowModal(false);
    }

    return (
        <>
            {props.children}
            <TErrorModal
                visible={showModal}
                onPress={onModalPress}
                error={errorStore.error as Error}
                expected={false}
            />
        </>
    );
}
