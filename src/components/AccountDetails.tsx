// New component file: QrCodeReceiveSheet.tsx
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Images } from '../assets';
import TIconButton from '../components/TIconButton';
import theme from '../utils/theme';
import RBSheet from 'react-native-raw-bottom-sheet';

export type AccountDetailsProps = {
    accountName: string;
    refMessage: {
        current: any;
    };
};

const AccountDetails = (props: AccountDetailsProps) => {
    return (
        <RBSheet ref={props.refMessage} openDuration={150} closeDuration={100} height={600}>
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>Receive</Text>
                <TouchableOpacity onPress={() => (props.refMessage.current as any)?.close()}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <Text style={styles.subHeading}>
                Only send LEOS assets to this address. Other assets will be lost forever
            </Text>
            <View style={styles.networkHeading}>
                <Image source={Images.GetImage('logo48')} style={styles.faviconIcon} />
                <Text style={styles.networkTitleName}>Pangea Network</Text>
            </View>
            <View style={{ ...styles.qrView, flexDirection: 'column' }}>
                <QRCode value="testValue" size={150} />
                <Text style={styles.accountName}>{props.accountName}</Text>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <TIconButton
                        icon={'content-copy'}
                        color={theme.colors.lightBg}
                        iconColor={theme.colors.primary}
                        size={24}
                    />
                    <Text style={styles.socialText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <TIconButton
                        icon={'share-variant'}
                        color={theme.colors.lightBg}
                        iconColor={theme.colors.primary}
                        size={24}
                    />
                    <Text style={styles.socialText}>Share</Text>
                </TouchableOpacity>
            </View>
        </RBSheet>
    );
};

const styles = StyleSheet.create({
    rawTransactionDrawer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
    subHeading: {
        backgroundColor: theme.colors.lightBg,
        marginHorizontal: 15,
        padding: 10,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 18,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'center',
    },
    networkTitleName: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    faviconIcon: {
        width: 18,
        height: 18,
        marginRight: 5,
    },
    qrView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'center',
        borderColor: theme.colors.grey6,
        borderWidth: 2,
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 70,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    iconButton: {
        marginHorizontal: 25,
    },
    socialText: {
        fontSize: 12,
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default AccountDetails;
