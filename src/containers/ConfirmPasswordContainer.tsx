import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import TPasswordInput from '../components/molecules/TPasswordInput';
import { Props } from '../screens/ConfirmPasswordScreen';
import { commonStyles } from '../utils/theme';

export default function ConfirmPasswordContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [password, setPassword] = useState('');

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
                            {/* TODO: navigate to change password screen */}
                            <TButtonContained
                                onPress={() => navigation.navigate('Home')}
                                disabled={password.length === 0}
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
