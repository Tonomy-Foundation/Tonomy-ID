import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { TCaption, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

import { IconButton } from 'react-native-paper';
export default function SettingsContainer() {
    return (
        <LayoutComponent
            body={
                <View style={{}}>
                    <TP size={1}>SECURITY</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <IconButton icon={'cog'} />
                            <TP>Password</TP>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <IconButton icon={'lock'} />
                            <TP>PIN</TP>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <IconButton icon={'fingerprint'} />
                            <TP>Fingerprint</TP>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TP size={1}>AUTONOMOUS ACCOUNT RECOVERY</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.textContainer}>
                            <IconButton icon={'help-circle'} />
                            <View>
                                <TP>Security Questions</TP>
                                <TCaption>
                                    Allow your account to be autonomously recovered when you correctly answer questions
                                    only you know about your life.
                                </TCaption>
                            </View>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.textContainer}>
                            <IconButton icon={'account-supervisor'} />
                            <View>
                                <TP>Recovery Buddies</TP>
                                <TCaption>
                                    Allow your account to be autonomously recovered by a group of people you trust.
                                </TCaption>
                            </View>
                        </View>

                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.textContainer}>
                            <IconButton icon={'credit-card-outline'} />
                            <View>
                                <TP>NFC Card Recovery</TP>
                                <TCaption>
                                    Allow your account to be autonomously recovered when you tap your secure NFC enable
                                    keycard to your phone.
                                </TCaption>
                            </View>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TP size={1}>LANGUAGE</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <IconButton icon={'translate'} />
                            <TP>Choose Language</TP>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
                    </TouchableOpacity>
                    <TP size={1}>ACCOUNT</TP>
                    <TouchableOpacity style={[styles.button, commonStyles.marginBottom]}>
                        <View style={styles.innerContainer}>
                            <IconButton icon={'logout-variant'} />
                            <TP>Logout</TP>
                        </View>
                        <IconButton icon={'chevron-right'} style={styles.chevronStyle} />
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
        alignItems: 'center',
    },
    chevronStyle: {
        alignSelf: 'center',
        marginLeft: 20,
    },
    innerContainer: {
        maxWidth: '85%',
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        width: '75%',
    },
});
