import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Text } from 'react-native-paper';
import settings from '../settings';
import theme from '../theme';
import TLink from './TA';
import TButton from './Tbutton';
import TIconButton from './TIconButton';

export type ModalProps = React.ComponentProps<typeof Modal> & {
    onPress: () => void;
    icon: string;
    title: string;
    buttonLabel?: string;
};

const styles = StyleSheet.create({
    modal: {
        padding: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
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
        <Modal {...props} dismissable={false} style={styles.modal}>
            <View style={styles.modalContent}>
                <View>
                    <TIconButton icon={props.icon} />
                </View>
                <View>
                    <Text style={styles.title}>{props.title}</Text>
                </View>
                {props.children}
                <View style={styles.buttonView}>
                    <TButton onPress={props.onPress} mode="text">
                        <Text style={{ color: theme.colors.primary }}>
                            {props.buttonLabel ? props.buttonLabel : 'OK'}
                        </Text>
                    </TButton>
                </View>
            </View>
        </Modal>
    );
}
