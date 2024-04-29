import React, { useState } from 'react';
import { Props } from '../screens/SignTransactionConsentScreen';
import { View, TouchableOpacity, StyleSheet, Image, Text, Platform } from 'react-native';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TH2 } from '../components/atoms/THeadings';
import { Images } from '../assets';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { IconButton } from 'react-native-paper';

export default function SignTransactionConsentContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <Image
                        style={[styles.logo, commonStyles.marginBottom]}
                        source={Images.GetImage('logo1024')}
                    ></Image>
                    <TH2 style={[commonStyles.textAlignCenter, styles.padding]}>
                        <Text style={styles.applink}>nftswap.com </Text>
                        wants you to send coins
                    </TH2>
                    <View style={styles.networkHeading}>
                        <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                        <Text style={styles.nameText}>Ethereum Network</Text>
                    </View>
                    <View style={styles.transactionHeading}>
                        <Text>0x9523a2....5c4bafe5</Text>
                    </View>
                    <View style={styles.appDialog}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.secondaryColor}>Recipient:</Text>
                            <Text>0x9523a2....5c4bafe5</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <Text style={styles.secondaryColor}>Amount:</Text>
                            <Text>
                                0.035 Eth <Text style={styles.secondaryColor}>($117.02) </Text>
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <Text style={styles.secondaryColor}>Function:</Text>
                            <Text style={{ color: theme.colors.secondary }}>buynft()</Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={styles.secondaryColor}>Transaction details:</Text>

                            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
                                {!showDetails ? (
                                    <IconButton
                                        icon={Platform.OS === 'android' ? 'arrow-down' : 'chevron-down'}
                                        size={23}
                                    />
                                ) : (
                                    <IconButton
                                        icon={Platform.OS === 'android' ? 'arrow-up' : 'chevron-up'}
                                        size={23}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        {showDetails && (
                            <View style={styles.detailSection}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.secondaryColor}>Price:</Text>
                                    <Text>
                                        0.001 Eth <Text style={styles.secondaryColor}>($17.02) </Text>
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                    <Text style={styles.secondaryColor}>NFT ID:</Text>
                                    <Text>#89792 </Text>
                                </View>
                                <TouchableOpacity style={styles.rawTransaction}>
                                    <Text style={{ color: theme.colors.secondary }}>Show raw transaction</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <View style={styles.appDialog}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.secondaryColor}>Gas fee:</Text>
                            <Text>
                                0.001 Eth <Text style={styles.secondaryColor}>($17.02) </Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.totalSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ marginRight: 8, fontWeight: '600' }}>Total:</Text>
                            <Text style={{ fontWeight: '600' }}>0x9523a2....5c4bafe5</Text>
                        </View>
                    </View>
                </View>
            }
            footer={
                <View>
                    <TButtonContained style={commonStyles.marginBottom}>Proceed</TButtonContained>
                    <TButtonOutlined>Cancel</TButtonOutlined>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
    },
    logo: {
        width: 70,
        height: 70,
    },
    applink: {
        color: theme.colors.linkColor,
        margin: 0,
        padding: 0,
    },
    imageStyle: {
        width: 10,
        height: 13,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    nameText: {
        color: theme.colors.secondary2,
        marginLeft: 5,
    },
    transactionHeading: {
        marginTop: 11,
    },
    appDialog: {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 16,
        width: '100%',
        marginTop: 20,
    },
    totalSection: {
        padding: 16,
        width: '100%',
        marginTop: 20,
        backgroundColor: theme.colors.info,
        borderRadius: 7,
    },
    detailSection: {
        backgroundColor: theme.colors.info,
        padding: 10,
        width: '100%',
        borderRadius: 7,
    },
    padding: {
        paddingHorizontal: 30,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
    },
    rawTransaction: {
        marginTop: 20,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
