import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Autocomplete from '../components/AutoComplete';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPasswordScreen';
import { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1 } from '../components/atoms/THeadings';

export default function ConfirmPasswordContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [allMovies] = useState<string[]>(['abc', 'def', 'oia']);
    const [query, setQuery] = useState('');
    const isLoading = !allMovies.length;

    const queriedMovies = useMemo(() => ['abc', 'ee'], []);

    const suggestions: string[] = useMemo(() => queriedMovies || [], [queriedMovies, query]);

    const placeholder = isLoading ? 'Loading data...' : 'Enter Star Wars film title';

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Confirm passphrase</TH1>

                        <View style={styles.innerContainer}>
                            <Autocomplete
                                label=""
                                data={['Honda', 'Yamaha', 'Suzuki', 'TVS', 'suzuki2', 'suzuki6']}
                                menuStyle={{ backgroundColor: 'white' }}
                                onChange={() => {}}
                            />
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained>NEXT</TButtonContained>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    headline: {
        marginTop: -20,
        fontSize: 20,
        marginBottom: 5,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        marginTop: 40,
        justifyContent: 'center',
    },
    horizontalLine: {
        borderBottomColor: '#E4E4E4',
        borderBottomWidth: 1,
    },
});
