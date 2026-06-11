import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoaderScreen from './LoaderScreen';
import HomeScreenEmpSDK from './HomeScreenEmpSDK';
import BottomTabsNavigatorEmp from '../navigation/BottomTabsEmp';

import FertilizerSeeds from '../screens/FertilizerSeeds';
import YieldCalculator from '../screens/YieldCalculator';
import SeedsCalculator from '../screens/SeedsCalculator';

import SamadhanScreen from '../screens/SamadhanScreen';
import RaiseComplaintScreen from '../screens/RaiseComplaintScreen';

import QRScannerRn from '../screens/QRScannerRn';

import WeatherScreen from '../screens/Weather/WeatherScreen';
import Location from '../components/Location';
import Agronomy from '../screens/Agronomy';
import KnowledgeCenterRn from '../screens/KnowledgeCenterRn';

import CropDesiesDetection from '../screens/CropDiagnostics/CropDesiesDetection';
import CropDiagonstic from '../screens/CropDiagnostics/CropDiagonstic';
import Remedyrecommendation from '../screens/Remedyrecommendation';
import NearByScreen from '../screens/NearByScreen';
import NearByRetailersScreen from '../screens/NearByRetailersScreen';

import AdvancedKnowledgeCenter from '../screens/AdvancedKnowledgeCenter';
import KnowledgeCenterPDFView from '../screens/KnowledgeCenterPDFView';
import KnowledgeCenterDocsList from '../screens/KnowledgeCenterDocsList';
import CashBackScan from '../screens/CashbackProgram/CashbackScan';


const Stack = createNativeStackNavigator();

const SubeejNavigator = ({ onSDKClose, route }) => {
  const sdkConfig = route?.params?.navigateItem;

  const screens = {
    HomeScreenEmpSDK,
    BottomTabsNavigatorEmp,
    CashBackScan,
    FertilizerSeeds,
    YieldCalculator,
    SeedsCalculator,
    SamadhanScreen,
    RaiseComplaintScreen,
    QRScannerRn,
    NearByScreen,
    KnowledgeCenterRn,
    CropDesiesDetection,
    CropDiagonstic,
    Agronomy,
    WeatherScreen,
    Remedyrecommendation,
    NearByRetailersScreen,
    AdvancedKnowledgeCenter,
    KnowledgeCenterDocsList,
    KnowledgeCenterPDFView,
    Location,
  };

  return (
    <Stack.Navigator
      initialRouteName="LoaderScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="LoaderScreen"
        component={LoaderScreen}
        initialParams={{
          navigateItem: sdkConfig,
          onSDKClose: onSDKClose
        }}
      />

      {Object.entries(screens).map(([name, component]) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
        />
      ))}
    </Stack.Navigator>
  );
};

export default SubeejNavigator;