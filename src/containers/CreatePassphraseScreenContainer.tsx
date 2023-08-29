import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreatePassphraseScreen';

export default function CreatePassphraseScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    async function onNext() {}

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Create passphrase</TH1>
                        <View style={styles.innerContainer}>
                            <View style={styles.columnContainer}>
                                <View style={styles.square} />
                                <View style={styles.square} />
                                <View style={styles.square} />
                                <View style={styles.square} />
                                <View style={styles.square} />
                                <View style={styles.square} />
                            </View>
                        </View>
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your passphrase and private keys are self-sovereign meaning hackers have a very  hard time! "
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footerTop={20}
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext}>NEXT</TButtonContained>
                        </View>
                        <View style={styles.textContainer}>
                            <TP size={1}>Already have an account? </TP>
                            <TouchableOpacity onPress={() => navigation.navigate('LoginUsername')}>
                                <TP size={1} style={styles.link}>
                                    Login
                                </TP>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    headline: {
        marginTop: 5,
        fontSize: 24,
    },
    innerContainer: {
        marginTop: 10,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 45,
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    columnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    square: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        borderColor: '#5B6261',
        borderWidth: 1,
        width: '38%',
        height: 60,
        margin: 15,
    },
});
