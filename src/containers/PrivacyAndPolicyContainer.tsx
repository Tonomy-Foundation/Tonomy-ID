/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image, Platform } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/TButton';
import { TH2, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { IconButton, Checkbox } from 'react-native-paper';
import TModal from '../components/TModal';
import TList from '../components/TList';
import { Props } from '../screens/PrivacyAndPolicyScreen';
import settings from '../settings';

export default function PrivacyAndPolicyContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [fullTermsShow, setFullTermsShow] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [checkedStayInLoop, setCheckedStayInLoop] = React.useState(false);
    const [checkedOptIn, setCheckedOptIn] = React.useState(false);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollViewConditions}>
                <View style={styles.headerPanel}>
                    <TH2 style={commonStyles.textAlignCenter}>Privacy Policy</TH2>
                </View>

                <View style={styles.innerContainer}>
                    <Image width={8} height={8} source={require('../assets/tonomy/Privacypolicy-amico.png')}></Image>
                </View>
                <View style={styles.marginTop}>
                    <TP style={styles.summaryHead}>Summary:</TP>
                    <View>
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    <Text style={{ fontWeight: 'bold' }}>{settings.config.appName}</Text> does not centrally store your passphrase, private keys, or identity data. These remain fully under your control on your device.
                                </Text>
                            }
                        />
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    The app operates under the principles of <Text style={{ fontWeight: 'bold' }}>self-sovereign identity</Text>, letting you decide when and with whom to share your personal data.
                                </Text>
                            }
                        />
                        <TList
                            bulletIcon="•"
                            item={
                                <View>
                                    <Text style={styles.listItemText}>
                                        Third-party processors used for specific features:
                                    </Text>
                                    <View style={{ paddingLeft: 14, marginTop: 4 }}>
                                        <TList
                                            bulletIcon="-"
                                            item={
                                                <Text style={styles.listItemText}>
                                                    <Text style={{ fontWeight: 'bold' }}>Veriff (KYC):</Text> Processes your information only when you complete verification.
                                                </Text>
                                            }
                                        />
                                        <TList
                                            bulletIcon="-"
                                            item={
                                                <Text style={styles.listItemText}>
                                                    <Text style={{ fontWeight: 'bold' }}>Sentry.io (error monitoring):</Text> Receives device, usage, and username data to help fix bugs.
                                                </Text>
                                            }
                                        />
                                        <TList
                                            bulletIcon="-"
                                            item={
                                                <Text style={styles.listItemText}>
                                                    <Text style={{ fontWeight: 'bold' }}>hCaptcha (bot protection):</Text> Collects device/IP details to prevent abuse.
                                                </Text>
                                            }
                                        />
                                    </View>
                                </View>
                            }
                        />
                        <TList
                            bulletIcon="•"
                            item={
                                <Text style={styles.listItemText}>
                                    {settings.config.appName} follows <Text style={{ fontWeight: 'bold' }}>GDPR</Text> and is regulated under Dutch law.
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
                        <Text style={styles.fulltermText}>Full Privacy Notice {'   '}</Text>
                    </View>
                    <View style={styles.leftContent}>
                        <Text style={styles.threeMinText}>(5 min read) </Text>
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
                            This Privacy Notice explains how we handle your information and data as you use our self-sovereign identity wallet services. Please review this notice carefully to understand our practices.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>1. Data Collection and Usage</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} operates on the principle of self-sovereign identity. We do not centrally store or process your personal information, including your passphrase, private keys, or identity-related data. These remain fully under your control on your device.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Exceptions: To provide and secure our services, certain third-party processors are used:
                        </TP>
                        <View style={{ paddingLeft: 14, marginTop: 4 }}>
                            <TList bulletIcon="-" item={<Text style={styles.listItemText}><Text style={{ fontWeight: 'bold' }}>Veriff (KYC provider):</Text> When you are required to complete Know Your Customer (KYC) verification, your personal information (e.g., ID documents, biometrics) is securely transmitted to Veriff for processing. Veriff may store this data during its legally required retention period, after which it is deleted in accordance with their policies.</Text>} />
                            <TList bulletIcon="-" item={<Text style={styles.listItemText}><Text style={{ fontWeight: 'bold' }}>Sentry.io (error monitoring):</Text> When application errors or crashes occur, Sentry may receive device information, technical logs, and your username. This information is used only to diagnose and fix bugs.</Text>} />
                            <TList bulletIcon="-" item={<Text style={styles.listItemText}><Text style={{ fontWeight: 'bold' }}>hCaptcha (bot protection):</Text> During account creation, hCaptcha may collect information such as device type, IP address, and browser characteristics to distinguish humans from bots. This is necessary to protect the integrity of our systems.</Text>} />
                        </View>
                        <TP style={styles.scrollView}>
                            c. Any additional data shared through your Self-Sovereign Identity Wallet (such as username, account details, or KYC data) is shared only with your explicit consent and only with the applications you choose.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>2. Passphrase and Private Keys</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} does not store your passphrase or private keys on our servers. This ensures that no one, including the Tonomy Foundation, can access or recover them.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. It is essential to keep your passphrase and private keys secure. Losing this information may result in the permanent loss of access to your identity, wallet, and tokens.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>3. Data Security</TP>
                        <TP style={styles.scrollView}>
                            We employ industry-standard security measures to protect our platform and third-party integrations. However, no online service can guarantee absolute security. You are responsible for safeguarding your device and credentials.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>4. Legal Basis for Processing</TP>
                        <TP style={styles.scrollView}>
                            a. We process your data only where necessary for the performance of our services, to comply with legal obligations (e.g., KYC/AML requirements), or based on your explicit consent.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. You have the right to withdraw your consent at any time. However, certain services (such as logging into regulated apps requiring KYC) may not function without such processing.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>5. Information Sharing</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} does not sell or share your personal information with third parties for marketing purposes.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Third-party processors (Veriff, Sentry.io, hCaptcha) receive only the information necessary to perform their services and are bound by contractual agreements to comply with GDPR.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>6. Your Rights</TP>
                        <TP style={styles.scrollView}>
                            Under GDPR, you have the right to:
                        </TP>
                        <TP style={styles.scrollView}>
                            <View style={{ paddingLeft: 14, marginTop: 4 }}>
                                <TList
                                    bulletIcon="-"
                                    item={
                                        <Text style={styles.listItemText}>
                                            Access, correction, or deletion of personal data that may be processed by third-party providers
                                            (such as Veriff for KYC, Sentry.io for error logs, or hCaptcha for bot protection).
                                        </Text>
                                    }
                                />
                                <TList
                                    bulletIcon="-"
                                    item={
                                        <Text style={styles.listItemText}>
                                            Restrict or object to processing activities carried out by these providers, in accordance with their privacy policies.
                                        </Text>
                                    }
                                />
                                <TList
                                    bulletIcon="-"
                                    item={
                                        <Text style={styles.listItemText}>
                                            Data portability – request a copy of any data held by those processors in a structured, machine-readable format.
                                        </Text>
                                    }
                                />
                            </View>
                        </TP>
                        <TP style={styles.scrollView}>
                            All identity, passphrase, and wallet data generated in {settings.config.appName} remains solely on your device and under your control. The Tonomy Foundation cannot access or recover it.
                            To exercise your GDPR rights, please contact the relevant processor directly (e.g., Veriff, Sentry.io, hCaptcha).
                            You may also contact us at contact@tonomy.foundation for guidance or assistance in directing your request.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>7. Changes to Privacy Notice</TP>
                        <TP style={styles.scrollView}>
                            {settings.config.appName} may update this Privacy Notice from time to time. Any significant changes will be communicated to you. Continued use of the app after changes indicates acceptance of the updated notice.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>8. Contact Us</TP>
                        <TP style={styles.scrollView}>
                            If you have any questions, concerns, or requests related to your privacy and data security, please contact our Data Protection Officer at contact@tonomy.foundation.
                        </TP>
                    </View>
                )
                }
                {/* <View style={styles.checkboxContainer}>
                    <View style={styles.checkbox}>
                        <Checkbox.Android
                            color={theme.colors.primary}
                            status={checkedStayInLoop ? 'checked' : 'unchecked'}
                            onPress={() => setCheckedStayInLoop(!checkedStayInLoop)}
                        />
                        <Text style={styles.checkboxText}>
                            Stay in the loop! Would you like to receive updates and exciting promotional emails from us?
                        </Text>
                    </View>
                    <View style={styles.checkbox}>
                        <Checkbox.Android
                            color={theme.colors.primary}
                            status={checkedOptIn ? 'checked' : 'unchecked'}
                            onPress={() => setCheckedOptIn(!checkedOptIn)}
                        />
                        <Text style={styles.checkboxText}>
                            Opt-in to share anonymized data analytics. This helps us understand usage patterns and improve
                            the app while respecting your privacy.
                        </Text>
                    </View>
                </View> */}

                <View style={[styles.buttonsRow, { paddingBottom: Platform.OS === 'ios' ? 20 : 0 }]}>
                    <TButtonOutlined
                        size="medium"
                        onPress={() => setShowDeclineModal(true)} style={styles.buttonsStyle} disabled={false}>
                        DECLINE
                    </TButtonOutlined>
                    <TButtonContained
                        size="medium"
                        onPress={() => navigation.navigate('Hcaptcha')} style={styles.buttonsStyle} disabled={false}>
                        ACCEPT
                    </TButtonContained>
                </View>

            </ScrollView >


            < TModal
                visible={showDeclineModal}
                iconColor={theme.colors.primary}
                icon="exclamation"
                title="Consent declined"
                footer={
                    < View style={styles.footerButtonRow} >
                        <View>
                            <TButtonText onPress={() => setShowDeclineModal(false)}>
                                <Text style={{ color: theme.colors.grey1 }}>Cancel</Text>
                            </TButtonText>
                        </View>
                        <View>
                            <TButtonText onPress={() => navigation.navigate('Home')}>
                                <Text style={{ color: theme.colors.primary }}>Continue</Text>
                            </TButtonText>
                        </View>
                    </View >
                }
            >
                <View>
                    <Text style={styles.popupText}>
                        Without agreeing to the Terms of Service, you {"can't"} proceed with the use of  {settings.config.appName}
                        services.
                    </Text>
                </View>
            </TModal >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FDFEFF',
    },
    headerPanel: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 30,
    },
    checkboxContainer: {
        paddingHorizontal: 20,
        backgroundColor: `${theme.colors.grey6}`,
        paddingVertical: 8,
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
        justifyContent: 'center',
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
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 70,
    },
    checkboxText: {
        fontSize: 13.5,
        lineHeight: 20,
        color: theme.colors.textGray,
    },
    marginTop: {
        marginTop: 20,
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
