// src/navigation/BottomTabsNavigator.js
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';

// Import your screen components
import HomeScreenRn from '../screens/HomeScreenRn';
import MandiPricesScreen from '../screens/MandiPrices/MandiPricesScreen';
import RewardsScreen from '../screens/RewardsScreen';
import FaqsScreen from '../screens/FaqsScreen';
import SamadhanScreen from '../screens/SamadhanScreen';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFontStyles } from '../hooks/useFontStyles';
import { setCashBackModal } from '../state/actions/cashBackModal';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

const BottomTabsNavigator = () => {
  const [helpDeskVisible, setHelpDeskVisible] = useState(true)
  const [rewardsVisible, setRewardsVisible] = useState(true)
  const [faqVisible, setFaqVisible] = useState(true)
  const [mandiprivisible, setMandipriceVisible] = useState(false)
  const currentTheme = useSelector(state => state.theme.theme);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const menuControler = useSelector(state => state.marketpriceData.marketpriceData);
  const isConnected = useSelector(state => state.network.isConnected);
  const tabMenu = useSelector(state => state.tabmenuControl.tabmenuControl);
  const dispatch = useDispatch();
  const fonts = useFontStyles()
  useEffect(() => {
    if (tabMenu && tabMenu.length > 0) {
      setFaqVisible(tabMenu[3]?.visible);
      setHelpDeskVisible(tabMenu[4]?.visible);
      setRewardsVisible(tabMenu[2]?.visible);
      setMandipriceVisible(tabMenu[1]?.visible);
    }
  }, [tabMenu]);


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
      <Tab.Screen
        name="HomeScreenRn"
        component={HomeScreenRn}
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


      {mandiprivisible && (
        <Tab.Screen
          name="MandiPricesScreen"
          component={MandiPricesScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    color: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor,
                    fontFamily: fonts.Regular,
                    fontSize: RFValue(11, height),
                  }}
                >
                  {translate('Mandi_Prices')}
                </Text>
                {focused && <View style={[{ backgroundColor: dynamicStyles.primaryColor }]} />}
              </View>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/Images/MandiPricesIcon.png')}
                style={[styles.bottomNavigationIcons, { tintColor: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor }]}
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault(); // stop the default tab navigation
              if (isConnected) {
                const marketPriceItem =
                  Array.isArray(menuControler) && menuControler.length > 0
                    ? menuControler.find(item => item?.layout === 'Market Prices')
                    : null;

                const productList = marketPriceItem?.marketPricesList || [];

                if (productList.length == 0) {
                  SimpleToast.show(translate('no_data_available'));
                  return;
                }

                navigation.navigate('MandiPricesScreen', { productList: productList });
              } else {
                SimpleToast.show(translate('no_internet_conneccted'));
              }
            },
          })}
        />
      )}

      {rewardsVisible && (
        <Tab.Screen
          name="RewardsScreen"
          component={RewardsScreen} // dummy component
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();

              // open modal
              dispatch(setCashBackModal(true));

              // keep focus on Home tab
              navigation.navigate('HomeScreenRn');
            },
          })}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor, fontFamily: fonts.Regular, fontSize: RFValue(11, height) }}> {translate('Rewards')}</Text>
                {focused && <View style={[{ backgroundColor: dynamicStyles.primaryColor }]} />}
              </View>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/Images/RewardsIcon.png')}
                style={[styles.bottomNavigationIcons, { tintColor: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor }]}
              />
            ),
          }}
        />
      )}

      {faqVisible && (
        <Tab.Screen
          name="FaqsScreen"
          component={FaqsScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor, fontFamily: fonts.Regular, fontSize: RFValue(11, height) }}> {translate('faq')}</Text>
                {focused && <View style={[{ backgroundColor: dynamicStyles.primaryColor }]} />}
              </View>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/Images/faqicon.png')}
                style={[styles.bottomNavigationIcons, { tintColor: focused ? dynamicStyles.primaryColor : dynamicStyles.textColor }]}
              />
            ),
          }}
        />
      )}

      {helpDeskVisible && (
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
  bottomIconLabels: {
    fontSize: RFValue(11, height),
    lineHeight: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    // backgroundColor: dynamicStyles.primaryColor,
    marginTop: 2,
  },
})

export default BottomTabsNavigator;
