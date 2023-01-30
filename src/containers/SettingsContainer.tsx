import React from 'react';
import { TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native';
import { TCaption, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import PasswordIcon from '../assets/icons/PasswordIcon';
import PinIcon from '../assets/icons/PinIcon';
import SecurityQuestionsIcon from '../assets/icons/SecurityQuestionsIcon';
import BuddiesIcon from '../assets/icons/BuddiesIcon';
import CardIcon from '../assets/icons/CardIcon';
import LanguageIcon from '../assets/icons/LanguageIcon';
import LogoutIcon from '../assets/icons/LogoutIcon';
import ChevronRightIcon from '../assets/icons/ChevronRightIcon';
import { commonStyles } from '../utils/theme';
import PrintIcon from '../assets/icons/PrintIcon';
import { height } from './QrCodeScanContainer';
export default function SettingsContainer() {
    return (
        <LayoutComponent
            body={
                <View style={{}}>
                    <TP size={1}>SECURITY</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <PasswordIcon style={styles.marginStyle} />
                            <TP>Password</TP>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <PinIcon style={styles.marginStyle} />
                            <TP>PIN</TP>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <PrintIcon style={styles.marginStyle} />
                            <TP>Fingerprint</TP>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TP size={1}>AUTONOMOUS ACCOUNT RECOVERY</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <SecurityQuestionsIcon style={[styles.iconStyle, styles.marginStyle]} />
                            <View style={styles.textContainer}>
                                <TP>Security Questions</TP>
                                <TCaption>
                                    Allow your account to be autonomously recovered when you correctly answer questions
                                    only you know about your life.
                                </TCaption>
                            </View>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <BuddiesIcon style={[styles.iconStyle, styles.marginStyle]} />
                            <View style={styles.textContainer}>
                                <TP>Recovery Buddies</TP>
                                <TCaption>
                                    Allow your account to be autonomously recovered by a group of people you trust.
                                </TCaption>
                            </View>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <CardIcon style={[styles.iconStyle, styles.marginStyle]} />
                            <View style={styles.textContainer}>
                                <TP>NFC Card Recovery</TP>
                                <TCaption>
                                    Allow your account to be autonomously recovered when you tap your secure NFC enable
                                    keycard to your phone.
                                </TCaption>
                            </View>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TP size={1}>LANGUAGE</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <LanguageIcon style={styles.marginStyle} />
                            <TP>Choose Language</TP>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TP size={1}>ACCOUNT</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <LogoutIcon style={styles.marginStyle} />
                            <TP>Logout</TP>
                        </View>
                        <ChevronRightIcon style={styles.chevronStyle} />
                    </TouchableOpacity>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    innerContainer: {
        flexDirection: 'row',
    },
    textContainer: {
        maxWidth: '90%',
    },
    iconStyle: {
        marginTop: 6,
    },
    marginStyle: {
        marginRight: 6,
    },
    contentContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    chevronStyle: {
        alignSelf: 'center',
    },
});
