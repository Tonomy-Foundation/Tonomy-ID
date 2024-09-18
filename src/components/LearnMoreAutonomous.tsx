import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from '../components/TIconButton';
import theme from '../utils/theme';

export type QRScanProps = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
};

const LearnMoreAutonomous = (props: QRScanProps) => {
    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={750}
            customStyles={{ container: { borderTopStartRadius: 8, borderTopEndRadius: 8 } }}
        >
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>What is Pangea</Text>
                <TouchableOpacity onPress={props.onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <ScrollView>
            <View style={styles.content}>
                <Text style={styles.drawerTitle}>Pangea is a Virtual Nation</Text>
                <Text style={styles.darwerContent}>A Virtual Nation, embodies a community governed online,where members participate in <Text style={styles.drawerInnerContent}>decentralized decision-making processes, </Text>have<Text style={styles.drawerInnerContent}> digital citizenship, </Text>and engage in <Text style={styles.drawerInnerContent}>secure, borderless interactions.</Text> </Text>
                    <Image style={{ marginVertical: 26}} source={require('../assets/images/pangea-web-platform.png')} />
                    <View style={{flexDirection:'column', gap:22}}>
                <Text style={styles.drawerTitle}>Pangea is a Web 4.0 Platform</Text>
                <Text style={styles.darwerContent}>Web4 builds upon the decentralized foundation of Web3, with a <Text style={styles.drawerInnerContent}>seamless user experience</Text> to create an interconnected, <Text style={styles.drawerInnerContent}>intelligent digital ecosystem.</Text></Text>
                <Text style={styles.darwerContent}><Text style={styles.drawerInnerContent}>Industry, Enterprises and Governments </Text>are set to adopt Web4 platforms.</Text>
                    </View>
                    </View>
                </ScrollView>
        </RBSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 50,
    },
    rawTransactionDrawer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
    drawerTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 18.75,

    },
    darwerContent: {
        fontSize: 15.5,
        fontWeight: '400',
        lineHeight: 21,
        marginTop:8
    },
    drawerInnerContent: {
        fontWeight:'700',
    },
});

export default LearnMoreAutonomous;
