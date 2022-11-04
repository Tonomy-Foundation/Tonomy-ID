import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Text } from 'react-native-paper';
import settings from '../settings';
import theme from '../theme';
import TLink from './TA';
import TButton from './Tbutton';
import TIconButton from './TIconButton';

export type ModalProps = React.ComponentProps<typeof Modal> & { onPress: () => void };

const styles = StyleSheet.create({
    modal: {
        padding: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    space: {
        marginTop: 6,
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
        marginBottom: 16,
    },
    buttonView: {
        marginTop: 16,
        alignSelf: 'flex-end',
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
                    <Text style={styles.title}>Welcome to {settings.config.ecosystemName}</Text>
                </View>
                <View>
                    <Text>
                        Your username is <Text style={{ color: theme.colors.primary }}>jack.telos.id</Text>
                    </Text>
                </View>
                <View style={styles.space}>
                    <Text>
                        See it on the blockchain <TLink href="#">here</TLink>
                    </Text>
                </View>
                <View style={styles.buttonView}>
                    <TButton onPress={props.onPress} mode="text">
                        <Text style={{ color: theme.colors.primary }}>OK</Text>
                    </TButton>
                </View>
            </View>
        </Modal>
    );
}
