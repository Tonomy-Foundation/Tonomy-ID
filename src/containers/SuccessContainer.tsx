import { Image, StyleSheet, Text, View } from 'react-native';
import { SuccessNavigationProp } from '../screens/SuccessScreen';
import { IChain } from '../utils/chain/types';
import theme, { commonStyles } from '../utils/theme';
import { TButtonSecondaryContained } from '../components/atoms/TButton';

export type SuccessProps = {
    navigation: SuccessNavigationProp['navigation'];
    chain: IChain;
};

const SuccessContainer = ({ navigation, chain }: SuccessProps) => {
    return (
        <>
            <View style={styles.container}>
                <View>
                    <Image style={styles.image} source={require('../assets/images/staking/stake-success.png')} />
                </View>
                <View>
                    <Text style={styles.financialTitle}>Top financial management!</Text>
                    <Text style={styles.financialSubTitle}>Your money is now working for you!</Text>
                </View>
            </View>
            <View style={styles.proceedBtn}>
                <TButtonSecondaryContained
                    onPressIn={() =>
                        navigation.navigate('LeosAssetManager', {
                            chain: chain,
                        })
                    }
                    style={commonStyles.marginBottom}
                >
                    Back to LEOS
                </TButtonSecondaryContained>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        flex: 1,
        gap: 25,
    },
    image: {
        width: 375,
        height: 343,
        marginTop: 16,
    },
    financialTitle: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 33.89,
        letterSpacing: 0.1,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    financialSubTitle: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 21,
        letterSpacing: 0.1,
        textAlign: 'center',
        padding: 16,
        color: theme.colors.grey9,
    },
    proceedBtn: {
        padding: 16,
    },
});

export default SuccessContainer;
