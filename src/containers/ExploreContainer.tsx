import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Props } from '../screens/ExploreScreen';
import theme from '../utils/theme';
import LearnMoreAutonomous from '../components/LearnMoreAutonomous';
import { useRef } from 'react';
import { Images } from '../assets';
import { ArrowRight } from 'iconoir-react-native';
import SocialIconX from '../assets/images/explore/icon-social-x';
import SocialIconLinkedIn from '../assets/images/explore/icon-social-linkedin';
import SocialIconTelegram from '../assets/images/explore/icon-social-telegram';
import SocialIconDiscord from '../assets/images/explore/icon-social-discord';
import SocialIconGithub from '../assets/images/explore/icon-social-github';
import { WebView } from 'react-native-webview';

export default function ExploreContainer({ navigation }: { navigation: Props['navigation'] }) {
    const refMessage = useRef(null);
    const onClose = () => {
        (refMessage.current as any)?.close();
    };
    // const handleLearnMore = () => {
    //     (refMessage?.current as any)?.open();
    // };

    const openPangeaLinks = [
        { title: 'Website', url: 'https://pangea.web4.world/' },
        { title: 'Whitepapers', url: 'https://pangea.web4.world/about/whitepapers' },
        { title: 'Pitch Decks', url: 'https://www.canva.com/design/DAGKvFBFvlQ/AicATNBAKdrj0wV6akGCZw/' },
    ];

    const openOurSocialLinks = [
        {
            url: 'https://twitter.com/pangeaweb4',
            image: <SocialIconX />,
        },
        {
            url: 'https://www.linkedin.com/company/tonomy-foundation',
            image: <SocialIconLinkedIn />,
        },
        {
            url: 'https://t.me/pangea_web4',
            image: <SocialIconTelegram />,
        },
        {
            url: 'https://discord.gg/8zDf8AF3ja',
            image: <SocialIconDiscord />,
        },
        {
            url: 'https://github.com/Tonomy-Foundation',
            image: <SocialIconGithub />,
        },
    ];

    return (
        <View style={styles.container}>
            <LearnMoreAutonomous onClose={onClose} refMessage={refMessage} />
            <ScrollView style={styles.scrollContent}>
                <TouchableOpacity onPress={() => Linking.openURL('https://discord.gg/8zDf8AF3ja')}>
                    <Image
                        source={require('../assets/images/explore/join-community-discord.png')}
                        style={styles.joinCommunityDiscordImage}
                    />
                </TouchableOpacity>
                <View style={styles.worldFristAutonomous}>
                    <Text style={styles.worldFristAutonomousTitle}>Worlds First Autonomous Virtual Nation</Text>
                    <Text style={styles.worldFristAutonomousNotes}>Powered by Web 4.0 </Text>
                    <WebView
                        source={{ uri: 'https://www.youtube.com/embed/d5b2gmJWKp4?si=9Ufd0Py74nLUSNQc' }}
                        style={styles.video}
                        javaScriptEnabled
                        allowsInlineMediaPlayback
                    />
                </View>
                <Text style={styles.usefulLink}>Pangea links</Text>
                <View style={styles.pangeaLinkButtonLayout}>
                    {openPangeaLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => Linking.openURL(link.url)}
                            style={styles.pangeaLinkButton}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={Images.GetImage('logo1024')} style={styles.favicon} />
                                <Text style={styles.pangeaLinkButtonText}>{link.title}</Text>
                            </View>
                            <ArrowRight width={24} height={24} color={theme.colors.grey9} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.usefulLink}>Our socials</Text>
                <View style={styles.usefulLinkButtonLayout}>
                    {openOurSocialLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => Linking.openURL(link.url)}
                            style={styles.socialButton}
                        >
                            {link.image}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.usefulLink}>News</Text>
                <View style={styles.newsFrameLayoutContainer}>
                    <View style={styles.newsFrameLayout}>
                        <Image source={require('../assets/images/explore/pangea-news.png')} />
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
                        <Image source={require('../assets/images/explore/pangea-news.png')} />
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
    video: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 20,
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
        lineHeight: 20.57,
        letterSpacing: 0.5,
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
        gap: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    pangeaLinkButtonLayout: {
        flexDirection: 'column',
        gap: 8,
        flexWrap: 'wrap',
    },
    usefullLinkButton: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        width: '100%',
    },
    pangeaLinkButton: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        paddingVertical: 20,
        width: '100%',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pangeaLinkButtonText: {
        fontWeight: '400',
        fontSize: 14,
    },
    favicon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    usefullLinkButtonText: {
        fontWeight: '400',
        fontSize: 14,
        color: theme.colors.blue,
        textAlign: 'center',
    },
    socialButton: {
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
