import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ImageBackground } from 'react-native';
import ExternalLinkIcon from '../assets/icons/ExternalLinkIcon';
import { TP } from './atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import CloseIcon from '../assets/icons/CloseIcon';

export type TInfoModalBoxProps = {
    description: string;
    modalTitle: string;
    modalDescription: string;
};
export default function TInfoModalBox(props: TInfoModalBoxProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const styles = StyleSheet.create({
        infoContainer: {
            backgroundColor: theme.colors.info,
            borderRadius: 12,
            width: '100%',
        },
        iconWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        infoBoxContentRow: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 25,
        },
        infoBoxText: {
            fontSize: 16,
            letterSpacing: 0.16,
            margin: 10,
            ...commonStyles.secondaryFontFamily,
        },
        modalContent: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.white,
            padding: 16,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            shadowColor: theme.colors.black,
            elevation: 10,
        },
        modalOverlay: {
            flex: 1,
        },
        modalHeader: {
            flexDirection: 'row',
            paddingVertical: 15,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '700',
            flex: 1,
            ...commonStyles.secondaryFontFamily,
        },
        modalDescription: {
            fontSize: 16,
            paddingBottom: 40,
            ...commonStyles.secondaryFontFamily,
        },
        modalBackdrop: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
        },
    });

    return (
        <View style={styles.infoContainer}>
            <TouchableOpacity style={styles.iconWrapper} onPress={() => setModalVisible(true)}>
                <ImageBackground
                    source={require('../assets/images/light-bulb.png')}
                    imageStyle={{
                        resizeMode: 'contain',
                        position: 'absolute',
                        right: '60%',
                    }}
                >
                    <View style={styles.infoBoxContentRow}>
                        <TP style={styles.infoBoxText}>{props.description}</TP>
                        <ExternalLinkIcon style={{ bottom: 10, right: 0 }} color={theme.colors.purple} />
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    {modalVisible && (
                        <TouchableOpacity
                            onPressOut={() => setModalVisible(false)}
                            style={styles.modalBackdrop}
                        ></TouchableOpacity>
                    )}
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{props.modalTitle}</Text>
                            <TouchableOpacity
                                style={{ backgroundColor: theme.colors.backgroundGray, borderRadius: 20, padding: 2 }}
                                onPressOut={() => setModalVisible(false)}
                            >
                                <CloseIcon color={theme.colors.grey9} />
                            </TouchableOpacity>
                        </View>
                        <TP style={styles.modalDescription}>{props.modalDescription}</TP>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
