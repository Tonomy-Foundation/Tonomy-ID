import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import theme from '../utils/theme';
import { NavArrowRight } from 'iconoir-react-native';

type Provider = {
    id: string;
    name: string;
    domain: string;
    logo: any;
    onPress?: () => void;
};

type Props = {
    providers?: Provider[];
    onScanGovernmentId?: () => void;
};

const defaultProviders: Provider[] = [
    {
        id: 'freja',
        name: 'FREJA eID',
        domain: 'frejaeid.com',
        logo: require('../assets/tonomyProduction/favicon.png'),
    },
    {
        id: 'mobileid',
        name: 'Mobile ID',
        domain: 'mobile-id.lt',
        logo: require('../assets/tonomyProduction/favicon.png'),
    },
    {
        id: 'idverse',
        name: 'ID Verse',
        domain: 'frejaeid.com',
        logo: require('../assets/tonomyProduction/favicon.png'),
    },
];

export default function ProviderPicker({ providers = defaultProviders, onScanGovernmentId }: Props) {
    return (
        <View style={styles.card}>
            <ScrollView style={{ maxHeight: 290 }}>
                <FlatList
                    data={providers}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.8} onPress={item.onPress} style={styles.row} key={item.id}>
                            <View style={styles.logoWrap}>
                                <Image source={item.logo} style={styles.logo} />
                            </View>

                            <View style={styles.textCol}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.domain}>{item.domain}</Text>
                            </View>

                            <NavArrowRight width={25} height={30} color={theme.colors.grey9} />
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            </ScrollView>
            {/* OR divider */}
            <View style={styles.orWrap}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
            </View>

            {/* Button */}
            <TouchableOpacity activeOpacity={0.85} onPress={onScanGovernmentId} style={styles.cta}>
                <Text style={styles.ctaText}>Scan your Government ID</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 14,
        width: '100%',
    },

    listContent: {
        paddingTop: 6,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },

    logoWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    logo: {
        width: 44,
        height: 44,
        resizeMode: 'cover',
    },

    textCol: {
        flex: 1,
    },

    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },

    domain: {
        fontSize: 13,
        color: theme.colors.grey9,
    },

    separator: {
        height: 1,
        backgroundColor: theme.colors.grey8,
    },

    orWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 14,
    },

    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.grey8,
    },

    orText: {
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.grey9,
        letterSpacing: 0.6,
    },

    cta: {
        height: 52,
        borderRadius: 10,
        backgroundColor: theme.colors.backgroundGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    ctaText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
