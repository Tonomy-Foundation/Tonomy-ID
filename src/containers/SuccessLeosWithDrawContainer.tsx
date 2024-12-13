import { StyleSheet, Image, View, ImageBackground } from 'react-native';
import { Props } from '../screens/SuccessLeosWithDrawScreen';
import theme, { commonStyles } from '../utils/theme';
import TButton, { TButtonContained } from '../components/atoms/TButton';
import { TH2, TH1, TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';

export type VestedAssetSuccessProps = {
    navigation: Props['navigation'];
    chain: IChain;
};

const SuccessLeosWithDrawContainer = ({ navigation, chain }: VestedAssetSuccessProps) => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/vesting/vested-success.png')} />
            <TH1 style={styles.vestedHead}>Top financial management!</TH1>
            <TP style={styles.vestedSubHead}>Your money is now working for you!</TP>
            <View style={styles.bottomView}>
                <TButton
                    style={styles.backBtn}
                    onPress={() =>
                        navigation.navigate('LeosAssetManager', {
                            chain,
                        })
                    }
                >
                    Back to LEOS
                </TButton>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        alignItems: 'center',
        marginTop: 15,
    },
    vestedHead: { marginTop: 8, marginBottom: 0, paddingHorizontal: 20 },
    vestedSubHead: { paddingHorizontal: 25, textAlign: 'center', marginTop: 7 },
    bottomView: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    backBtn: {
        borderRadius: 6,
        backgroundColor: theme.colors.backgroundGray,
        width: '94%',
        paddingVertical: 15,
    },
});

export default SuccessLeosWithDrawContainer;
