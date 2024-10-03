import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Props } from '../screens/ExploreScreen';
import theme from '../utils/theme';
import LearnMoreAutonomous from '../components/LearnMoreAutonomous';
import { useRef } from 'react';

export default function ExploreContainer({ navigation }: { navigation: Props['navigation'] }) {
    const refMessage = useRef(null);
    const onClose = () => {
        (refMessage.current as any)?.close();
    };
    const handleLearnMore = () => {
        (refMessage?.current as any)?.open();
    };

    return (
        <View style={styles.container}>
            <LearnMoreAutonomous onClose={onClose} refMessage={refMessage} />
            <ScrollView style={styles.scrollContent}>
                <Image
                    source={require('../assets/images/join-community-discord.png')}
                    style={styles.joinCommunityDiscordImage}
                />
                <View style={styles.worldFristAutonomous}>
                    <Text style={styles.worldFristAutonomousTitle}>Worlds First Autonomous Virtual Nation</Text>
                    <Text style={styles.worldFristAutonomousNotes}>Powered by Web 4.0 </Text>
                    <Image source={require('../assets/images/earth-globe-network-connection.png')} />
                    <TouchableOpacity style={styles.learnMoreButton} onPress={handleLearnMore}>
                        <Text style={styles.learnMoreButtonText}>Learn more</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.usefulLink}>Useful links</Text>
                <View style={styles.usefulLinkButtonLayout}>
                    <TouchableOpacity style={styles.usefullLinkButton}>
                        <Text style={styles.usefullLinkButtonText}>Website</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.usefullLinkButton}>
                        <Text style={styles.usefullLinkButtonText}>Whitepapers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.usefullLinkButton}>
                        <Text style={styles.usefullLinkButtonText}>Pitch decks</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.usefulLink}>Our socials</Text>
                <View style={styles.usefulLinkButtonLayout}>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.colors.black }]}>
                        <Text style={styles.socialButtonText}>X</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#00AEED' }]}>
                        <Text style={styles.socialButtonText}>Telegram</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#007BB5' }]}>
                        <Text style={styles.socialButtonText}>LinkedIn</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.usefulLink}>News</Text>
                <View style={styles.newsFrameLayoutContainer}>
                    <View style={styles.newsFrameLayout}>
                        <Image source={require('../assets/images/pangea-news.png')} />
                        <View>
                            <Text style={styles.newsFrameTitle}>
                                Pangea&apos;s LEOS Token: A MiCA-Compliant Pioneer with Exper...
                            </Text>
                            <Text style={styles.newsFrameNote}>
                                The Pangea Virtual Nation and its LEOS token aim to revolutionize...
                            </Text>
                        </View>
                    </View>
                    <View style={styles.newsFrameLayout}>
                        <Image source={require('../assets/images/pangea-news.png')} />
                        <View>
                            <Text style={styles.newsFrameTitle}>
                                Pangea&apos;s LEOS Token: A MiCA-Compliant Pioneer with Exper...
                            </Text>
                            <Text style={styles.newsFrameNote}>
                                The Pangea Virtual Nation and its LEOS token aim to revolutionize...
                            </Text>
                        </View>
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
        padding: 16,
    },
    joinCommunityDiscordImage: {
        alignSelf: 'center',
        marginBottom: 22,
        width: '100%',
        borderRadius: 8,
    },
    worldFristAutonomous: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        borderColor: theme.colors.grey8,
    },
    worldFristAutonomousTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    worldFristAutonomousNotes: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    learnMoreButton: {
        borderRadius: 4,
        backgroundColor: theme.colors.backgroundGray,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 12,
    },
    learnMoreButtonText: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 14,
    },
    usefulLink: {
        fontWeight: '600',
        fontSize: 16,
        marginTop: 26,
        paddingBottom: 8,
    },
    usefulLinkButtonLayout: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    usefullLinkButton: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        paddingVertical: 18,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        flexBasis: 0,
    },
    usefullLinkButtonText: {
        fontWeight: '400',
        fontSize: 14,
        color: theme.colors.blue,
        textAlign: 'center',
    },
    socialButton: {
        paddingVertical: 18,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        flexBasis: 0,
    },
    socialButtonText: {
        fontWeight: '600',
        fontSize: 14,
        color: theme.colors.white,
        textAlign: 'center',
    },
    newsFrameLayoutContainer: {
        flexDirection: 'column',
        gap: 15,
        marginBottom: 70,
    },
    newsFrameLayout: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        flexDirection: 'row',
        gap: 9,
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: '100%',
    },
    newsFrameTitle: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16.41,
        letterSpacing: 0.15,
        width: 260,
        paddingEnd: 10,
    },
    newsFrameNote: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: theme.colors.grey9,
        width: '50%',
    },
});
