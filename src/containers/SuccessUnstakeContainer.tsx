import { StyleSheet, Image, View } from 'react-native';
import { Props } from '../screens/SuccessUnstakeScreen';
import theme from '../utils/theme';
import TButton from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';

export type SuccessUnstakeProps = {
    navigation: Props['navigation'];
    chain: IChain;
};

const SuccessUnstakeContainer = ({ navigation, chain }: SuccessUnstakeProps) => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/vesting/success-stake.png')} />
            <TH1 style={styles.vestedHead}>{"You're Amazing!"}</TH1>
            <TP style={styles.vestedSubHead}>
                Sit back and relax as your coins become available soon. Thanks for being with us!
            </TP>
            <View style={styles.bottomView}>
                <TButton
                    style={styles.backBtn}
                    onPress={() =>
                        navigation.navigate('AssetManager', {
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
        marginTop: 20,
    },
    vestedHead: { marginTop: 8, marginBottom: 0, paddingHorizontal: 20 },
    vestedSubHead: {
        paddingHorizontal: 25,
        fontSize: 17,
        textAlign: 'center',
        marginTop: 7,
        color: theme.colors.grey9,
    },
    bottomView: {
        position: 'absolute',
        bottom: 40,
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

export default SuccessUnstakeContainer;
