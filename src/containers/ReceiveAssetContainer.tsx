import { Image, ImageSourcePropType, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReceiveAssetScreenNavigationProp } from '../screens/Receive';
import theme from '../utils/theme';
import { Images } from '../assets';
import QRCode from 'react-native-qrcode-svg';
import Popover from 'react-native-popover-view';
import { useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import CopyIcon from '../assets/icons/CopyIcon';
import ShareIcon from '../assets/icons/ShareIcon';

export type ReceiveAssetProps = {
    navigation: ReceiveAssetScreenNavigationProp['navigation'];
    symbol: string;
    name: string;
    account?: string;
    icon?: ImageSourcePropType | undefined;
    accountBalance: { balance: string; usdBalance: number };
};
const ReceiveAssetContainer = (props: ReceiveAssetProps) => {
    const [showPopover, setShowPopover] = useState(false);
    const message = `${props.account}`;

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
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Text style={styles.subHeading}>
                        {props.account !== ''
                            ? `Only send ${props.symbol} assets to this address. Please make sure you are using the ${props.name} network before sending assets to this address`
                            : 'To complete the transaction, top up your account balance using this QR code'}
                    </Text>
                    <View style={styles.networkHeading}>
                        <Image source={props.icon || Images.GetImage('logo1024')} style={styles.faviconIcon} />
                        <Text style={styles.networkTitleName}>{props.name} Network</Text>
                    </View>
                    <View style={styles.flexCenter}>
                        <View style={{ ...styles.qrView, flexDirection: 'column' }}>
                            <QRCode value="testValue" size={200} />
                            <Text style={styles.accountName}>{props.account}</Text>
                        </View>
                        <View style={styles.iconContainer}>
                            <Popover
                                isVisible={showPopover}
                                popoverStyle={{ padding: 10 }}
                                from={
                                    <TouchableOpacity onPress={() => copyToClipboard()}>
                                        <View style={styles.iconButton}>
                                            <CopyIcon />
                                        </View>
                                        <Text style={styles.socialText}>Copy</Text>
                                    </TouchableOpacity>
                                }
                            >
                                <Text>Message Copied</Text>
                            </Popover>
                            <TouchableOpacity onPress={() => onShare()}>
                                <View style={styles.iconButton}>
                                    <ShareIcon />
                                </View>
                                <Text style={styles.socialText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    subHeading: {
        backgroundColor: theme.colors.grey7,
        padding: 16,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 18,
        borderRadius: 8,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
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
        justifyContent: 'center',
        borderColor: theme.colors.grey8,
        borderWidth: 2,
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 70,
    },
    accountName: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 10,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 20,
    },
    socialText: {
        fontSize: 12,
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: '500',
        marginTop: 5,
    },
    iconButton: {
        backgroundColor: theme.colors.grey7,
        width: 46,
        height: 46,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
});
export default ReceiveAssetContainer;
