import React from 'react';

import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerContentComponentProps,
    DrawerItem,
} from '@react-navigation/drawer';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function CustomDrawer(props: DrawerContentComponentProps) {
    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: 'white' }}>
            {Object.entries(props.descriptors).map(([key, value]) => {
                return (
                    <DrawerItem
                        key={key}
                        label={value.options.title || value.route.name}
                        onPress={() => props.navigation.getParent()?.navigate(value.route.name)}
                    ></DrawerItem>
                );
            })}
        </DrawerContentScrollView>
    );
}
