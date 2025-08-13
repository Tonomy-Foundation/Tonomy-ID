import { Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReceiveAssetScreenNavigationProp } from '../screens/ReceiveAssetScreen';
import theme from '../utils/theme';
import QRCode from 'react-native-qrcode-svg';
import Popover from 'react-native-popover-view';
import { useEffect, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import CopyIcon from '../assets/icons/CopyIcon';
import { ShareAndroidSolid } from 'iconoir-react-native';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import { IChain } from '../utils/chain/types';
import useErrorStore from '../store/errorStore';
import LayoutComponent from '../components/layout';
import TInfoModalBox from '../components/TInfoModalBox';

export type ReceiveAssetProps = {
    navigation: ReceiveAssetScreenNavigationProp['navigation'];
    chain: IChain;
};

const ReceiveAssetContainer = (props: ReceiveAssetProps) => {
    const [showPopover, setShowPopover] = useState(false);
    const [asset, setAsset] = useState<AccountTokenDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const errorStore = useErrorStore();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const assetData = await getAssetDetails(props.chain);

                setAsset(assetData);
                setLoading(false);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        };

        fetchAssetDetails();
    }, [errorStore, props.chain]);

    if (loading || !asset || !asset.account) {
        return <TSpinner />;
    }

    const copyToClipboard = () => {
        setShowPopover(true);
        if (asset.account) Clipboard.setString(asset.account);
        setTimeout(() => setShowPopover(false), 400);
    };

    const onShare = async () => {
        try {
            if (asset.account) {
                await Share.share({
                    message: asset.account,
                });
            }
        } catch (error) {
            alert(error.message);
        }
    };
    const logo = asset.token.icon;

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <View style={styles.content}>
                        <ScrollView contentContainerStyle={styles.scrollViewContent}>
                            <Text style={styles.subHeading}>
                                {asset.account && asset.account !== ''
                                    ? `Only send ${asset.chain.getName()} assets to this account. Please make sure you are using the ${asset.chain.getName()} network before sending assets to this account`
                                    : 'To complete the transaction, top up your account balance using this QR code'}
                            </Text>
                            <View style={styles.networkHeading}>
                                <Image
                                    source={typeof logo === 'string' ? { uri: logo } : logo}
                                    style={styles.faviconIcon}
                                />
                                <Text style={styles.networkTitleName}>{asset.chain.getName()} Network</Text>
                            </View>
                            <View style={styles.flexCenter}>
                                <View style={{ ...styles.qrView, flexDirection: 'column' }}>
                                    <QRCode value={asset.account} size={200} />
                                    <Text style={styles.accountName}>{asset.account}</Text>
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
                                            <ShareAndroidSolid height={24} width={24} color={theme.colors.black} />
                                        </View>
                                        <Text style={styles.socialText}>Share</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoModalBox
                        description="Next-level peer-to-peer security —trust without intermediaries"
                        modalTitle="True peer-to-peer trust"
                        modalDescription="Tonomy gives you real security — with no middlemen, no hidden servers, and no third parties. Connect, share, and transact directly, backed by strong cryptography and full privacy. It’s digital trust, redesigned: simple, direct, and fully yours"
                    />
                </View>
            }
        ></LayoutComponent>
    );
};

const styles = StyleSheet.create({
    infoBox: {
        marginBottom: 32,
    },
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
        justifyContent: 'center',
        borderColor: theme.colors.grey8,
        borderWidth: 2,
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 40,
    },
    accountName: {
        textAlign: 'center',
        fontSize: 13,
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
