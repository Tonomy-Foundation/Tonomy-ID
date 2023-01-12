import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { TButtonOutlined } from '../components/atoms/Tbutton';
import { TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

export const width = Dimensions.get('window').width * 0.01;
export const height = Dimensions.get('window').height * 0.01;

export default function SettingsScreenContainer() {

    return (
        <LayoutComponent
            body={
                <View>
                    <View style={styles.container}>
                        {<TP size={2}>SettingsScreenContainer</TP>}
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            height: '100%',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <TP
                            size={2}
                            style={{
                                color: 'white',
                            }}
                        >
                            Align QR Code within frame to scan
                        </TP>
                    </View>
                </View>
            }
            footer={
                <View>
                    <TButtonOutlined style={commonStyles.marginBottom}>Cancel</TButtonOutlined>
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
    container: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    },
});
