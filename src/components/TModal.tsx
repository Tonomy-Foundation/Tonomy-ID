import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import theme from '../utils/theme';
import { TButtonText } from './atoms/Tbutton';
import TIconButton from './TIconButton';
import { Modal } from 'react-native';

export type ModalProps = React.ComponentProps<typeof Modal> & {
    icon: string;
    iconColor?: string;
    title: string;
    visible?: boolean;
    enableLinkButton?: boolean;
    linkButtonText?: string;
    linkOnPress?: () => void;
    footer?: JSX.Element;
};

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        textAlign: 'center',
    },
});

export default function TModal(props: ModalProps) {
    return (
        <Modal animationType="fade" transparent={true} visible={props.visible} {...props}>
            <View style={styles.modal}>
                <View style={styles.modalContent}>
                    <View>
                        <TIconButton icon={props.icon} color={props.iconColor} />
                    </View>
                    <View>
                        <Text style={styles.title}>{props.title}</Text>
                    </View>
                    {props.children}
                    <View style={styles.buttonView}>
                        {props.enableLinkButton && (
                            <TButtonText onPress={props.linkOnPress}>
                                <Text style={{ color: theme.colors.accent }}>{props.linkButtonText}</Text>
                            </TButtonText>
                        )}
                        {props.footer && <>{props.footer}</>}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
