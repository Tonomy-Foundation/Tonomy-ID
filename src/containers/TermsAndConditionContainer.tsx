/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image, Platform } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/TButton';
import { TP, TH2 } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { IconButton } from 'react-native-paper';
import TModal from '../components/TModal';
import TList from '../components/TList';
import { Props } from '../screens/TermsAndConditionScreen';
import settings from '../settings';

export default function TermsAndConditionContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [fullTermsShow, setFullTermsShow] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollViewConditions}>

                <View style={styles.headerPanel}>
                    <TH2 style={commonStyles.textAlignCenter}>Terms & Conditions</TH2>
                </View>

                <View style={styles.innerContainer}>
                    <Image width={8} height={8} source={require('../assets/tonomy/Agreement-amico.png')}></Image>
                </View>
                <View>
                    <TP style={styles.summaryHead}>Summary:</TP>
                    <View style={styles.marginTop}>
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    You can <Text style={{ fontWeight: 'bold' }}>use {settings.config.appName} to log into and share data (e.g., username, KYC) with applications</Text> that support {settings.config.appName}, always under your control.
                                </Text>
                            }
                        />
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    Please remember or <Text style={{ fontWeight: 'bold' }}>keep a secure copy of your username and 6-word passphrase</Text>, as they cannot be recovered if lost.
                                </Text>
                            }
                        />
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    <Text style={{ fontWeight: 'bold' }}>You are solely responsible for your actions, transactions, and compliance with regulations when using applications</Text> connected through {settings.config.appName}, not the Tonomy Foundation.
                                </Text>
                            }
                        />
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    {settings.config.appName} is open-source and <Text style={{ fontWeight: 'bold' }}>maintained by the Tonomy Foundation.</Text>
                                </Text>
                            }
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.fulltermButton}
                    onPress={() => setFullTermsShow(!fullTermsShow)}
                    activeOpacity={0.5}
                >
                    <View style={styles.leftContent}>
                        <IconButton icon="file-document-outline" iconColor={theme.colors.grey2}></IconButton>
                        <Text style={styles.fulltermText}>Full Terms of Service {'   '}</Text>
                    </View>
                    <View style={styles.leftContent}>
                        <Text style={styles.threeMinText}>(7 min read) </Text>
                        <IconButton
                            style={styles.chevronIcon}
                            icon={fullTermsShow ? 'chevron-up' : 'chevron-down'}
                            iconColor={theme.colors.grey2}
                        ></IconButton>
                    </View>
                </TouchableOpacity>
                {fullTermsShow && (
                    <View>
                        <TP style={styles.scrollView}>
                            These Terms of Service (&quot;Terms&quot;) outline the agreement between you and {settings.config.appName} regarding
                            the use of our self-sovereign identity and non-custodial wallet services. Please read these Terms carefully
                            before using our platform.
                        </TP>

                        <TP style={styles.fontWeight}>1. Acceptance of Terms</TP>
                        <TP style={styles.scrollView}>
                            By accessing or using the {settings.config.appName} app, you acknowledge that you
                            have read, understood, and agreed to these Terms. If you do not agree with these Terms,
                            please refrain from using our services.
                        </TP>

                        <TP style={styles.fontWeight}>2. User Responsibilities</TP>
                        <TP style={styles.scrollView}>
                            a. You are solely responsible for maintaining the confidentiality of your username, passphrase, and private
                            keys associated with your {settings.config.appName} account. This information is crucial for ensuring the security of your identity,
                            wallet, and data. If you lose your credentials, your account cannot be recovered.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. You agree to use the app in compliance with all applicable laws and regulations. You are
                            solely responsible for all activities conducted through your account, including transactions
                            and logins to third-party applications.
                        </TP>

                        <TP style={styles.fontWeight}>3. Self-Sovereign Identity & Login</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} operates on the principle of self-sovereign identity, meaning you have complete
                            control over your personal information. You decide when and with whom you share your data.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Your username is hashed with chain-specific data and stored on-chain. Neither Tonomy Foundation nor
                            any operator has visibility into your username or passphrase.
                        </TP>
                        <TP style={styles.scrollView}>
                            c. The app provides a single sign-on (SSO)-like login flow. You agree not to misuse this feature or use it for
                            prohibited or illegal activities.
                        </TP>

                        <TP style={styles.fontWeight}>4. Wallet Services</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} is a non-custodial wallet. You retain sole control over your private keys.
                            The Tonomy Foundation cannot access, recover, or reverse your transactions.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Currently supported chains include TONO (Tonomy Blockchain), Ethereum, and Polygon. Other chains may be supported in the future.
                        </TP>
                        <TP style={styles.scrollView}>
                            c. You can manage $TONO tokens, including viewing vested and staked balances, withdrawing vested tokens, and staking.
                        </TP>

                        <TP style={styles.fontWeight}>5. KYC and Data Sharing</TP>
                        <TP style={styles.scrollView}>
                            a. Third-party apps you log into may request that you complete Know Your Customer (KYC) verification.
                            This process is performed by Veriff as the KYC provider. {settings.config.appName} does not process or store your KYC data centrally.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Verified KYC data is stored securely on your device only. It may be cryptographically packaged and reused
                            with your consent for future logins, without needing to re-verify.
                        </TP>
                        <TP style={styles.scrollView}>
                            c. You remain in full control of what personal information (e.g., username, KYC data) you share.
                            {settings.config.appName} does not transmit your data without your explicit consent.
                        </TP>

                        <TP style={styles.fontWeight}>6. Prohibited Activities</TP>
                        <TP style={styles.scrollView}>You agree not to:</TP>
                        <TP style={styles.scrollView}>a. Engage in fraudulent, illegal, or unauthorized activities.</TP>
                        <TP style={styles.scrollView}>b. Attempt to gain unauthorized access to others’ accounts or data.</TP>
                        <TP style={styles.scrollView}>c. Use our services for malicious or harmful purposes, including scams, hacks, or financial crime.</TP>

                        <TP style={styles.fontWeight}>7. Open Source & Tonomy Foundation Role</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} is open-source software, primarily maintained and contributed to by the Tonomy Foundation,
                            a non-profit entity registered in the Netherlands.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. The app store listings (Google Play Store and Apple App Store) are published and maintained by the Tonomy Foundation.
                        </TP>
                        <TP style={styles.scrollView}>
                            c. Being open-source, the software may be forked, modified, or re-distributed by third parties.
                            The Tonomy Foundation assumes no responsibility for unofficial versions of the app.
                        </TP>

                        <TP style={styles.fontWeight}>8. Service Availability</TP>
                        <TP style={styles.scrollView}>
                            a. The {settings.config.appName} service is provided on an “as is” and “as available” basis.
                            The Tonomy Foundation does not guarantee uninterrupted availability, uptime, or bug-free operation.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. The Tonomy Foundation is not liable for outages, downtime, or technical failures,
                            nor for any losses or damages resulting from such interruptions.
                        </TP>

                        <TP style={styles.fontWeight}>9. Data Privacy and Security</TP>
                        <TP style={styles.scrollView}>
                            a. We value your privacy and handle your personal information in accordance with our Privacy Policy.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. While we implement security best practices, you acknowledge that no online service is completely immune from risks.
                            You are responsible for taking appropriate precautions to secure your device and passphrase.
                        </TP>

                        <TP style={styles.fontWeight}>10. Limitation of Liability</TP>
                        <TP style={styles.scrollView}>
                            To the fullest extent permitted by law, the Tonomy Foundation and its contributors shall not be liable for any damages,
                            losses, or liabilities of any kind, whether direct or indirect, arising from:
                        </TP>
                        <TP style={styles.scrollView}>a. Your use or inability to use the app.</TP>
                        <TP style={styles.scrollView}>b. Loss of credentials, access, or digital assets.</TP>
                        <TP style={styles.scrollView}>c. Errors in third-party apps or services you connect to via {settings.config.appName}.</TP>
                        <TP style={styles.scrollView}>d. Any actions you take using your account or wallet.</TP>

                        <TP style={styles.fontWeight}>11. Governing Law and Dispute Resolution</TP>
                        <TP style={styles.scrollView}>
                            These Terms are governed by the laws of the Netherlands. Any disputes shall be resolved under Dutch jurisdiction.
                        </TP>

                        <TP style={styles.fontWeight}>12. Changes to Terms</TP>
                        <TP style={styles.scrollView}>
                            {settings.config.appName} may update these Terms from time to time. You will be notified of any significant
                            changes, and your continued use of the services constitutes acceptance of the updated Terms.
                        </TP>
                    </View>
                )}
                <View style={[styles.buttonsRow, { paddingBottom: Platform.OS === 'ios' ? 30 : 0 }]}>
                    <TButtonOutlined
                        size="medium"
                        onPress={() => setShowDeclineModal(true)} style={styles.buttonsStyle} disabled={false}>
                        DECLINE
                    </TButtonOutlined>
                    <TButtonContained
                        onPress={() => navigation.navigate('PrivacyAndPolicy')}
                        style={styles.buttonsStyle}
                        disabled={false}
                        size="medium"
                    >
                        ACCEPT
                    </TButtonContained>
                </View>
            </ScrollView>


            <TModal
                visible={showDeclineModal}
                iconColor={theme.colors.primary}
                icon="exclamation"
                title="Consent declined"
                footer={
                    <View style={styles.footerButtonRow}>
                        <View>
                            <TButtonText onPress={() => setShowDeclineModal(false)}>
                                <Text style={{ color: theme.colors.grey1 }}>Cancel</Text>
                            </TButtonText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <TButtonText onPress={() => navigation.navigate('Home')}>
                                <Text style={{ color: theme.colors.primary }}>Continue</Text>
                            </TButtonText>
                        </View>
                    </View>
                }
            >
                <View>
                    <Text style={styles.popupText}>
                        Without agreeing to the Terms of Service, you {"can't"} proceed with the use of {settings.config.appName}
                        services.
                    </Text>
                </View>
            </TModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FDFEFF',
    },
    marginTop: {
        marginTop: 20,
    },
    headerPanel: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerLabel: {
        textAlign: 'center',
    },
    innerContainer: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewConditions: {
        paddingHorizontal: 18,
        paddingRight: 18,
        paddingVertical: 0,
    },
    fulltermButton: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    fulltermText: {
        marginTop: 5,
        color: theme.colors.grey2,
        fontSize: 15,
    },
    fontWeight: {
        fontWeight: 'bold',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    threeMinText: {
        marginTop: 5,
        textAlign: 'left',
        alignItems: 'flex-end',
        color: theme.colors.grey2,
        display: 'flex',
        fontSize: 13,
    },
    scrollView: {
        color: theme.colors.textGray,
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 23,
        paddingHorizontal: 10,
    },
    chevronIcon: {
        marginTop: 10,
    },
    buttonsRow: {
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        marginTop: 10,
    },
    buttonsStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '35%',
        marginLeft: 20,
        marginRight: 20,
    },
    declineRowButton: {
        textAlign: 'center',
        flexDirection: 'row',
    },
    footerButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 70,
    },
    summaryHead: {
        fontWeight: '400',
        fontSize: 16,
    },
    popupText: {
        fontSize: 16,
        lineHeight: 20,
        color: theme.colors.textGray,
        textAlign: 'center',
    },
    listItemText: {
        color: theme.colors.textGray,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 23,
    },
});
