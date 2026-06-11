import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Dimensions,
  Pressable,
  View,
  FlatList,
  Text,
  StyleSheet,
  Platform,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { getFromAsyncStorage, storeInAsyncStorage } from '../utils/keychainUtils';
import { APPLICATION_NAME, LANGUAGECODE, LANGUAGEID, LANGUAGENAME, SHOWONBOARDSCREENS } from '../utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { changeLanguage } from '../Localization/Localisation';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import { stringToBoolean } from '../utils/helpers';
import { setSelectedCompanyAct } from '../state/actions/selectedCompanyActions';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from '../hooks/useFontStyles';

const { height } = Dimensions.get('window');

const IntialLanguageScreenRn = ({ route }) => {
  const fonts = useFontStyles()
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isConnected = useSelector(state => state.network.isConnected);
  const currentTheme = useSelector(state => state.theme.theme);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [languageIndex, setLanguageIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const selectedCompany = route?.params?.selectedCompany || {};
  const url = `${APIConfig.BASE_URL}${APIConfig.masters_getAllLanguagesForMobile_V1}`;

  const getAllLanguages = useCallback(async () => {
    if (!isConnected) {
      SimpleToast.show(translate('no_internet_conneccted'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json', applicationName: APPLICATION_NAME, },
      });
      if (response.data.statusCode === HTTP_OK) {
        chooseLanguageHandle(response.data.response);
      } else {
        SimpleToast.show(response?.data?.message || translate('Something_went_wrong'));
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching languages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, url]);

  const chooseLanguageHandle = useCallback(
    async response => {
      const checkingLang = await getFromAsyncStorage(LANGUAGECODE);
      const languageCode = checkingLang || 'en';

      if (response?.languageList) {
        const sortedList = [...response.languageList].sort((a, b) => a.displayOrder - b.displayOrder);
        setLanguages(sortedList);
        const defaultLanguage = sortedList.find(lang => lang.languageCode === languageCode);
        if (defaultLanguage) {
          setSelectedLanguage(defaultLanguage);
          setLanguageIndex(sortedList.findIndex(lang => lang.languageCode === languageCode));
        }
        changeLanguage(languageCode);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const [langCode, langId, langName] = await Promise.all([
            getFromAsyncStorage(LANGUAGECODE),
            getFromAsyncStorage(LANGUAGEID),
            getFromAsyncStorage(LANGUAGENAME),
          ]);

          const defaultLang = {
            languageCode: langCode || 'en',
            id: langId || '1',
            languageName: langName || 'English',
          };
          setSelectedLanguage(defaultLang);
          changeLanguage(defaultLang.languageCode);
          await getAllLanguages();
        } catch (error) {
          console.error('Error fetching initial data:', error);
          setIsLoading(false);
        }
      };

      fetchInitialData();
    }, [getAllLanguages])
  );

  const handleContinue = useCallback(async () => {
    if (!selectedLanguage) return;
    setIsLoading(true);
    try {
      await Promise.all([
        storeInAsyncStorage(LANGUAGECODE, selectedLanguage.languageCode),
        storeInAsyncStorage(LANGUAGENAME, selectedLanguage.languageName),
        storeInAsyncStorage(LANGUAGEID, `${selectedLanguage.id}`),
      ]);
      changeLanguage(selectedLanguage.languageCode);
      global.selectedLanguageCode = selectedLanguage.languageCode || 'en';

      const onboard = await getFromAsyncStorage(SHOWONBOARDSCREENS);
      dispatch(
        setSelectedCompanyAct({
          languageId: selectedLanguage.id,
          selectedCompanyDet: selectedCompany,
        })
      );
      navigation.replace(stringToBoolean(onboard) || onboard == null ? 'OnBoard' : 'LoginScreenRn');
    } catch (error) {
      console.error('Error saving language:', error);
      SimpleToast.show(translate('error_saving_language'));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigation, selectedLanguage, selectedCompany]);

  const handleLanguageSelection = useCallback(item => {
    setSelectedLanguage(item);
    setLanguageIndex(languages.findIndex(lang => lang.id === item.id));
    changeLanguage(item.languageCode);
  }, [languages]);

  const renderLanguageItem = useCallback(
    ({ item, index }) => {
      const isSelected = index === languageIndex;
      return (
        <Pressable
          onPress={() => handleLanguageSelection(item)}
          style={[styles.flatListItem, {
            backgroundColor: isSelected ? 'transparent' : 'transparent',
            borderColor: isSelected ? '#845EF1' : currentTheme.lightGrey,
          }]}
        >
          {isSelected && (
            <View style={styles.tickContainer}>
              <Image
                source={require('../../assets/Images/correctTickIcon.png')}
                style={[styles.tickIcon, { tintColor: selectedCompany.primaryColor }]}
              />
            </View>
          )}
          <View>
            <Text style={[styles.localLanguageNameText, { color: '#000', fontFamily: fonts.SemiBold }]}>
              {item.localLanguageName}
            </Text>
            <Text style={[styles.languageNameText, { color: '#000', fontFamily: fonts.Regular }]}>
              {item.languageName}
            </Text>
          </View>
        </Pressable>
      );
    },
    [languageIndex, currentTheme.lightGrey, selectedCompany.primaryColor, handleLanguageSelection]
  );

  return (
    <View style={styles.mainContainer}>
      {Platform.OS === 'android' && (
        <StatusBar
          translucent
          backgroundColor="#fff"
          barStyle={currentTheme.statusBar}
        />
      )}
      <View style={styles.chooseLanguageTextContainer}>
        <Text style={[styles.chooseLanguageText, { fontFamily: fonts.Bold }]}>{translate('choose_lag')}</Text>
        <Text style={[styles.chooseLanguageSubText, { fontFamily: fonts.Regular }]}>{translate('preferred_lang')}</Text>
      </View>
      <View style={styles.flatListMainContainer}>
        <FlatList
          style={styles.flatListContainer}
          data={languages}
          numColumns={2}
          renderItem={renderLanguageItem}
          keyExtractor={item => item.id.toString()}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: height * 0.15,
            offset: (height * 0.15 + 10) * index,
            index,
          })}
        />
        <TouchableOpacity style={styles.getStartBtn} onPress={handleContinue} disabled={isLoading}>
          <Text style={[styles.getStartedText, { fontFamily: fonts.Bold }]}>{translate('get_started')}</Text>
        </TouchableOpacity>
      </View>
      {isLoading && (
        <View style={styles.loaderAnimated}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

export default IntialLanguageScreenRn;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  chooseLanguageTextContainer: {
    alignItems: 'center',
    paddingTop: height * 0.05,
  },
  chooseLanguageText: {
    fontSize: RFValue(30, height),
    color: '#5D5D5D',
    lineHeight: 50,
  },
  chooseLanguageSubText: {
    fontSize: RFValue(12, height),
    color: '#5D5D5D',
    lineHeight: 25,
  },
  flatListMainContainer: {
    flex: 1,
    alignSelf: 'center',
    paddingLeft: 15,
    paddingTop: 20,
    width: '90%',
  },
  flatListContainer: {
    alignSelf: 'center',
  },
  flatListItem: {
    width: '45%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    height: height * 0.15,
    marginBottom: 10,
    marginRight: 10,
  },
  tickContainer: {
    padding: 3,
    borderRadius: 100,
    position: 'absolute',
    top: 5,
    right: 10,
    width: 15,
    height: 15,
    backgroundColor: '#845EF1',
  },
  tickIcon: {
    resizeMode: 'contain',
    height: 10,
    width: 10,
  },
  localLanguageNameText: {
    textAlign: 'center',
    fontSize: RFValue(14, height),
    marginTop: 15,
    lineHeight: 25,
  },
  languageNameText: {
    textAlign: 'center',
    fontSize: RFValue(12, height),
    marginTop: 5,
    marginBottom: 10,
    lineHeight: 20,
  },
  getStartBtn: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.06,
    width: '95%',
    marginVertical: height * 0.008,
    alignSelf: 'center',
    backgroundColor: '#845EF1',
    bottom: 20
  },
  getStartedText: {
    color: '#fff',
    fontSize: RFValue(16, height),
  },
  loaderAnimated: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    top: height * 0.5,
  },
});