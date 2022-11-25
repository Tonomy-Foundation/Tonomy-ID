import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TButton from '../components/Tbutton';
import TLink from '../components/TA';
import { TCaption, TH1, TP } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { randomString, SdkError, SdkErrors } from 'tonomy-id-sdk';
import TUsername from '../components/TUsername';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

export default function CreateAccountUsernameContainer({ navigation }: { navigation: NavigationProp<any> }) {
    let startUsername = '';
    if (!settings.isProduction()) {
        startUsername = 'test' + randomString(2);
    }
    const [username, setUsername] = useState(startUsername);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const user = useUserStore().user;

    async function onNext() {
        setLoading(true);

        try {
            await user.saveUsername(username, settings.config.accountSuffix);
        } catch (e) {
            if (e instanceof SdkError && e.code === SdkErrors.UsernameTaken) {
                setErrorMessage('Username already exists');
                setLoading(false);
                return;
            } else {
                setLoading(false);
                // TODO throw unexpected error
                throw e;
            }
        }

        setLoading(false);
        navigation.navigate('createAccountPassword');
    }

    return (
        <LayoutComponent
            body={
                <View>
                    <TH1>Create your username</TH1>

                    <View style={commonStyles.marginBottom}>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your username is private and can only be seen by you and those you share it with, not even Tonomy
                         Foundation can see it."
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>

                    <TUsername
                        errorText={errorMessage}
                        suffix={settings.config.accountSuffix}
                        value={username}
                        onChangeText={setUsername}
                        label="Username"
                    />
                </View>
            }
            footerHint={
                <View style={[commonStyles.centeredText, commonStyles.marginBottom]}>
                    <TCaption>You can always change your username later</TCaption>
                </View>
            }
            footer={
                <View>
                    <View style={commonStyles.marginBottom}>
                        <TButton
                            onPress={onNext}
                            mode="contained"
                            disabled={username.length === 0 || loading}
                            loading={loading}
                        >
                            Next
                        </TButton>
                    </View>
                    <View style={commonStyles.centeredText}>
                        <TP size={1}>
                            Already have an account? <TLink href="login">Login</TLink>
                        </TP>
                    </View>
                </View>
            }
        ></LayoutComponent>
    );
}
