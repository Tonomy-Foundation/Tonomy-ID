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
                            item={<Text style={styles.listItemText}><Text style={{ fontWeight: 'bold' }}>{settings.config.appName}</Text> does not store or process your passphrase, private keys, or any sensitive personal data on our servers.</Text>}
                        />
                        <TList
                            bulletIcon="•"
                            item={<Text style={styles.listItemText}>The app operates under the principles of <Text style={{ fontWeight: 'bold' }}>self-sovereign identity</Text>, giving you complete control over your personal information and its usage.</Text>}
                        />
                        <TList
                            bulletIcon="•"
                            item={<Text style={styles.listItemText}><Text style={{ fontWeight: 'bold' }}>Sentry.io</Text> is the only third-party data processor used for the app, strictly for debugging and error resolution purposes.</Text>}
                        />
                        {/* <TList
                            bulletIcon="•"
                            item={<Text style={styles.listItemText}>{settings.config.appName} <Text style={{ fontWeight: 'bold' }}>never stores or processes any personal information</Text> on our servers with the following two exceptions:</Text>}
                        />
                        <TList
                            bulletIcon="•"
                            item={<Text style={styles.listItemText}>If you agree below, {settings.config.appName} will collect your email for marketing purposes and share this information with Brevo.com.</Text>}
                        />
                        <TList
                            bulletIcon="•"
                            item={<Text style={styles.listItemText}>If you agree below, {settings.config.appName} will collect usage and analytics information as you use it, which we use to improve the user experience of the application and share this information with Matamo.</Text>}
                        /> */}
                        <TList bulletIcon="•" item={<Text style={styles.listItemText}>{settings.config.appName} is regulated under Dutch law.</Text>} />
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
                        <Text style={styles.threeMinText}>(3 min read) </Text>
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
                            a. {settings.config.appName} operates on the principle of self-sovereign identity. We do not store or process any personal information, including your passphrase, private keys, or identity-related data.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Exception: We use Sentry.io as a data processor for exception and debug logs. This helps us identify and resolve technical issues. The following information may be transmitted to Sentry.io:
                            <TList bulletIcon="-" item={<Text style={styles.listItemText}>Device information.</Text>} />
                            <TList bulletIcon="-" item={<Text style={styles.listItemText}>Account name and username.</Text>} />
                        </TP>
                        <TP style={styles.scrollView}>
                            c. Any data shared through your Self-Sovereign Identity Wallet remains under your control. You determine when and with whom to share your data.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>2. Passphrase and Private Keys</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} does not store your passphrase or private keys on our servers. This enhances security by minimizing the risk of unauthorized access.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. It is essential to keep your passphrase and private keys secure. Losing this information may result in the permanent loss of access to your identity and data.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>3. Data Security</TP>
                        <TP style={styles.scrollView}>
                            While we do not store personal information, we employ industry-standard security measures to protect our platform. However, no online service can guarantee absolute security. You are responsible for safeguarding your account information.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>4. Information Sharing</TP>
                        <TP style={styles.scrollView}>
                            a. {settings.config.appName} does not share your information with third parties, except as described under &quot;Data Collection and Usage.&quot;
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Sentry.io processes only the information necessary to resolve application errors.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>5. Changes to Privacy Notice</TP>
                        <TP style={styles.scrollView}>
                            {settings.config.appName} reserves the right to update this Privacy Notice. Any significant changes will be communicated to you. Your continued use of our services after such changes implies your consent to the revised Privacy Notice.
                        </TP>

                        <TP style={{ fontWeight: 'bold' }}>6. Contact Us</TP>
                        <TP style={styles.scrollView}>
                            If you have any questions, concerns, or requests related to your privacy and data security, please contact our support team at contact@tonomy.foundation.
                        </TP>
                    </View>
                )}
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
