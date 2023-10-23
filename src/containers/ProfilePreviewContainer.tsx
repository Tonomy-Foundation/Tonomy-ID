import React from 'react';
import { Props } from '../screens/ProfilePreviewScreen';
import { View, Text, StyleSheet } from 'react-native';
import TUsername from '../components/TUsername';
import { TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import TInfoBox from '../components/TInfoBox';
import { TButtonContained } from '../components/atoms/Tbutton';

export default function ProfilePreviewContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <View>
                    <View style={styles.container}>
                        <TP size={1} style={styles.textColor}>
                            Username
                        </TP>
                        <View>
                            <TUsername value={'jack.tanner'} disabled={true} />
                        </View>
                    </View>
                    <View style={[styles.container, styles.marginTop]}>
                        <TP size={1} style={styles.textColor}>
                            Anonymous User ID <Text style={styles.informationIcon}>?</Text>
                        </TP>
                        <View>
                            <TUsername value={'6845 6863 54C6 D346 '} disabled={true} />
                        </View>
                    </View>
                </View>
            }
            footerHint={
                <TInfoBox
                    align="center"
                    icon="security"
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
    },
});
