import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import theme from '../utils/theme';
import TIconButton from './TIconButton';

export type LayoverProps = {
    refMessage: React.RefObject<any>;
};

const SSOLoginBottomLayover = (props: LayoverProps) => {
    return (
        <>
            <RBSheet
                ref={props.refMessage}
                openDuration={150}
                closeDuration={100}
                height={280}
                customStyles={{ container: { paddingHorizontal: 10 } }}
            >
                <View style={styles.vestHead}>
                    <Text style={styles.drawerHead}>Instant and secure access</Text>
                    <TouchableOpacity onPress={() => props.refMessage.current.close()}>
                        <TIconButton
                            icon={'close'}
                            color={theme.colors.lightBg}
                            iconColor={theme.colors.grey1}
                            size={17}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={styles.lockedParagraph}>
                        Enjoy a faster and more secure login experience without going through unnecessary steps.{' '}
                    </Text>
                    <Text style={[styles.lockedParagraph, { marginTop: 30 }]}>
                        With reusable identity, you stay in control of your data while accessing services seamlessly
                        across platforms{' '}
                    </Text>
                </View>
            </RBSheet>
        </>
    );
};

const styles = StyleSheet.create({
    vestHead: {
        paddingHorizontal: 5,
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    unlockAssetView: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        position: 'absolute',
        bottom: 75,
        left: 0,
        right: 0,
        marginHorizontal: 10,
    },
    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
        alignItems: 'flex-start',
    },
    lockedParagraph: {
        fontSize: 16,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
        paddingHorizontal: 10,
    },
});

export default SSOLoginBottomLayover;
