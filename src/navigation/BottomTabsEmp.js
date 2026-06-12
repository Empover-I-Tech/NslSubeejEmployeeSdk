// src/navigation/BottomTabsNavigator.js
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';

// Import your screen components
import MandiPricesScreen from '../screens/MandiPrices/MandiPricesScreen';
import SamadhanScreen from '../screens/SamadhanScreen';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFontStyles } from '../hooks/useFontStyles';
import HomeScreenEmpSDK from '../SDKScreens/HomeScreenEmpSDK';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

const BottomTabsNavigatorEmp = () => {
  const [homeVisible, setHomeVisible] = useState(true)
  const [scanVisible, setScanVisible] = useState(true)
  const [help, setHelp] = useState(true)
  const currentTheme = useSelector(state => state.theme.theme);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const menuControler = useSelector(state => state.marketpriceData.marketpriceData);
  const isConnected = useSelector(state => state.network.isConnected);
  const tabMenuEmp = useSelector(state => state.tabEmpMenuControl.tabempmenuControl);
  console.log("tabempMenu=-=-=->", JSON.stringify(tabMenuEmp))
  const dispatch = useDispatch();
  const fonts = useFontStyles()
  useEffect(() => {
    if (tabMenuEmp) {
      setHomeVisible(tabMenuEmp?.homeVisible)
      setScanVisible(tabMenuEmp?.scanVisible)
      setHelp(tabMenuEmp?.helpDeskVisible)
    }
  }, [tabMenuEmp]);



  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 65,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          elevation: 8,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins-Regular',
        },
      }}
    >
      {true && (
        <Tab.Screen
          name="HomeScreenEmpSDK"
          component={HomeScreenEmpSDK}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor, fontFamily: fonts.Regular, fontSize: RFValue(11, height) }}> {translate('Home')}</Text>
                {focused && <View style={[{ backgroundColor: dynamicStyles.primaryColor }]} />}
              </View>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/Images/HomeIcon.png')}
                style={[styles.bottomNavigationIcons, { tintColor: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor }]}
              />
            ),
          }}
        />
      )}


      {scanVisible && (
        <Tab.Screen
          name="MandiPricesScreen"
          component={MandiPricesScreen}
          options={{
            tabBarLabel: () => null,
            tabBarItemStyle: { marginTop: -15 },
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: dynamicStyles.primaryColor, borderRadius: 40, height: 70, justifyContent: "center", alignItems: "center",
                width: 70,
              }}>
                <Image
                  source={require('../../assets/Images/ScanIcon.png')}
                  style={[styles.bottomNavigationIcons2, { tintColor: dynamicStyles.secondaryColor }]}
                />
              </View>
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate('HomeScreenEmpSDK', { openFarmerServices: true });
            },
          })}
        />
      )}

      {help && (
        <Tab.Screen
          name="SamadhanScreen"
          component={SamadhanScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor, fontFamily: fonts.Regular, fontSize: RFValue(11, height) }}> {translate('Help_Desk')}</Text>
                {focused && <View style={[{ backgroundColor: dynamicStyles.primaryColor }]} />}
              </View>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/Images/samadhanIconImg.png')}
                style={[styles.bottomNavigationIcons,]}
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomNavigationIcons: {
    height: 22,
    width: 68,
    resizeMode: 'contain',
  },
  bottomNavigationIcons2: {
    height: 22,
    width: 68,
    resizeMode: 'contain',
  },
  bottomIconLabels: {
    fontSize: RFValue(11, height),
    lineHeight: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
})

export default BottomTabsNavigatorEmp;
