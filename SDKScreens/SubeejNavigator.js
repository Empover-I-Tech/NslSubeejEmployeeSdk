import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoaderScreen from './LoaderScreen';
import HomeScreenEmpSDK from './HomeScreenEmpSDK';
import BottomTabsNavigatorEmp from '../src/navigation/BottomTabsEmp';

import FertilizerSeeds from '../src/screens/FertilizerSeeds';
import YieldCalculator from '../src/screens/YieldCalculator';
import SeedsCalculator from '../src/screens/SeedsCalculator';

import SamadhanScreen from '../src/screens/SamadhanScreen';
import RaiseComplaintScreen from '../src/screens/RaiseComplaintScreen';

import QRScannerRn from '../src/screens/QRScannerRn';

import WeatherScreen from '../src/screens/Weather/WeatherScreen';
import Location from '../src/components/Location';
import Agronomy from '../src/screens/Agronomy';
import KnowledgeCenterRn from '../src/screens/KnowledgeCenterRn';

import CropDesiesDetection from '../src/screens/CropDiagnostics/CropDesiesDetection';
import CropDiagonstic from '../src/screens/CropDiagnostics/CropDiagonstic';
import Remedyrecommendation from '../src/screens/Remedyrecommendation';
import NearByScreen from '../src/screens/NearByScreen';
import NearByRetailersScreen from '../src/screens/NearByRetailersScreen';

import AdvancedKnowledgeCenter from '../src/screens/AdvancedKnowledgeCenter';
import KnowledgeCenterPDFView from '../src/screens/KnowledgeCenterPDFView';
import KnowledgeCenterDocsList from '../src/screens/KnowledgeCenterDocsList';
import CashBackScan from '../src/screens/CashbackProgram/CashbackScan';


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