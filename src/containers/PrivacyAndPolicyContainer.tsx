/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/Tbutton';
import { TH1, TH2, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { IconButton, Checkbox } from 'react-native-paper';
import TModal from '../components/TModal';
import TList from '../components/TList';

export default function PrivacyAndPolicyContainer() {
    const [fullTermsShow, setFullTermsShow] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [checkedStayInLoop, setCheckedStayInLoop] = React.useState(false);
    const [checkedOptIn, setCheckedOptIn] = React.useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.headerPanel}>
                <TH2 style={commonStyles.textAlignCenter}>Privacy Policy</TH2>
            </View>

            <View style={styles.innerContainer}>
                <Image width={8} height={8} source={require('../assets/tonomy/Privacypolicy-amico.png')}></Image>
            </View>
            <ScrollView style={styles.scrollViewConditions}>
                <View style={styles.marginTop}>
                    <TP style={styles.summaryHead}>Summary:</TP>
                    <View>
                        <TList
                            bulletIcon="•"
                            text="Tonomy ID never stores or processes your passphrase or private keys on our servers."
                        />
                        <TList
                            bulletIcon="•"
                            text="Tonomy ID never stores stores or processes any personal information with the following two exceptions:"
                        />
                        <TList
                            bulletIcon="•"
                            text="If you agree below, Tonomy ID will collect your email for marketing purposes and share this information with XXXX."
                        />
                        <TList
                            bulletIcon="•"
                            text="If you agree below, Tonomy ID will collect usage and analytics information as you use it, which we use to improve the user experience of the application and share this information with Matamo."
                        />
                        <TList bulletIcon="•" text="Tonomy ID is regulated under Dutch law." />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.fulltermButton}
                    onPress={() => setFullTermsShow(!fullTermsShow)}
                    activeOpacity={0.5}
                >
                    <View style={styles.leftContent}>
                        <IconButton icon="file-document-outline" color={theme.colors.grey2}></IconButton>
                        <Text style={styles.fulltermText}>Full Terms of Service {'   '}</Text>
                    </View>
                    <View style={styles.leftContent}>
                        <Text style={styles.threeMinText}>(3 min read) </Text>
                        <IconButton
                            style={styles.chevronIcon}
                            icon={fullTermsShow ? 'chevron-up' : 'chevron-down'}
                            color={theme.colors.grey2}
                        ></IconButton>
                    </View>
                </TouchableOpacity>
                {fullTermsShow && (
                    <View>
                        <TP style={styles.scrollView}>
                            This Privacy Notice explains how we handle your information and data as you use our
                            self-sovereign identity wallet services. Please review this notice carefully to understand
                            our practices.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>1. Data Collection and Usage</TP>
                        <TP style={styles.scrollView}>
                            a. Tonomy ID operates on the principle of self-sovereign identity. We do not store or
                            process any personal information, including your passphrase, private keys, or
                            identity-related data.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Any data shared through your Self-Sovereign Identity Wallet is under your control. You
                            determine when and with whom to share your data.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>2. Passphrase and Private Keys</TP>
                        <TP style={styles.scrollView}>
                            a. Tonomy ID does not store your passphrase or private keys on our servers. This enhances
                            security by minimizing the risk of unauthorized access.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. It is essential to keep your passphrase and private keys secure. Losing this information
                            may result in the permanent loss of access to your identity and data.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>3. Data Security</TP>
                        <TP style={styles.scrollView}>
                            While we do not store personal information, we employ industry-standard security measures to
                            protect our platform. However, no online service can guarantee absolute security. You are
                            responsible for safeguarding your account information.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>4. Information Sharing</TP>
                        <TP style={styles.scrollView}>
                            a. Tonomy ID does not share your information with third parties, as we do not collect or
                            store personal data.
                        </TP>
                        <TP style={styles.scrollView}>
                            b. Your data sharing choices within the Self-Sovereign Identity Wallet are entirely under
                            your control.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>5. Changes to Privacy Notice</TP>
                        <TP style={styles.scrollView}>
                            Tonomy ID reserves the right to update this Privacy Notice. Any significant changes will be
                            communicated to you. Your continued use of our services after such changes implies your
                            consent to the revised Privacy Notice.
                        </TP>
                        <TP style={{ fontWeight: 'bold' }}>6. Contact Us</TP>
                        <TP style={styles.scrollView}>
                            If you have any questions, concerns, or requests related to your privacy and data security,
                            please contact our support team at contact@tonomy.foundation.
                        </TP>
                    </View>
                )}
            </ScrollView>

            <View style={styles.checkboxContainer}>
                <View style={styles.checkbox}>
                    <Checkbox
                        color={theme.colors.primary}
                        status={checkedStayInLoop ? 'checked' : 'unchecked'}
                        onPress={() => setCheckedStayInLoop(!checkedStayInLoop)}
                    />
                    <Text style={styles.checkboxText}>
                        Stay in the loop! Would you like to receive updates and exciting promotional emails from us?
                    </Text>
                </View>
                <View style={styles.checkbox}>
                    <Checkbox
                        color={theme.colors.primary}
                        status={checkedOptIn ? 'checked' : 'unchecked'}
                        onPress={() => setCheckedOptIn(!checkedOptIn)}
                    />
                    <Text style={styles.checkboxText}>
                        Opt-in to share anonymized data analytics. This helps us understand usage patterns and improve
                        the app while respecting your privacy.
                    </Text>
                </View>
            </View>

            <View style={styles.buttonsRow}>
                <TButtonOutlined onPress={() => setShowDeclineModal(true)} style={styles.buttonsStyle} disabled={false}>
                    DECLINE
                </TButtonOutlined>
                <TButtonContained onPress={() => setShowAcceptModal(true)} style={styles.buttonsStyle} disabled={false}>
                    ACCEPT
                </TButtonContained>
            </View>

            <TModal
                visible={showAcceptModal}
                iconColor={theme.colors.primary}
                icon="exclamation"
                title="Data security"
                footer={
                    <TButtonText onPress={() => setShowAcceptModal(false)}>
                        <Text style={{ color: theme.colors.primary }}>OK</Text>
                    </TButtonText>
                }
            >
                <View>
                    <Text>
                        Secret information like passwords is only on your phone and cannot be accessed by Tonomy ID or
                        others.
                    </Text>
                    <TButtonText>
                        <Text style={{ textDecorationLine: 'underline' }}> Learn More </Text>
                    </TButtonText>
                </View>
            </TModal>

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
                        <View>
                            <TButtonText onPress={() => setShowDeclineModal(false)}>
                                <Text style={{ color: theme.colors.primary }}>Continue</Text>
                            </TButtonText>
                        </View>
                    </View>
                }
            >
                <View>
                    <Text>
                        Without agreeing to the Terms of Service, you {"can't"} proceed with the use of Tonomy {"ID's"}
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
        paddingVertical: 10,
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
    },
    checkboxText: {
        fontSize: 14,
        lineHeight: 20,
    },
    marginTop: {
        marginTop: 20,
    },
    summaryHead: {
        fontWeight: '400',
        fontSize: 16,
    },
});
