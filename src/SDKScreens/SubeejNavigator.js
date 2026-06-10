import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  LoaderScreen,
  HomeScreenEmpSDK,
  BottomTabsNavigatorEmp,
  FertilizerSeeds,
  YieldCalculator,
  SeedsCalculator,
  SamadhanScreen,
  RaiseComplaintScreen,
  MoreScreenRn,
  QRScannerRn,
  NearByScreen,
  KnowledgeCenterRn,
  CropDesiesDetection,
  CropDiagonstic,
  LanguageScreenRn,
  Agronomy,
  WeatherScreen,
  Remedyrecommendation,
  NearByRetailersScreen,
  AdvancedKnowledgeCenter,
  KnowledgeCenterDocsList,
  KnowledgeCenterPDFView,
  Location,
} from '../index'; // adjust path if needed

const Stack = createNativeStackNavigator();

const SubeejNavigator = ({ route }) => {
  const sdkConfig = route?.params?.navigateItem;

  const screens = {
    HomeScreenEmpSDK,
    BottomTabsNavigatorEmp,
    FertilizerSeeds,
    YieldCalculator,
    SeedsCalculator,
    SamadhanScreen,
    RaiseComplaintScreen,
    MoreScreenRn,
    QRScannerRn,
    NearByScreen,
    KnowledgeCenterRn,
    CropDesiesDetection,
    CropDiagonstic,
    LanguageScreenRn,
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