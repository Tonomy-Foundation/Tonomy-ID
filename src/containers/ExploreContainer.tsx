import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { commonStyles } from '../utils/theme';
import LearnMoreAutonomous from '../components/LearnMoreAutonomous';
import { useRef } from 'react';
import { Images } from '../assets';
import { ArrowRight } from 'iconoir-react-native';
import SocialIconX from '../assets/images/explore/icon-social-x';
import SocialIconLinkedIn from '../assets/images/explore/icon-social-linkedin';
import SocialIconTelegram from '../assets/images/explore/icon-social-telegram';
import SocialIconDiscord from '../assets/images/explore/icon-social-discord';
import SocialIconGithub from '../assets/images/explore/icon-social-github';

export default function ExploreContainer() {
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const onClose = () => {
        refMessage.current?.close();
    };

    const openPangeaLinks = [
        { title: 'Website', url: 'https://pangea.web4.world/' },
        { title: 'Whitepapers', url: 'https://pangea.web4.world/about/whitepapers' },
        { title: 'Pitch Decks', url: 'https://www.canva.com/design/DAGKvFBFvlQ/AicATNBAKdrj0wV6akGCZw/view' },
    ];

    const openOurSocialLinks = [
        {
            url: 'https://twitter.com/pangeaweb4',
            image: <SocialIconX />,
        },
        {
            url: 'https://www.linkedin.com/showcase/pangea-virtual-nation',
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

    const openNews = [
        {
            title: 'Pangea&apos;s LEOS Token: A MiCA-Compliant Pioneer with Exper...',
            subtitle: 'Pangea&apos;s LEOS Token: A MiCA-Compliant Pioneer with...',
            image: require('../assets/images/explore/news-1.png'),
            url: 'https://pangea-web4-world.webflow.io/news/pangeas-leos-token-a-mica-compliant-pioneer-with-expert-legal-guidance-from-taylor-wessing',
        },
        {
            title: 'Navigating the Future: Insights from Brightnodes Audit of LEOS...',
            subtitle: 'Pangea&apos;s LEOS Token: A MiCA-Compliant Pioneer with...',
            image: require('../assets/images/explore/news-2.jpg'),
            url: 'https://pangea-web4-world.webflow.io/news/navigating-the-future-insights-from-brightnodes-audit-of-leos-tokenomics',
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
                    <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/watch?v=d5b2gmJWKp4')}>
                        <Image
                            style={styles.worldFristAutonomousImage}
                            source={require('../assets/images/explore/explore-video.png')}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.subTitle}>Pangea links</Text>
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

                <Text style={styles.subTitle}>Our socials</Text>
                <View style={styles.socialLinkButtonLayout}>
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
                <Text style={styles.subTitle}>News</Text>
                <View style={styles.newsFrameLayoutContainer}>
                    {openNews.map((news, index) => (
                        <TouchableOpacity key={index} onPress={() => Linking.openURL(news.url)}>
                            <View style={styles.newsFrameLayout}>
                                <Image style={styles.newsFrameImage} source={news.image} />
                                <View>
                                    <Text style={styles.newsFrameTitle}>{news.title}</Text>
                                    <Text style={styles.newsFrameNote}>{news.subtitle}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
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
        padding: 16,
    },
    joinCommunityDiscordImage: {
        alignSelf: 'center',
        marginBottom: 22,
        height: 119,
        width: 376,
        borderRadius: 8,
    },
    worldFristAutonomous: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        borderColor: theme.colors.grey8,
    },
    worldFristAutonomousTitle: {
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 20.57,
        letterSpacing: 0.5,
        ...commonStyles.primaryFontFamily,
    },
    worldFristAutonomousNotes: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        ...commonStyles.primaryFontFamily,
    },
    worldFristAutonomousImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
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
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 26,
        paddingBottom: 8,
        ...commonStyles.primaryFontFamily,
    },
    socialLinkButtonLayout: {
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
    newsFrameImage: {
        width: 56,
        height: 56,
        borderRadius: 6,
    },
    newsFrameNote: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: theme.colors.grey9,
        width: '50%',
    },
});
