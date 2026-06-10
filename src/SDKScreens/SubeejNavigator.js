import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoaderScreen from '../SDKScreens/LoaderScreen';
import HomeScreenEmpSDK from '../SDKScreens/HomeScreenEmpSDK';
import Location from '../components/Location';
import WeatherScreen from '../screens/Weather/WeatherScreen';

const Stack = createNativeStackNavigator();

const SubeejNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen
                name="LoaderScreen"
                component={LoaderScreen}
            />

            <Stack.Screen
                name="HomeScreenEmpSDK"
                component={HomeScreenEmpSDK}
            />

            <Stack.Screen
                name="Location"
                component={Location}
            />

            <Stack.Screen
                name="WeatherScreen"
                component={WeatherScreen}
            />

        </Stack.Navigator>
    );
};

export default SubeejNavigator;