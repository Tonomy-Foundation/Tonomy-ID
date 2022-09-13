import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/homeScreen';
import TestScreen from '../screens/testScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import useUserStore from '../store/userStore';



const Stack = createNativeStackNavigator();

export default function MainNavigation() {
  const user = useUserStore()
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="home">
      {user.isLoggedIn() ?(
        <>
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Screen name="test" component={TestScreen} />
        </>
      ) : (
        <>
        <Stack.Screen name="Create Account" component={CreateAccountScreen} />
        </>
      )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

