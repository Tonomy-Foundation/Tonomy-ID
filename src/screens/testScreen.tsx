import React from 'react';
import TButton from '../components/atoms/Tbutton';
import { Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import LayoutComponent from '../components/layout';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
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
                    <TButton mode="contained">test</TButton>
                    <Text></Text>
                </View>
            }
        ></LayoutComponent>
    );
}
