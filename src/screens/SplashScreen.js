import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, Platform, View, StatusBar, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getFromAsyncStorage } from '../utils/keychainUtils';
import { EMP_DASHBOARD_SCREEN, LANGUAGECODE, ROLDID, SCREENNAME, USER_ID } from '../utils';
import { changeLanguage } from '../Localization/Localisation';

const SplashScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { companyLogo } = useSelector(state => state.companyStyles.companyStyles || {});

  // const handleInitialSetup = useCallback(async () => {
  //   try {
  //     const [languageCode, userId,roleId] = await Promise.all([
  //       getFromAsyncStorage(LANGUAGECODE),
  //       getFromAsyncStorage(USER_ID),
  //       getFromAsyncStorage(ROLDID),
  //     ]);
  //     changeLanguage(languageCode || 'en');
  //     setTimeout(() => {
  //       // navigation.replace(userId ? 'HomeScreenRn' : 'IntialLanguageScreenRn');
  //       navigation.replace(userId ? roleId!=2?"MainTabs":'BottomTabsNavigatorEmp' : 'IntialLanguageScreenRn');
  //     }, 2500);
  //   } catch (error) {
  //     console.error('Error during initial setup:', error);
  //     setTimeout(() => navigation.replace('IntialLanguageScreenRn'), 2500);
  //   }
  // }, [navigation]);
  const handleInitialSetup = useCallback(async () => {
    try {
      const [languageCode, userId, screenName] = await Promise.all([
        getFromAsyncStorage(LANGUAGECODE),
        getFromAsyncStorage(USER_ID),
        getFromAsyncStorage(SCREENNAME),
      ]);

      changeLanguage(languageCode || 'en');

      const isLoggedIn = !!userId;
      const isRoleTwo = (screenName == EMP_DASHBOARD_SCREEN);

      let routeName = 'IntialLanguageScreenRn';

      if (isLoggedIn) {
        routeName = isRoleTwo
          ? 'BottomTabsNavigatorEmp'
          : 'MainTabs';
      }

      setTimeout(() => {
        navigation.replace(routeName);
      }, 2500);

    } catch (error) {
      console.error('Error during initial setup:', error);

      setTimeout(() => {
        navigation.replace('IntialLanguageScreenRn');
      }, 2500);
    }
  }, [navigation, changeLanguage]);

  useEffect(() => {
    handleInitialSetup();
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        // friction: 5,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        // duration: 1500,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [handleInitialSetup, scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      )}
      <Image
        source={require('../../assets/Images/splashBg.png')}
        style={styles.backgroundImg}
      />
      <View style={styles.animatedContainer}>
        <Animated.View
          style={[
            styles.animatedSubContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Image
            source={companyLogo ? { uri: companyLogo } : require('../../assets/Images/SubeejLogo.png')}
            style={styles.logo}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImg: {
    height: '100%',
    width: '100%',
  },
  animatedContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  animatedSubContainer: {
    alignSelf: 'center',
    height: '60%',
    width: '50%',
  },
  logo: {
    height: '80%',
    width: '80%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 30,
  },
});