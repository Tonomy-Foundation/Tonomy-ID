import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { TH1, TP } from '../components/THeadings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';

type SplashScreenContainerProps = {
    navigation: NavigationProp<any>;
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    icon: string;
    description: string;
    linkUrl: string;
    linkUrlText: string;
    buttonText: string;
    buttonOnPress: () => void;
};

export default function SplashScreenContainer(props: SplashScreenContainerProps) {
    return (
        <LayoutComponent
            body={
                <View style={commonStyles.alignItemsCenter}>
                    <TH1 style={commonStyles.marginBottom}>{props.title}</TH1>
                    <TP size={2} style={commonStyles.textAlignCenter}>
                        {props.subtitle}
                    </TP>
                    <Image style={styles.image} source={props.imageSource}></Image>
                    <TInfoBox
                        align="center"
                        description={props.description}
                        icon={props.icon}
                        linkUrl={props.linkUrl}
                        linkUrlText={props.linkUrlText}
                    ></TInfoBox>
                </View>
            }
            footer={<TButtonContained onPress={props.buttonOnPress}>{props.buttonText}</TButtonContained>}
        />
    );
}

const styles = StyleSheet.create({
    image: {
        marginTop: 50,
        alignSelf: 'center',
        height: 220,
    },
});
