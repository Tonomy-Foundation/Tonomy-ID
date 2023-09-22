/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import TButton, { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import { randomString } from '@tonomy/tonomy-id-sdk';
import LayoutComponent from '../components/layout';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/CreateAccountUsernameScreen';
import { IconButton } from 'react-native-paper';
import TModal from '../components/TModal';
import TList from '../components/TList';

export default function TermsAndConditionContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [fullTermsShow, setFullTermsShow] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.headerPanel}>
                <TH1 style={commonStyles.textAlignCenter}>Terms & Conditions</TH1>
            </View>

            <View style={styles.innerContainer}>
                <TP style={styles.headerLabel}>Terms & Conditions</TP>
                <Image width={8} height={8} source={require('../assets/tonomy/Agreement-amico.png')}></Image>
            </View>
            <ScrollView style={styles.scrollViewConditions}>
                <View>
                    <TP>Summary:</TP>
                    <TP children={undefined}></TP>
                    <View>
                        <TList
                            bulletIcon="•"
                            text="You can use Tonomy ID to log into and share data with applications that support Tonomy ID."
                        />
                        <TList
                            bulletIcon="•"
                            text="Please remember or keep a secure copy of your master passphrase and username."
                        />
                        <TList
                            bulletIcon="•"
                            text="You (and not the Tonomy Foundation) are responsible for using and behaving according to
                            regulatory requirements in applications you log into with Tonomy ID."
                        />
                        <TList
                            bulletIcon="•"
                            text="Tonomy ID uses advanced digital signatures to enhance data security, integrity, and
                            regulatory compliance for interactions with supported applications. Tonomy ID is regulated
                            under Dutch law."
                        />
                        <TList bulletIcon="•" text="Tonomy ID is regulated under Dutch law." />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.fulltermButton}
                    onPress={() => setFullTermsShow(!fullTermsShow)}
                    activeOpacity={0.5}
                >
                    <IconButton icon="file-document-outline" color={theme.colors.grey2}></IconButton>
                    <Text style={styles.fulltermText}>Full Terms of Service {'   '}</Text>
                    <Text style={styles.threeMinText}>(3 min read) </Text>
                    <IconButton
                        style={styles.chevronIcon}
                        icon={fullTermsShow ? 'chevron-up' : 'chevron-down'}
                        color={theme.colors.grey2}
                    ></IconButton>
                </TouchableOpacity>
                {fullTermsShow && (
                    <View>
                        <TP>
                            These Terms of Service {'Terms'} outline the agreement between you and Tonomy ID regarding
                            the use of our self-sovereign identity wallet services. Please read these Terms carefully
                            before using our platform.
                        </TP>
                        <TP>
                            1. Acceptance of Terms By accessing or using the Tonomy ID Self-Sovereign Identity Wallet,
                            you acknowledge that you have read, understood, and agreed to these Terms. If you do not
                            agree with these Terms, please refrain from using our services.
                        </TP>
                        <TP>
                            2. User Responsibilities a. You are responsible for maintaining the confidentiality of your
                            passphrase and private keys associated with your Tonomy ID Self-Sovereign Identity Wallet.
                            This information is crucial for ensuring the security of your identity and data. b. You
                            agree to use the wallet in compliance with applicable laws and regulations. You are solely
                            responsible for any activities conducted through your account.
                        </TP>
                        <TP>
                            3. Self-Sovereign Identity a. Tonomy ID operates on the principle of self-sovereign
                            identity, meaning you have complete control over sharing your personal information. You
                            decide when and with whom you share your data. b. Tonomy ID does not store your passphrase
                            or private keys. This enhances security, making it challenging for unauthorized access.
                        </TP>
                        <TP>
                            4. Prohibited Activities You agree not to: a. Engage in fraudulent, illegal, or unauthorized
                            activities. b. Attempt to gain unauthorized access to others accounts or data. c. Use our
                            services for any malicious or harmful purposes.
                        </TP>
                        <TP>
                            5. Changes to Services Tonomy ID reserves the right to modify, suspend, or discontinue
                            services at any time without notice. We are not liable for any losses resulting from such
                            actions.
                        </TP>
                        <TP>
                            6. Data Privacy and Security a. We value your privacy and handle your personal information
                            in accordance with our Privacy Policy. By using our services, you consent to the collection,
                            use, and storage of your data as outlined in the policy. ab. While we strive to maintain the
                            security of your information, you acknowledge that no online service is completely immune to
                            risks. You are responsible for taking appropriate precautions to secure your account.
                        </TP>
                        <TP>
                            7. Limitation of Liability Tonomy ID is not liable for any direct, indirect, incidental, or
                            consequential damages arising from your use or inability to use the Self-Sovereign Identity
                            Wallet. Our liability is limited to the extent permitted by law.
                        </TP>
                        <TP>
                            8. Governing Law and Dispute Resolution These Terms are governed by the laws of Netherlands.
                        </TP>
                        <TP>
                            9. Changes to Terms Tonomy ID may update these Terms from time to time. You will be notified
                            of any significant changes, and your continued use of the services constitutes acceptance of
                            the updated Terms. Less
                        </TP>
                    </View>
                )}
            </ScrollView>
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
                onPress={() => setShowAcceptModal(false)}
                icon="exclamation"
                title="Data security"
            >
                <View>
                    <Text>
                        Secret information like passwords is only on your phone and cannot be accessed by Tonomy ID or
                        others.
                    </Text>
                    <TButtonText>
                        <Text> Learn More </Text>
                    </TButtonText>
                </View>
            </TModal>

            <TModal
                visible={showDeclineModal}
                iconColor={theme.colors.primary}
                onPress={() => setShowDeclineModal(false)}
                icon="exclamation"
                buttonLabel={'Continue'}
                title="Consent declined"
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
        backgroundColor: '#F9F9F9',
        paddingTop: 40,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
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
        justifyContent: 'flex-start',
    },
    fulltermText: {
        marginTop: 5,
        color: theme.colors.grey2,
    },
    threeMinText: {
        marginTop: 5,
        textAlign: 'left',
        alignItems: 'flex-end',
        color: theme.colors.grey2,
        fontSize: 12,
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
});
