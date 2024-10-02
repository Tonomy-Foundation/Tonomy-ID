import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Props } from '../screens/Apps';
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
        url: 'http://sales.pangea.web4.world',
        isAvailable: true,
    },
    {
        id: 2,
        image: require('../assets/images/pangea-block-explorer.png'),
        title: 'Pangea Developers Features Demo',
        description: 'Search, view, and track your Pangea Blockchain transactions and activities in real-time.',

        url: 'http://sales.pangea.web4.world',
        isAvailable: true,
    },
    {
        id: 3,
        image: require('../assets/images/pangea-block-explorer.png'),
        title: 'Pangea Block Explorer',
        description:
            'A website to demonstrate the flows and features available to developers in Pangea. See the  0.5s block time, easy data signing flows and simplified non-custodial crypto management.',
        url: 'http://sales.pangea.web4.world',
        isAvailable: true,
    },
    {
        id: 4,
        image: require('../assets/images/pangean-bankless.png'),
        title: 'Pangea Bankless',
        description:
            'Manage your LEOS tokens as easily as any neo-banking application. Full control without compromise.',
        url: 'http://sales.pangea.web4.world',
        isAvailable: false,
    },
    {
        id: 5,
        image: require('../assets/images/pangea-dao.png'),
        title: 'Pangea DAO',
        description: 'Incorporate businesses and manage employee access and controls. Fully decentralised.',
        url: 'http://sales.pangea.web4.world',
        isAvailable: false,
    },
    {
        id: 6,
        image: require('../assets/images/pangea-gov.png'),
        title: 'Pangea Gov+',
        description: 'Participate in the liquid democracy governance of the Pangea ecosystem.',
        url: 'http://sales.pangea.web4.world',
        isAvailable: false,
    },
    {
        id: 7,
        image: require('../assets/images/pangea-build.png'),
        title: 'Pangea Build',
        description:
            'Build anything with our Low-Code/No-Code suite, empowering next-generation secure and seamless app development',
        url: 'http://sales.pangea.web4.world',
        isAvailable: false,
    },
];
export default function AppsContainer({ navigation }: { navigation: Props['navigation'] }) {
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
                                    <TouchableOpacity style={styles.appWebUrl} onPress={() => openURL(app.url)}>
                                        <Text style={styles.visitAppWebUrl}>{app.url}</Text>
                                        <OpenNewWindow height={10} width={12} color={theme.colors.blue} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.pangeaAppHead}>{app.title}</Text>
                                <Text style={styles.pangeaAppNotes}>{app.description}</Text>
                                <TouchableOpacity onPress={() => openURL(app.url)}>
                                    <Text style={styles.appButton}>Visit app</Text>
                                </TouchableOpacity>
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
