import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Props } from '../screens/Explore';
import theme from '../utils/theme';

export default function ExploreContainer ({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <Image source={require('../assets/images/join-community-discord.png')} style={styles.joinCommunityDiscordImage} />
                <View style={styles.worldFristAutonomous}>
                <Text style={styles.worldFristAutonomousTitle}>Worlds First Autonomous Virtual Nation</Text>
                    <Text style={styles.worldFristAutonomousNotes}>Powered by Web 4.0 </Text>
                    <Image source={require('../assets/images/earth-globe-network-connection.png')} />
                    <TouchableOpacity style={styles.learnMoreButton}>
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
                    <TouchableOpacity style={styles.ourSocialButtonX}>
                        <Text style={styles.ourSocialButtonText}>X</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ourSocialButtonTelegram}>
                        <Text style={styles.ourSocialButtonText}>Telegram</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ourSocialButtonLinkedIn}>
                        <Text style={styles.ourSocialButtonText}>LinkedIn</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.usefulLink}>News</Text>
                <View style={styles.newsFrameLayout}>
                    <Image source={require('../assets/images/pangea-news.png')} />
                    <View>
                        <Text style={styles.newsFrameTitle}>Pangea's LEOS Token: A MiCA-Compliant Pioneer with Exper...</Text>
                        <Text style={styles.newsFrameNote}>The Pangea Virtual Nation and its LEOS token aim to revolutionize...</Text>
                    </View> 
                </View>
            </ScrollView>
        </View>

    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContent: {
        padding: 18,
    },
    joinCommunityDiscordImage: {
        alignSelf: 'center',
        marginBottom: 32,
    },
    worldFristAutonomous: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        borderColor: theme.colors.grey8
    },
    worldFristAutonomousTitle: {
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 20.57
    },
    worldFristAutonomousNotes: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 15.73,
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
        fontSize: 14
    },
    usefulLink: {
        fontWeight: '600',
        fontSize: 16,
        marginTop: 26,
        paddingBottom:8,
    },
    usefulLinkButtonLayout: {
        flexDirection: 'row',
        gap: 8,
    },
    usefullLinkButton: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        paddingVertical: 15,
        width: 109,
        height: 56,
        
    },
    usefullLinkButtonText: {
        fontWeight: '400',
        fontSize: 14,
        color: theme.colors.blue,
        textAlign: 'center',
    },
    ourSocialButtonX:{
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor:theme.colors.black,
        paddingVertical: 15,
        width: 109,
        height: 56,
    },
    ourSocialButtonTelegram:{
        borderRadius: 8,
        backgroundColor:theme.colors.blue1,
        paddingHorizontal: 16.5,
        paddingVertical: 15,
        width: 109,
        height: 56,
    },
    ourSocialButtonLinkedIn:{
        borderRadius: 8,
        backgroundColor:theme.colors.blue2,
        paddingVertical: 15,
        width: 109,
        height: 56,
    },
    ourSocialButtonText: {
        fontWeight: '400',
        fontSize: 14,
        color: theme.colors.white,
        textAlign:'center',
    },
    newsFrameLayout:{
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.colors.grey8,
        flexDirection: 'row',
        gap: 9,
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: 343,
        marginBottom: 32
    },
    newsFrameTitle: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16.41,
        letterSpacing: 0.15,
        width: 260,
        paddingEnd:10,
               
    },
    newsFrameNote: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16.41,
        letterSpacing: 0.15,
        color: theme.colors.grey9,
        width: 260
    }


});
