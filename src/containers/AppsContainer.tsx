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
                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/sales-platform.png')} />
                            <TouchableOpacity style={styles.appWebUrl}>
                                <Text style={styles.visitAppWebUrl}>sales.pangea.web4.world</Text>
                                <LinkOpenIcon />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>LEOS Sales platform</Text>
                        <Text style={styles.pangeaVisitAppNotes}>Invest in Pangea, purchase LEOS tokens easily. LEOS customers are protected under Europe’s MICA regulation.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>
                
                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-block-explorer.png')} />
                            <TouchableOpacity style={styles.appWebUrl}>
                                <Text style={styles.visitAppWebUrl}>demo.pangea.web4.world</Text>
                                <LinkOpenIcon />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>Pangea Developers Features Demo</Text>
                        <Text style={styles.pangeaVisitAppNotes}>Search, view, and track your Pangea Blockchain transactions and activities in real-time.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-block-explorer.png')} />
                            <TouchableOpacity style={styles.appWebUrl}>
                                <Text style={styles.visitAppWebUrl}>explorer.pangea.web4.world</Text>
                                <LinkOpenIcon />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>Pangea Block Explorer</Text>
                        <Text style={styles.pangeaVisitAppNotes}>A website to demonstrate the flows and features available to developers in Pangea. See the 0.5s block time, easy data signing flows and simplified non-custodial crypto management.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Visit app</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.headingText}>Coming soon</Text>
                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangean-bankless.png')} />
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>Pangea Bankless</Text>
                        <Text style={styles.pangeaVisitAppNotes}>Manage your LEOS tokens as easily as any neo-banking application. Full control without compromise.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-dao.png')} />
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>Pangea DAO</Text>
                        <Text style={styles.pangeaVisitAppNotes}>Incorporate businesses and manage employee access and controls. Fully decentralised.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-gov.png')} />
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>Pangea Gov+</Text>
                        <Text style={styles.pangeaVisitAppNotes}>Participate in the liquid democracy governance of the Pangea ecosystem.</Text>
                        <TouchableOpacity>
                            <Text style={styles.visitAppButton}>Learn more</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pangeaVisitApp}>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/pangea-build.png')} />
                        </View>
                        <Text style={styles.pangeaVisitAppHead}>Pangea Build</Text>
                        <Text style={styles.pangeaVisitAppNotes}>Build anything with our Low-Code/No-Code suite, empowering next-generation secure and seamless app development</Text>
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
        gap: 18,
        paddingBottom:150
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
    pangeaVisitApp: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor:theme.colors.grey8,
        paddingHorizontal: 16,
        paddingVertical:24
    },
    flexRow: {
        flexDirection: 'row',
        gap: 9,
        justifyContent: 'space-between',
        paddingBottom: 12
    },
    visitAppWebUrl: {
        fontSize: 10.5,
        fontWeight: '400',
        lineHeight: 11.40,
        color: theme.colors.blue,
    },
    pangeaVisitAppHead: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 18.75,
        textAlign: 'left',
        paddingBottom:8,
    },
    pangeaVisitAppNotes: {
        fontSize:14,
        fontWeight: '400',
        lineHeight: 16.41,
        color: theme.colors.grey9,
        paddingBottom:18,
    },
    visitAppButton: {
        borderRadius: 4,
        backgroundColor: theme.colors.backgroundGray,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 5,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 14 
    }
});
