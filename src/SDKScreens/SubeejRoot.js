import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { store, persistor } from '../state/store';
import SubeejNavigator from './SubeejNavigator';
import { initLocalisation } from '../Localization/Localisation';
import {
    SafeAreaProvider,
    SafeAreaView,
} from 'react-native-safe-area-context';
import SDKNetworkHandler from './SDKNetworkHandler';

const RootContent = (props) => {
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);

    return (
        <SafeAreaView
            edges={['top']}
            style={{
                flex: 1,
                backgroundColor: dynamicStyles?.primaryColor || '#ffffff',
            }}
        >
            <NavigationIndependentTree>
                <NavigationContainer>
                    <SDKNetworkHandler />
                    <SubeejNavigator {...props} />
                </NavigationContainer>
            </NavigationIndependentTree>
        </SafeAreaView>
    );
};

const SubeejRoot = (props) => {

    useEffect(() => {
        initLocalisation();
    }, []);
    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <RootContent {...props} />
            </SafeAreaProvider>
        </Provider>

    );
};

export default SubeejRoot;