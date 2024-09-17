import { View,Text,StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Props } from '../screens/Apps';
import theme from '../utils/theme';
import LinkOpenIcon from '../assets/icons/LinkOpenIcon';

export default function AppsContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <View style={styles.flexColumn}>
                    <Text style={styles.headingText}>Available now</Text>
                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/sales-platform.png')} />
                            <TouchableOpacity style={styles.appWebUrl}>
                                <Text style={styles.leosSalesPlatformLink}>sales.pangea.web4.world</Text>
                                <LinkOpenIcon />
                            </TouchableOpacity>
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>LEOS Sales platform</Text>
                        <Text style={styles.leosSalesPlatformNotes}>Invest in Pangea, purchase LEOS tokens easily. LEOS customers are protected under Europe’s MICA regulation.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>
                
                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/pangea-block-explorer.png')} />
                            <TouchableOpacity style={styles.appWebUrl}>
                                <Text style={styles.leosSalesPlatformLink}>demo.pangea.web4.world</Text>
                                <LinkOpenIcon />
                            </TouchableOpacity>
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>Pangea Developers Features Demo</Text>
                        <Text style={styles.leosSalesPlatformNotes}>Search, view, and track your Pangea Blockchain transactions and activities in real-time.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/pangea-block-explorer.png')} />
                            <TouchableOpacity style={styles.appWebUrl}>
                                <Text style={styles.leosSalesPlatformLink}>explorer.pangea.web4.world</Text>
                                <LinkOpenIcon />
                            </TouchableOpacity>
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>Pangea Block Explorer</Text>
                        <Text style={styles.leosSalesPlatformNotes}>A website to demonstrate the flows and features available to developers in Pangea. See the 0.5s block time, easy data signing flows and simplified non-custodial crypto management.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.headingText}>Coming soon</Text>
                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/pangean-bankless.png')} />
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>Pangea Bankless</Text>
                        <Text style={styles.leosSalesPlatformNotes}>Manage your LEOS tokens as easily as any neo-banking application. Full control without compromise.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/pangea-dao.png')} />
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>Pangea DAO</Text>
                        <Text style={styles.leosSalesPlatformNotes}>Incorporate businesses and manage employee access and controls. Fully decentralised.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/pangea-gov.png')} />
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>Pangea Gov+</Text>
                        <Text style={styles.leosSalesPlatformNotes}>Participate in the liquid democracy governance of the Pangea ecosystem.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.leosSalesPlatform}>
                        <View style={styles.leosSalesPlatformFlex}>
                            <Image source={require('../assets/images/pangea-build.png')} />
                            </View>
                        <Text style={styles.leosSalesPlatformTitle}>Pangea Build</Text>
                        <Text style={styles.leosSalesPlatformNotes}>Build anything with our Low-Code/No-Code suite, empowering next-generation secure and seamless app development</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
     flex:1,
    },
    scrollContent: {
        padding:18,
    },
    flexColumn: {
        flexDirection: 'column',
        gap: 18
    },
    appWebUrl: {
        flexDirection: 'row',
        gap:2,
    },
    headingText: {
        paddingTop: 18,
        fontWeight: '600',
        fontSize: 16
    },
    leosSalesPlatform: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor:theme.colors.grey8,
        paddingHorizontal: 18,
        paddingVertical:30
    },
    leosSalesPlatformFlex: {
        flexDirection: 'row',
        gap: 9,
        justifyContent: 'space-between',
        paddingBottom: 12
    },
    leosSalesPlatformLink: {
        fontSize: 10,
        fontWeight: '400',
        lineHeight: 11.72,
        color: theme.colors.blue,
    },
    leosSalesPlatformTitle: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 18.75,
        textAlign: 'left',
        paddingBottom:8,
    },
    leosSalesPlatformNotes: {
        fontSize:14,
        fontWeight: '400',
        lineHeight: 16.41,
        color: theme.colors.grey9,
        paddingBottom:18,
    },
    visitAppButton: {
        backgroundColor: theme.colors.backgroundGray,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 4,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 14,
        
    }
});
