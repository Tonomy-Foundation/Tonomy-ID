import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Text } from 'react-native-paper';
import settings from '../settings';
import theme from '../theme';
import TButton from './Tbutton';
import TIconButton from './TIconButton';

export type ModalProps = React.ComponentProps<typeof Modal> & { onPress: () => void };

const styles = StyleSheet.create({
    modal: {
        // flex: 1,
        padding: 50,
        backgroundColor: 'yellow',
    },
    other: {
        // flex: 1,
        // backgroundColor: 'blue',
    },
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'pink',
        borderRadius: 4,
        padding: 26,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonView: {
        alignSelf: 'flex-end',
    },
    button: {
        color: theme.colors.primary,
    },
});

export default function TModal(props: ModalProps) {
    return (
        <Modal {...props} dismissable={false} style={styles.modal} contentContainerStyle={styles.other}>
            <View style={styles.modalContent}>
                <View>
                    <TIconButton icon="check" />
                </View>
                <View>
                    <Text style={styles.title}>Welocome to {settings.config.ecosystemName}</Text>
                </View>
                <View>
                    <Text>Your username is jack.telos.id</Text>
                </View>
                <View>
                    <Text>See it on the blockchain here</Text>
                </View>
                <View style={styles.buttonView}>
                    <TButton
                        onPress={props.onPress}
                        mode="text"
                        labelStyle={styles.button}
                        // color={theme.colors.primary}
                        color="red"
                    >
                        OK
                    </TButton>
                </View>
            </View>
        </Modal>
    );
}
