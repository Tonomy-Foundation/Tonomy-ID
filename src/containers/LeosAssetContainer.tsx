import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { AssetDetailScreenNavigationProp } from '../screens/AssetDetailScreen';
import theme, { commonStyles } from '../utils/theme';
import { ArrowDown, ArrowUp, Clock, ArrowRight } from 'iconoir-react-native';

export type AssetDetailProps = {
    navigation: AssetDetailScreenNavigationProp['navigation'];
};

const LeosAssetContainer = ({ navigation }: AssetDetailProps) => {
    return (
        <View style={styles.container}>
            {/* <ImageBackground
                source={{ uri: 'https://example.com/your-image.jpg' }} // Replace with your image URL or local asset
                style={styles.imageBackground}
                resizeMode="cover"
            >
                <View style={styles.textContainer}>
                    <Text style={styles.text}>Welcome to React Native!</Text>
                </View>
            </ImageBackground> */}
            <Text style={styles.subTitle}>Total assets</Text>

            <Text style={styles.subTitle}>Available assets</Text>

            <View style={styles.availableAssetView}>
                <View style={styles.header}>
                    <Text style={styles.headerAssetsAmount}>{`69,023.35 LEOS`}</Text>
                    <Text style={styles.headerUSDAmount}>{`= $3273.1`}</Text>

                    <View style={styles.sendReceiveButtons}>
                        <TouchableOpacity style={styles.flexCenter}>
                            <View style={styles.headerButton}>
                                <ArrowUp height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flexCenter}>
                            <View style={styles.headerButton}>
                                <ArrowDown height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>Receive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flexCenter}>
                            <View style={styles.headerButton}>
                                <Clock height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Text style={styles.subTitle}>More</Text>
            <View style={styles.moreView}>
                <Text style={{ fontWeight: '600' }}>Vested assets</Text>
                <View style={styles.flexColEnd}>
                    <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </View>
            <View style={styles.moreView}>
                <Text style={{ fontWeight: '600' }}>Staking</Text>
                <View style={styles.flexColEnd}>
                    <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 15,
    },
    imageBackground: {
        width: '100%',
        height: '10%', // Adjust the height of the section as needed
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for text visibility
        padding: 10,
        borderRadius: 5,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center', // Centers the text vertically
        alignItems: 'center', // Centers the text horizontally
    },
    text: {
        fontSize: 22,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center', // Ensures text alignment for multi-line text
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional background for better text visibility
        padding: 35,
        borderRadius: 10,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerAssetsAmount: {
        fontSize: 22,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    headerUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.grey9,
    },
    headerButton: {
        backgroundColor: theme.colors.backgroundGray,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    sendReceiveButtons: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 10,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    textSize: {
        fontSize: 12,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    availableAssetView: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        padding: 20,
    },
    subTitle: {
        marginTop: 15,
        marginBottom: 5,
        fontSize: 16,
        ...commonStyles.primaryFontFamily,
    },
    moreView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingHorizontal: 13,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
});

export default LeosAssetContainer;
