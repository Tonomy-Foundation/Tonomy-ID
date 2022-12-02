import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TErrorModal from './TErrorModal';

export default function ErrorHandlerProvider(props: any) {
    const [showModal, setShowModal] = useState(true);

    async function onModalPress() {
        setShowModal(false);
    }

    const e1 = new Error('Jacks error');

    return (
        <>
            {props.children}
            <TErrorModal visible={showModal} onPress={onModalPress} error={e1} />
        </>
    );
}

const errorModalStyles = StyleSheet.create({
    marginTop: {
        marginTop: 6,
    },
});
