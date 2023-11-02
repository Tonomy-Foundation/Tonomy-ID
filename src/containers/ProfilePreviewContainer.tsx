import React, { useState, useEffect } from 'react';
import { Props } from '../screens/ProfilePreviewScreen';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TInputTextBox from '../components/TInputTextBox';
import { TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import TInfoBox from '../components/TInfoBox';
import { TButtonContained } from '../components/atoms/Tbutton';
import TModal from '../components/TModal';
import useUserStore from '../store/userStore';
import useErrorStore from '../store/errorStore';

export default function ProfilePreviewContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [informationPopup, setInformationPopup] = useState(false);
    const [accountName, setAccountName] = useState('');
    const [username, setUsername] = useState('');
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountInfo = (await user.getAccountName()).toString();

                setAccountName(accountInfo);
                const username = await user.getUsername();

                setUsername(username.getBaseUsername());
            } catch (error) {
                errorStore.setError({ error: error, expected: false });
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <View style={styles.container}>
                            <TP size={1} style={styles.textColor}>
                                Username
                            </TP>
                            <View>
                                <TInputTextBox value={username} disabled={true} />
                            </View>
                        </View>
                        <View style={[styles.container, styles.marginTop]}>
                            <TP size={1} style={styles.textColor}>
                                Anonymous User ID
                                <TouchableOpacity onPress={() => setInformationPopup(true)}>
                                    <Text style={styles.informationIcon}>?</Text>
                                </TouchableOpacity>
                            </TP>
                            <View>
                                <TInputTextBox value={accountName} disabled={true} />
                            </View>
                        </View>
                    </View>
                }
                footerHint={
                    <TInfoBox
                        align="center"
                        icon="privacy"
                        description="Your personal info is self-sovereign meaning only you control who you share it with!"
                        linkUrl={'#'}
                        linkUrlText=""
                    />
                }
                footer={
                    <View style={commonStyles.marginTop}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained>Back</TButtonContained>
                        </View>
                    </View>
                }
            />
            <TModal
                visible={informationPopup}
                iconColor={theme.colors.primary}
                icon="exclamation"
                title="Anonymus User ID"
                onPress={() => setInformationPopup(false)}
            >
                <View>
                    <Text>
                        An Anonymous User ID conceals your personal info, ensuring your transactions and interactions
                        remain discreet.
                    </Text>
                </View>
            </TModal>
        </>
    );
}

export const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    textColor: {
        color: theme.colors.textGray,
        fontWeight: '400',
        fontSize: 15,
    },
    marginTop: {
        marginTop: 25,
    },
    informationIcon: {
        color: theme.colors.primary,
        fontSize: 14,
        marginLeft: 3,
    },
});
