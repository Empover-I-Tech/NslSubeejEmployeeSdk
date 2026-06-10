import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { store, persistor } from './redux/store/store';
import SubeejNavigator from './SubeejNavigator';
import { initLocalisation } from '../Localization/Localisation';

const SubeejRoot = (props) => {

    useEffect(() => {
        initLocalisation();
    }, []);
    return (
        <Provider store={store}>
            <NavigationIndependentTree>
                <NavigationContainer>
                    <SubeejNavigator {...props} />
                </NavigationContainer>
            </NavigationIndependentTree>
        </Provider>
    );
};

export default SubeejRoot;