import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained } from '../components/atoms/TButton';
import theme, { commonStyles } from '../utils/theme';
import { Props } from '../screens/VeriffLoginScreen';

export default function VeriffLoginContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    {/* Progress bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressActive} />
                        <View style={styles.progressInactive} />
                        <View style={styles.progressInactive} />
                    </View>
                    <View style={styles.identityTitle}>
                        <Text style={styles.identityText}>Let’s get you verified</Text>
                        <Text style={styles.identityNotes}>Discord would like to confirm your identity</Text>
                    </View>
                    <View style={styles.loginCard}>
                        <Image style={styles.image} source={require('../assets/images/veriff/VeriffLogin.png')} />
                    </View>
                </ScrollView>
            }
            footerHint={
                <View style={styles.hintCard}>
                    <View style={styles.bulletRow}>
                        <Text style={styles.bullet}>{'\u2022'}</Text>
                        <Text style={styles.bulletText}>Prepare a valid government-issued ID</Text>
                    </View>
                    <View style={styles.bulletRow}>
                        <Text style={styles.bullet}>{'\u2022'}</Text>
                        <Text style={styles.bulletText}>Be prepared to take a selfie and photos of your ID</Text>
                    </View>
                </View>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained
                        onPress={() => navigation.navigate('VeriffLoading')}
                        style={commonStyles.marginBottom}
                    >
                        Get Started
                    </TButtonContained>
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
        paddingBottom: 50,
    },
    appIcon: {
        width: 50,
        height: 50,
        marginBottom: 12,
    },
    loginSubtitle: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
    },
    loginCard: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        marginBottom: 30,
        marginTop: 15,
    },
    promptText: {
        flex: 1,
        fontSize: 14,
        color: 'black',
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 0,
        paddingBottom: 0,
    },
    appLink: {
        fontSize: 18,
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    usernameContainer: {
        backgroundColor: '#0000000D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
    },
    username: {
        fontSize: 14,
        color: 'black',
    },
    promptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundGray,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginTop: 30,
        paddingVertical: 18,
    },
    progressBarContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    progressActive: {
        flex: 1,
        height: 4,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    progressInactive: {
        flex: 1,
        height: 4,
        backgroundColor: '#ECF1F4',
        marginLeft: 4,
        borderRadius: 2,
    },
    image: {
        padding: 60,
    },
    identityTitle: {
        flexDirection: 'column',
        gap: 6,
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        paddingHorizontal: 10,
    },
    identityText: {
        fontWeight: '600',
        fontSize: 23,
        ...commonStyles.primaryFontFamily,
    },
    identityNotes: {
        fontWeight: '400',
        fontSize: 17,
        lineHeight: 18.75,
        ...commonStyles.secondaryFontFamily,
        flexDirection: 'column',
    },
    hintCard: {
        backgroundColor: '#F8FAFC', // light background
        borderRadius: 12,
        padding: 16,
        marginTop: 30,
        width: '100%',
    },

    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    bullet: {
        fontSize: 20,
        lineHeight: 17,
        marginRight: 6,
        color: 'black',
    },

    bulletText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 16,
        color: 'black',
    },
});
