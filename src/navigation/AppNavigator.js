import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';
import { Platform, StatusBar } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useSelector } from 'react-redux';

const AppNavigator = () => {
    
  const currentTheme = useSelector(state => state.theme.theme);
    return (
        <NavigationContainer>
          <ScreenWrapper barStyle="dark-content" barColor={currentTheme.statusBar}>
            <StackNavigator />
          </ScreenWrapper>
        </NavigationContainer>
    );
};
export default AppNavigator;
