import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { TButtonOutlined } from '../components/atoms/Tbutton';
import { TP, TCaption, TH2, TH1 } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

export const width = Dimensions.get('window').width * 0.01;
export const height = Dimensions.get('window').height * 0.01;

export default function SettingsScreenContainer() {

    return (
        <LayoutComponent
            body={
                <View>
                    <View
                        style={{
                            width: width * 90,
                            alignSelf: 'center',
                        }}
                    >
                        {<TP size={1}>Security</TP>}
                        <View style={{
                            flexDirection: 'row'
                        }}>
                            <TP style={{
                                width: '10%',
                                marginRight: '2.5%',
                                backgroundColor: 'purple'
                            }}>
                                ICON
                            </TP>
                            <TP size={1} style={{
                                color: '#272727',
                                width: '72.5%',
                                marginRight: '2.5%',
                                backgroundColor: 'red'
                            }}>
                                Password
                            </TP>
                            <TP style={{
                                width: '12.5%',
                                backgroundColor: 'yellow'
                            }}>
                                Arrow Icon
                            </TP>
                        </View>
                    </View>
                </View>
            }
        // footer={
        //     <View>
        //         <TButtonOutlined style={commonStyles.marginBottom}>Cancel</TButtonOutlined>
        //     </View>
        // }
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
