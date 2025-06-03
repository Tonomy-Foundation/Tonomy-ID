import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import theme, { commonStyles } from '../utils/theme';
import { ArrowUpRight, NavArrowUp, NavArrowDown } from 'iconoir-react-native';
import { Props } from '../screens/VeriffDataSharingScreen';

export default function VeriffDataSharingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [identityCollapsed, setIdentityCollapsed] = useState(false);
    const [personalCollapsed, setPersonalCollapsed] = useState(true);

    return (
        <ScrollView style={styles.container}>
            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressActive} />
                <View style={styles.progressActive} />
                <View style={styles.progressActive} />
                <View style={styles.progressInactive} />
            </View>

            {/* Top Card */}
            <View style={styles.card}>
                <View style={styles.iconRow}>
                    <Image source={require('../assets/images/anchor-codes.png')} style={styles.appIcon} />
                    <Text style={styles.dots}>. . .</Text>
                    <Image source={require('../assets/images/anchor-codes.png')} style={styles.appIcon} />
                </View>
                <Text style={styles.shareText}>
                    Share data with <Text style={styles.discord}>Discord</Text>
                </Text>
                <View style={styles.usernameView}>
                    <Text style={styles.username}>@jamiesmith</Text>
                </View>
            </View>

            {/* Reusable Identity Verification Section */}
            <View style={styles.sectionHeader}>
                <View style={styles.textContainer}>
                    <TouchableOpacity
                        style={styles.sectionWrapper}
                        onPress={() => setIdentityCollapsed(!identityCollapsed)}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 20 }}>
                                <Text style={styles.sectionTitle}>Reusable Identity Verification</Text>
                                <Text style={styles.subTitle}>
                                    Saved you time 5 times already – your KYC data was reused seamlessly
                                </Text>
                            </View>

                            {identityCollapsed ? (
                                <NavArrowDown width={16} height={16} color={theme.colors.primary} />
                            ) : (
                                <NavArrowUp width={16} height={16} color={theme.colors.primary} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {!identityCollapsed && (
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Date of birth</Text>
                                <Text style={styles.rowValue}>28 March 1989</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Name</Text>
                                <Text style={styles.rowValue}>Joseph Williams</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Gender</Text>
                                <Text style={styles.rowValue}>Male</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Nationality</Text>
                                <Text style={styles.rowValue}>Australian</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Document type</Text>
                                <Text style={styles.rowValue}>Passport</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Document number</Text>
                                <Text style={styles.rowValue}>G78DM78</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Personal Data Section */}
            <View style={styles.sectionHeader}>
                <View style={styles.textContainer}>
                    <TouchableOpacity
                        style={styles.sectionWrapper}
                        onPress={() => setPersonalCollapsed(!personalCollapsed)}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 20 }}>
                                <Text style={styles.sectionTitle}>Personal Data</Text>
                            </View>

                            {personalCollapsed ? (
                                <NavArrowDown width={16} height={16} color={theme.colors.primary} />
                            ) : (
                                <NavArrowUp width={16} height={16} color={theme.colors.primary} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {!personalCollapsed && (
                        <View style={styles.sectionContent}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Date of birth</Text>
                                <Text style={styles.rowValue}>28 March 1989</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
            {/* Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                    Your personal info is self‑sovereign meaning only you control who you share it with!
                </Text>
                <ArrowUpRight width={16} height={16} />
            </View>

            {/* Spacer to push footer into view */}
            <View style={{ height: 20 }} />
            <TButtonContained onPress={() => navigation.navigate('VeriffLoading')} style={commonStyles.marginBottom}>
                Share & Login
            </TButtonContained>
            <TButtonOutlined size="large">Cancel</TButtonOutlined>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    textContainer: {
        flex: 1, // Let it fill the space
        flexDirection: 'column',
        marginRight: 10, // Add some space between text and chevron
    },
    title: { fontSize: 18, fontWeight: '600', textAlign: 'center', paddingVertical: 12 },
    container: { paddingHorizontal: 16, paddingBottom: 20 },
    progressBarContainer: { flexDirection: 'row', marginVertical: 16 },
    progressActive: { flex: 1, height: 4, backgroundColor: theme.colors.primary, borderRadius: 2, marginRight: 4 },
    progressInactive: { flex: 1, height: 4, backgroundColor: '#ECF1F4', borderRadius: 2 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
    iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
    appIcon: { width: 40, height: 40, resizeMode: 'contain' },
    dots: { marginHorizontal: 15, marginBottom: 20, fontSize: 35, color: theme.colors.grey9 },
    shareText: { fontSize: 20, fontWeight: '600' },
    discord: { color: theme.colors.primary },
    sectionWrapper: { paddingVertical: 9, paddingLeft: 9 },
    usernameView: {
        borderRadius: 15,
        backgroundColor: theme.colors.grey6,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginTop: 8,
    },

    username: {
        borderRadius: 63,
        color: theme.colors.black,
    },
    subTitle: {
        color: theme.colors.grey9,
        fontSize: 12,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        padding: 9,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    sectionContent: {
        padding: 9,
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: 12,
    },
    noteText: { color: theme.colors.grey7, marginBottom: 12 },
    row: { flexDirection: 'column', justifyContent: 'space-between', marginBottom: 8 },
    rowLabel: { color: theme.colors.grey9, fontSize: 12 },
    rowValue: { marginTop: 2, fontSize: 13 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.grey7,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 24,
    },
    infoText: { flex: 1, fontSize: 16, marginRight: 8 },
    footerButtons: { paddingHorizontal: 16, paddingBottom: 24 },
});
