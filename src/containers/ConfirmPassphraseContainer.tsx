import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
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
                            <View style={styles.autocompleteContainer}>
                                <Autocomplete
                                    editable={!isLoading}
                                    autoCorrect={false}
                                    data={suggestions}
                                    value={query}
                                    onChangeText={setQuery}
                                    placeholder={placeholder}
                                    flatListProps={{
                                        keyboardShouldPersistTaps: 'always',
                                        renderItem: ({ item }) => (
                                            <View>
                                                <TouchableOpacity onPress={() => setQuery(item)}>
                                                    <Text style={styles.itemText}>{item}</Text>
                                                </TouchableOpacity>
                                                <View style={styles.horizontalLine} />
                                            </View>
                                        ),
                                    }}
                                />
                            </View>
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
        width: '100%',
        height: '60%',
    },
    itemText: {
        fontSize: 15,
        padding: 4,
        margin: 0,
    },
    horizontalLine: {
        borderBottomColor: '#E4E4E4',
        borderBottomWidth: 1,
    },
    autocompleteContainer: {
        flex: 1,
        padding: 15,
        // position: 'relative',
    },
});
