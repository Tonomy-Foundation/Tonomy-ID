import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import theme from '../utils/theme';
import { openURL } from 'expo-linking';
import { OpenNewWindow } from 'iconoir-react-native';
import settings from '../settings';

const availableAppsData = [
    {
        image: require('../assets/tonomyProduction/favicon.png'),
        title: `${settings.config.ecosystemName} DAO on Hypha`,
        description: `Collaborate and make decisions within the ${settings.config.ecosystemName} ecosystem with others.`,
        url: 'https://tonomy.hypha.earth/tonomy-dao/',
        isAvailable: true,
    },
    {
        image: require('../assets/images/apps/hypha-logo.jpeg'),
        title: 'Hypha DAO Platform',
        description:
            'Harnes the power of team-driven decisions. Create proposals, vote, and manage your DAO with ease.',
        url: 'https://tonomy.hypha.earth',
        isAvailable: true,
    },
    {
        image: require('../assets/images/apps/bankless-icon.png'),
        title: 'Tonomy Bankless',
        description: `Swap your Tonomy coins quickly and securely — no banks, no middlemen, no hassle`,
        url: settings.config.tonomyAppsOrigin + '/bankless',
        isAvailable: true,
    },
    {
        image: require('../assets/tonomyProduction/favicon.png'),
        title: 'Tonomy Launchpad',
        description: `Invest in ${settings.config.ecosystemName}, purchase ${settings.config.currencySymbol} tokens easily. ${settings.config.currencySymbol} customers are protected under Europe’s MICA regulation.`,
        url: 'https://launchpad.tonomy.io',
        isAvailable: true,
    },
    {
        image: require('../assets/tonomyProduction/favicon.png'),
        description: `Search, view, and track your ${settings.config.ecosystemName} Blockchain transactions and activities in real-time.`,
        title: `${settings.config.ecosystemName} Block Explorer`,
        url: 'https://explorer.tonomy.io',
        isAvailable: true,
    },
    {
        image: require('../assets/tonomyProduction/favicon.png'),
        title: `${settings.config.ecosystemName} Developers Features Demo`,
        description: `A website to demonstrate the flows and features available to developers in ${settings.config.ecosystemName}. See the  0.5s block time, easy data signing flows and simplified non-custodial crypto management.`,
        url: 'https://demo.tonomy.io',
        isAvailable: true,
    },
    // {
    //     image: require('../assets/images/apps/pangean-bankless.png'),
    //     title: `${settings.config.ecosystemName} Bankless`,
    //     description: `Manage your ${settings.config.currencySymbol} tokens as easily as any neo-banking application. Full control without compromise.`,
    //     isAvailable: false,
    //     url: '#',
    // },
    // {
    //     image: require('../assets/images/apps/pangea-dao.png'),
    //     title: `${settings.config.ecosystemName} DAO on Hypha`,
    //     description: 'Incorporate businesses and manage employee access and controls. Fully decentralised.',
    //     isAvailable: false,
    //     url: '#',
    // },
    // {
    //     image: require('../assets/images/apps/pangea-gov.png'),
    //     title: `${settings.config.ecosystemName} Gov+`,
    //     description: `Participate in the liquid democracy governance of the ${settings.config.ecosystemName} ecosystem.`,
    //     isAvailable: false,
    //     url:'#',
    // },
    // {
    //     image: require('../assets/images/apps/pangea-build.png'),
    //     title: `${settings.config.ecosystemName} Build`,
    //     description:
    //         'Build anything with our Low-Code/No-Code suite, empowering next-generation secure and seamless app development',
    //     isAvailable: false,
    //     url: '#',
    // },
];

function getUrlHost(url: string) {
    const urlObject = new URL(url);

    return urlObject.host;
}

export default function AppsContainer() {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <View style={styles.flexColumn}>
                    <Text style={styles.headingText}>Available now</Text>
                    {availableAppsData
                        .filter((app) => app.isAvailable)
                        .map((app, index) => (
                            <View key={index} style={styles.app}>
                                <View style={styles.flexRow}>
                                    <Image source={app.image} />
                                    {app.url && (
                                        <TouchableOpacity style={styles.appWebUrl} onPress={() => openURL(app.url)}>
                                            <View style={styles.textAndIconContainer}>
                                                <Text style={styles.visitAppWebUrl}>{getUrlHost(app.url)}</Text>
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
                                <Text style={styles.appHead}>{app.title}</Text>
                                <Text style={styles.appNotes}>{app.description}</Text>
                                {app.url && (
                                    <TouchableOpacity onPress={() => openURL(app.url)}>
                                        <Text style={styles.appButton}>Visit app</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    {/* <Text style={styles.headingText}>Coming soon</Text> */}
                    {availableAppsData
                        .filter((app) => !app.isAvailable)
                        .map((app, index) => (
                            <View key={index} style={styles.app}>
                                <View style={styles.flexRow}>
                                    <Image source={app.image} />
                                </View>
                                <Text style={styles.appHead}>{app.title}</Text>
                                <Text style={styles.appNotes}>{app.description}</Text>
                                <TouchableOpacity onPress={() => openURL(app.url)}>
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
        marginTop: 6,
    },
    scrollContent: {
        padding: 16,
    },
    flexColumn: {
        flexDirection: 'column',
        gap: 10,
        marginBottom: 65,
    },
    appWebUrl: {
        flexDirection: 'row',
    },
    headingText: {
        fontWeight: '600',
        fontSize: 16,
    },
    app: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 5,
    },
    appHead: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'left',
        paddingBottom: 5,
    },
    appNotes: {
        fontSize: 14,
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
        fontSize: 10,
        fontWeight: '500',
        color: theme.colors.blue,
        marginTop: -2,
        marginRight: 3,
    },
    textAndIconContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
});
