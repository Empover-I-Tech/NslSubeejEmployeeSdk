import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { store, persistor } from '../state/store';
import SubeejNavigator from './SubeejNavigator';

const SubeejRoot = (props) => {
    return (
        <Provider store={store}>
            <NavigationContainer independent={true}>
                <SubeejNavigator {...props} />
            </NavigationContainer>
        </Provider>
    );
};

export default SubeejRoot;