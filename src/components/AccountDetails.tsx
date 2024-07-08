// New component file: AccountDetails.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Share, ImageSourcePropType } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import RBSheet from 'react-native-raw-bottom-sheet';
import Popover from 'react-native-popover-view';
import Clipboard from '@react-native-clipboard/clipboard';
import TIconButton from '../components/TIconButton';
import theme from '../utils/theme';

export type AccountDetailsProps = {
    accountDetails: {
        symbol: string;
        icon: ImageSourcePropType;
        name: string;
        address: string;
    };
    refMessage: React.RefObject<any>;
    setAccountDetails: React.Dispatch<React.SetStateAction<any>>;
};

const AccountDetails = (props: AccountDetailsProps) => {
    const [showPopover, setShowPopover] = useState(false);

    const message =
        `Please use the following account name to send ${props.accountDetails.symbol} tokens to on the
    ${props.accountDetails.name} network:` +
        '\n' +
        `${props.accountDetails.address}`;

    const copyToClipboard = () => {
        setShowPopover(true);
        Clipboard.setString(message);
        setTimeout(() => setShowPopover(false), 400);
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: message,
            });
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <RBSheet ref={props.refMessage} openDuration={150} closeDuration={100} height={600}>
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>Receive</Text>
                <TouchableOpacity
                    onPress={() => {
                        (props.refMessage.current as any)?.close();
                        props.setAccountDetails({ symbol: '', icon: '', name: '', address: '' });
                    }}
                >
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <Text style={styles.subHeading}>
                Only send {props.accountDetails.symbol} assets to this address. Other assets will be lost forever
            </Text>
            <View style={styles.networkHeading}>
                <Image source={props.accountDetails.icon} style={styles.faviconIcon} />
                <Text style={styles.networkTitleName}>{props.accountDetails.name} Network</Text>
            </View>
            <View style={{ ...styles.qrView, flexDirection: 'column' }}>
                <QRCode value="testValue" size={150} />
                <Text style={styles.accountName}>{props.accountDetails.address}</Text>
            </View>
            <View style={styles.iconContainer}>
                <Popover
                    isVisible={showPopover}
                    popoverStyle={{ padding: 10 }}
                    from={
                        <TouchableOpacity style={styles.iconButton} onPress={() => copyToClipboard()}>
                            <TIconButton
                                icon={'content-copy'}
                                color={theme.colors.lightBg}
                                iconColor={theme.colors.primary}
                                size={24}
                            />
                            <Text style={styles.socialText}>Copy</Text>
                        </TouchableOpacity>
                    }
                >
                    <Text>Message Copied</Text>
                </Popover>
                <TouchableOpacity onPress={() => onShare()}>
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
        fontSize: 15,
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
