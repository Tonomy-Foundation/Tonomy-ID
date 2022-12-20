import React from 'react';
import { TButtonContained } from '../components/atoms/Tbutton';
import { Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import LayoutComponent from '../components/layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Test'>;
export default function HomeScreen({ navigation }: Props) {
    return (
        <LayoutComponent
            body={
                <View>
                    <Text>Header</Text>
                    <Text>Body</Text>
                    <Text>Footer</Text>
                    <Text>Header</Text>
                    <Text>Body</Text>
                    <Text>Footer</Text>
                    <Text>Header</Text>
                    <Text>Body</Text>
                    <Text>Footer</Text>
                    <Text>Header</Text>
                    <Text>Body</Text>
                    <Text>Footer</Text>
                </View>
            }
            footerHint={<Text>Header</Text>}
            footer={
                <View>
                    <TButtonContained>test</TButtonContained>
                    <Text></Text>
                </View>
            }
        ></LayoutComponent>
    );
}
