import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import TPasswordInput from '../components/molecules/TPasswordInput';
import { Props } from '../screens/homeScreen';
import { commonStyles } from '../utils/theme';
import useUserStore from '../store/userStore';
import { KeyManagerLevel } from '@tonomy/tonomy-id-sdk';

export default function ConfirmPasswordContainer({
    navigation,
    username,
}: {
    navigation: Props['navigation'];
    username: string;
}) {
    const [password, setPassword] = useState('');
    const { user } = useUserStore();
    const checkPassword = async () => {
        // Checks the Password matches
        // if(matches)
        // {
        // await user.keyManager.removeKey({ level: KeyManagerLevel.PIN });
        // navigation.goBack();
        // }
        // else
        // {
        // show Modal Password incorrect
        // }
    };

    return (
        <>
            <LayoutComponent
                body={
                    <View style={styles.container}>
                        <View style={styles.innerContainer}>
                            <TP size={1}>Enter current master password</TP>
                            <TPasswordInput value={password} onChangeText={setPassword} />
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained
                                onPress={() => navigation.navigate('SetPassword')}
                            // disabled={password.length === 0}feature/422-Change-Password-UI
                            >
                                NEXT
                            </TButtonContained>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '100%',
        height: '60%',
    },
});
