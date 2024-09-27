import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Props } from '../screens/Apps';
import theme from '../utils/theme';
import { openURL } from 'expo-linking';
import { OpenNewWindow } from 'iconoir-react-native';

export default function AppsContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <View style={styles.flexColumn}>
                    <Text style={styles.headingText}>Available now</Text>
                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/sales-platform.png')} />
                            <TouchableOpacity
                                style={styles.appWebUrl}
                                onPress={() => openURL('http://sales.pangea.web4.world')}
                            >
                                <Text style={styles.visitAppWebUrl}>sales.pangea.web4.world</Text>
                                <OpenNewWindow height={10} width={12} color={theme.colors.blue} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.pangeaAppHead}>LEOS Sales platform</Text>
                        <Text style={styles.pangeaAppNotes}>
                            Invest in Pangea, purchase LEOS tokens easily. LEOS customers are protected under Europe’s
                            MICA regulation.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-block-explorer.png')} />
                            <TouchableOpacity
                                style={styles.appWebUrl}
                                onPress={() => Linking.openURL('http://demo.pangea.web4.world')}
                            >
                                <Text style={styles.visitAppWebUrl}>demo.pangea.web4.world</Text>
                                <OpenNewWindow height={10} width={12} color={theme.colors.blue} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.pangeaAppHead}>Pangea Developers Features Demo</Text>
                        <Text style={styles.pangeaAppNotes}>
                            Search, view, and track your Pangea Blockchain transactions and activities in real-time.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-block-explorer.png')} />
                            <TouchableOpacity
                                style={styles.appWebUrl}
                                onPress={() => Linking.openURL('http://explorer.pangea.web4.world')}
                            >
                                <Text style={styles.visitAppWebUrl}>explorer.pangea.web4.world</Text>
                                <OpenNewWindow height={10} width={12} color={theme.colors.blue} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.pangeaAppHead}>Pangea Block Explorer</Text>
                        <Text style={styles.pangeaAppNotes}>
                            A website to demonstrate the flows and features available to developers in Pangea. See the
                            0.5s block time, easy data signing flows and simplified non-custodial crypto management.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.headingText}>Coming soon</Text>
                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangean-bankless.png')} />
                        </View>
                        <Text style={styles.pangeaAppHead}>Pangea Bankless</Text>
                        <Text style={styles.pangeaAppNotes}>
                            Manage your LEOS tokens as easily as any neo-banking application. Full control without
                            compromise.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-dao.png')} />
                        </View>
                        <Text style={styles.pangeaAppHead}>Pangea DAO</Text>
                        <Text style={styles.pangeaAppNotes}>
                            Incorporate businesses and manage employee access and controls. Fully decentralised.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-gov.png')} />
                        </View>
                        <Text style={styles.pangeaAppHead}>Pangea Gov+</Text>
                        <Text style={styles.pangeaAppNotes}>
                            Participate in the liquid democracy governance of the Pangea ecosystem.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-build.png')} />
                        </View>
                        <Text style={styles.pangeaAppHead}>Pangea Build</Text>
                        <Text style={styles.pangeaAppNotes}>
                            Build anything with our Low-Code/No-Code suite, empowering next-generation secure and
                            seamless app development
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.appButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 18,
    },
    flexColumn: {
        flexDirection: 'column',
        gap: 18,
        paddingBottom: 70,
    },
    appWebUrl: {
        flexDirection: 'row',
        gap: 2,
    },
    headingText: {
        paddingVertical: 5,
        fontWeight: '600',
        fontSize: 16,
    },
    pangeaApp: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    leosSalesPlatformFlex: {
        flexDirection: 'row',
        gap: 9,
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    leosSalesPlatformLink: {
        fontSize: 10,
        fontWeight: '400',
        lineHeight: 11.4,
        color: theme.colors.blue,
    },
    pangeaAppHead: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 18.75,
        textAlign: 'left',
        paddingBottom: 8,
    },
    pangeaAppNotes: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 16.41,
        color: theme.colors.grey9,
        paddingBottom: 16,
    },
    appButton: {
        borderRadius: 4,
        backgroundColor: theme.colors.backgroundGray,
        paddingHorizontal: 16,
        paddingVertical: 12,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 14,
    },
    flexRow: {
        flexDirection: 'row',
        gap: 9,
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    visitAppWebUrl: {
        fontSize: 10.5,
        fontWeight: '400',
        lineHeight: 11.4,
        color: theme.colors.blue,
    },
});
