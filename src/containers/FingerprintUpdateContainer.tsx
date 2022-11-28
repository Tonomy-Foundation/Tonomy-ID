import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import FingerprintIcon from '../assets/icons/FingerprintIcon';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

export default function CreateAccountContainer() {
    return (
        <LayoutComponent
            body={
                <View>
                    <View>
                        <TH1>Would you like to add a fingerprint for added security?</TH1>
                    </View>
                    <View>
                        <TP size={1}>This is easier than using your PIN every time.</TP>
                    </View>
                    <View style={styles.imageWrapper}>
                        <FingerprintIcon style={styles.image}></FingerprintIcon>
                    </View>
                </View>
            }
            footer={
                <View>
                    <TButtonContained style={commonStyles.marginBottom}>Next</TButtonContained>
                    <TButtonOutlined style={commonStyles.marginBottom}>Skip</TButtonOutlined>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    image: {
        marginTop: 50,
        alignSelf: 'center',
        width: 200,
        height: 200,
    },
    imageWrapper: {
        padding: 40,
        alignSelf: 'center',
    },
});
