import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import theme from '../utils/theme';
import { openURL } from 'expo-linking';
import { OpenNewWindow } from 'iconoir-react-native';

const availableAppsData = [
    {
        id: 1,
        image: require('../assets/images/sales-platform.png'),
        title: 'LEOS Sales platform',
        description:
            'Invest in Pangea, purchase LEOS tokens easily. LEOS customers are protected under Europe’s MICA regulation.',
        url: 'sales.pangea.web4.world',
        isAvailable: true,
    },
    {
        id: 2,
        image: require('../assets/images/pangea-block-explorer.png'),
        description: 'Search, view, and track your Pangea Blockchain transactions and activities in real-time.',
        title: 'Pangea Block Explorer',
        url: 'explorer.pangea.web4.world',
        isAvailable: true,
    },
    {
        id: 3,
        image: require('../assets/images/pangea-block-explorer.png'),
        title: 'Pangea Developers Features Demo',
        description:
            'A website to demonstrate the flows and features available to developers in Pangea. See the  0.5s block time, easy data signing flows and simplified non-custodial crypto management.',
        url: 'demo.pangea.web4.world',
        isAvailable: true,
    },
    {
        id: 4,
        image: require('../assets/images/pangean-bankless.png'),
        title: 'Pangea Bankless',
        description:
            'Manage your LEOS tokens as easily as any neo-banking application. Full control without compromise.',
        isAvailable: false,
    },
    {
        id: 5,
        image: require('../assets/images/pangea-dao.png'),
        title: 'Pangea DAO',
        description: 'Incorporate businesses and manage employee access and controls. Fully decentralised.',
        isAvailable: false,
    },
    {
        id: 6,
        image: require('../assets/images/pangea-gov.png'),
        title: 'Pangea Gov+',
        description: 'Participate in the liquid democracy governance of the Pangea ecosystem.',
        isAvailable: false,
    },
    {
        id: 7,
        image: require('../assets/images/pangea-build.png'),
        title: 'Pangea Build',
        description:
            'Build anything with our Low-Code/No-Code suite, empowering next-generation secure and seamless app development',
        isAvailable: false,
    },
];

export default function AppsContainer() {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <View style={styles.flexColumn}>
                    <Text style={styles.headingText}>Available now</Text>
                    {availableAppsData
                        .filter((app) => app.isAvailable)
                        .map((app) => (
                            <View key={app.id} style={styles.pangeaApp}>
                                <View style={styles.flexRow}>
                                    <Image source={app.image} />
                                    {app.url && (
                                        <TouchableOpacity
                                            style={styles.appWebUrl}
                                            onPress={() => openURL(`https://${app.url}`)}
                                        >
                                            <View style={styles.textAndIconContainer}>
                                                <Text style={styles.visitAppWebUrl}>{app.url}</Text>
                                                <OpenNewWindow
                                                    height={10}
                                                    width={12}
                                                    color={theme.colors.blue}
                                                    strokeWidth={3}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={styles.pangeaAppHead}>{app.title}</Text>
                                <Text style={styles.pangeaAppNotes}>{app.description}</Text>
                                {app.url && (
                                    <TouchableOpacity onPress={() => openURL(app.url)}>
                                        <Text style={styles.appButton}>Visit app</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    <Text style={styles.headingText}>Coming soon</Text>
                    {availableAppsData
                        .filter((app) => !app.isAvailable)
                        .map((app) => (
                            <View key={app.id} style={styles.pangeaApp}>
                                <View style={styles.flexRow}>
                                    <Image source={app.image} />
                                </View>
                                <Text style={styles.pangeaAppHead}>{app.title}</Text>
                                <Text style={styles.pangeaAppNotes}>{app.description}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.appButton}>Learn more</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 17,
    },
    scrollContent: {
        padding: 16,
    },
    flexColumn: {
        flexDirection: 'column',
        gap: 10,
    },
    appWebUrl: {
        flexDirection: 'row',
    },
    headingText: {
        fontWeight: '600',
        fontSize: 16,
    },
    pangeaApp: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 5,
    },
    leosSalesPlatformFlex: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    leosSalesPlatformLink: {
        fontSize: 10,
        fontWeight: '400',
        color: theme.colors.blue,
    },
    pangeaAppHead: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'left',
        paddingBottom: 5,
    },
    pangeaAppNotes: {
        fontSize: 13,
        fontWeight: '400',
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
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    visitAppWebUrl: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.blue,
        marginTop: -4,
        marginRight: 3,
    },
    textAndIconContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
});
