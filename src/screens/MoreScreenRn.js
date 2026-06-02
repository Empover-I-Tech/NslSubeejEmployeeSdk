import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Linking, Image, ToastAndroid, StatusBar, SafeAreaView, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Styles } from '../styles/Styles';
import { useDispatch, useSelector } from 'react-redux';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { downloadFileToLocal, GetApiHeaders, getAppVersion } from "../utils/helpers";
import useGetRequestWithJwt from "../api/useGetRequestWithJwt";
import { deleteFromAsyncStorage, getFromAsyncStorage } from '../utils/keychainUtils';
import { MOBILENUMBER, REFERRALCODE, USER_ID, USERNAME, USER_IMG, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, LANGUAGEID, FIRSTNAME, LASTNAME, OFFLINETOTALCOUNT, COMPANYCODE } from '../utils';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import { setCompanyStyle } from '../state/actions/companyStyles';
import { RFValue } from "react-native-responsive-fontsize";
import { CustomCommonModalTwo } from '../components/CustomCommonModal';
import realm from './realmOffline/realmConfig';
import LogoutModal from '../components/LogoutModal';
import SimpleToast from 'react-native-simple-toast';
import { useOfflineSync } from '../utils/syncUtils';
import { useGeoTaggingCRUD } from './realmOffline/useGeoTaggingCRUD';
import { helpDeskRaiseCRUD } from './realmOffline/helpDeskRaiseCRUD';
import { useOfflineCalculatorsCRUD } from './realmOffline/useOfflineCalculatorsCRUD';
import CustomLoader from '../components/CustomLoader';
import { DOWNLOAD_FOLDER_PATH } from '../assets/Utils/Utils';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { useFontStyles } from '../hooks/useFontStyles';
import CustomAlert from '../components/CustomAlert';
const { width, height } = Dimensions.get('window');



const MoreScreenRn = ({ navigation, route }) => {
  const fonts = useFontStyles()

  const {
    getOfflineGeoTagCount
  } = useGeoTaggingCRUD();

  const {
    getOfflineHelpDeskCount,
  } = helpDeskRaiseCRUD();

  const {
    hasSeedCalc,
    hasYieldCalc
  } = useOfflineCalculatorsCRUD();
  const offlineCountFromRedux = useSelector((state) => state.offlineCountReducer.offlineCount);
  console.log("offlineCountFromRedux", offlineCountFromRedux)
  const [startWatching, setStartWatching] = useState(false);
  const [localOfflineCount, setLocalOfflineCount] = useState(offlineCountFromRedux);
  const [loader, setLoader] = useState(false)
  const [loaderImage, setLoaderImage] = useState(require('../../assets/Images/SubeejLoader.gif'))
  const [loadingMessage, setLoadingMessage] = useState('')
  const [progress, setProgress] = useState(10)
  const [userData, setUserData] = useState({})
  const [logoutData, setLogoutData] = useState(null);
  const currentTheme = useSelector(state => state.theme.theme);
  const isConnected = useSelector(state => state.network.isConnected);
  const [alertModal, setAlertModal] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const styles = Styles(currentTheme);
  const { width, height } = Dimensions.get('window');
  const { getData, getLoading, error, statusCode, fetchData } = useGetRequestWithJwt();
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const existingDynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const dispatch = useDispatch();
  const companyCode = encodeURIComponent(dynamicStyles.companyCode);
  const programName = encodeURIComponent(dynamicStyles.programName);
  const [versionApp, setVersionApp] = useState("")

  const cachedImages = realm.objects('Image');
  const Meeting = realm.objects('Meeting');
  const GeoTaggingView = realm.objects('GeoTaggingView');
  const cachedKnowledgeCenter = realm.objects('KnowledgeCenter');
  const cachedHybridList = realm.objects('hybridMaster');
  const FABDetails = realm.objects('FABDetails')
  const cachedGeoTaggingHistory = realm.objects('GEOTAGGINGHISTORY');
  const helpDeskRaise = realm.objects('helpDeskRaise')
  const cachedSamadhanHistory = realm.objects('SAMADHANHISTORY');
  const YieldMaster = realm.objects('YieldMaster');
  const SeedMaster = realm.objects('SeedMaster');
  const FertilizerMaster = realm.objects('FertilizerMaster');
  const FertilizerMaster2 = realm.objects('FertilizerMaster2')
  const SeedCalSubmit = realm.objects('SeedCalSubmit')
  const YieldCalSubmit = realm.objects('YieldCalSubmit')
  const goldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')

  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [showAlertHeader, setShowAlertHeader] = useState(false);
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlertYesButton, setShowAlertYesButton] = useState(false);
  const [showAlertNoButton, setShowAlertNoButton] = useState(false);
  const [showAlertYesButtonText, setShowAlertYesButtonText] = useState('');
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState('');
  const defaultImage = require('../../assets/Images/farmerIconImg.png');

  const [profileImage, setProfileImage] = useState(dynamicStyles?.profilePic || "")
  const { uploadOfflineGeoTagDataToServer, uploadOfflineSeedCalc, uploadOfflineYieldCalc, uploadOfflineHelpDesk,
    updateOfflineCount } = useOfflineSync();

  const clearDownloadedImages = async () => {
    try {
      const exists = await RNFS.exists(DOWNLOAD_FOLDER_PATH);
      if (exists) {
        await RNFS.unlink(DOWNLOAD_FOLDER_PATH);
        console.log('Download folder deleted');
      }
    } catch (error) {
      console.error('Error deleting download folder:', error);
    }
  };

  const showAlertWithMessage = useCallback((title, header, headerText, message, yesBtn, noBtn, yesText, noText) => {
    setAlertTitle(title);
    setShowAlertHeader(header);
    setShowAlertHeaderText(headerText);
    setAlertMessage(message);
    setShowAlertYesButton(yesBtn);
    setShowAlertNoButton(noBtn);
    setShowAlertYesButtonText(yesText);
    setShowAlertNoButtonText(noText);
    setAlertVisible(true);
  }, []);

  const handleOkPress = useCallback(async () => {
    if (alertMessage == translate("accountDeleteWarning_wtihoutData")) {
      const langId = await getFromAsyncStorage(LANGUAGEID)
      const accountCloserLinkUrl = APIConfig.ACCOUNT_CLOSE_URL({
        mobileNumber: userData?.mobileNumber,
        languageId: langId,
        buttonColor: dynamicStyles.primaryColor
      });
      console.log("fetched account closer", accountCloserLinkUrl);
      setAlertVisible(false)
      navigation.navigate('AccountCloser', { onClose: () => { claringUserDataToLogin() }, from: 'MoreScreenRn', dynamicStyles: dynamicStyles, mobileNumber: userData?.mobileNumber, accountCloseLink: accountCloserLinkUrl, title: translate('accountCloser') })

    }

    if (alertMessage == translate("accountDeleteWarning")) {
      // setAlertVisible(false)
      handleSyncAndCloseAccount()
      // handleSyncDeleteLogout()
    }


  }, [alertMessage]);

  const claringUserDataToLogin = async () => {
    // const navigation = useNavigation();

    try {
      // Clear all sensitive data
      await dispatch(setCompanyStyle({}));
      await deleteFromAsyncStorage(USER_ID);
      await deleteFromAsyncStorage(MOBILENUMBER);
      await deleteFromAsyncStorage(USERNAME);
      await deleteFromAsyncStorage(REFERRALCODE);
      await deleteFromAsyncStorage(USER_IMG);
      await deleteFromAsyncStorage(STATE_ID)
      await deleteFromAsyncStorage(STATE_NAME)
      await deleteFromAsyncStorage(DISTRICT_ID)
      await deleteFromAsyncStorage(DISTRICT_NAME)
      await deleteFromAsyncStorage(FIRSTNAME)
      await deleteFromAsyncStorage(LASTNAME)
      await deleteFromAsyncStorage(COMPANYCODE)
      await deleteFromAsyncStorage(OFFLINETOTALCOUNT)

      await removeDatbaseData();
      await clearDownloadedImages()
      handleContinue()
      // Navigate to the login screen
      // navigation.replace('Login');

      console.log('Logged out successfully.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleNoPress = useCallback(() => {
    setAlertVisible(false);
  }, []);

  // Remove data from Realm
  const removeDatbaseData = async () => {
    try {
      if (realm && !realm.isClosed) {
        realm.write(() => {
          realm.delete(cachedImages);
          realm.delete(Meeting);
          realm.delete(FABDetails);
          realm.delete(helpDeskRaise);
          realm.delete(YieldMaster);
          realm.delete(SeedMaster);
          realm.delete(FertilizerMaster);
          realm.delete(FertilizerMaster2);
          realm.delete(SeedCalSubmit);
          realm.delete(YieldCalSubmit);
          realm.delete(cachedHybridList);
          realm.delete(cachedKnowledgeCenter);
          realm.delete(GeoTaggingView);
          realm.delete(cachedGeoTaggingHistory);
          realm.delete(cachedSamadhanHistory);
          realm.delete(goldClubKnowledgeCenter)
        });
        console.log("Successfully deleted all Realm data");
      }
    } catch (realmError) {
      console.error('Error deleting objects from Realm:', realmError);
    }
  };

  const triggerOfflineWatcher = () => {
    setStartWatching(true);
    setLoader(true);
  };

  useEffect(() => {
    if (!startWatching) return;

    if (offlineCountFromRedux === 0) {
      const doLogout = async () => {
        const logoutFlag = await logoutMethod();
        if (logoutFlag) {
          setAlertModal(false);
          setLogoutModal(false);
          logout();
          // await removeDatbaseData();
          // await clearDownloadedImages()
          handleContinue();
        } else {
          SimpleToast.show("Logout aborted.");
        }
        setLoader(false);
        setStartWatching(false);
      };

      doLogout();
    }
  }, [offlineCountFromRedux, startWatching]);


  useEffect(() => {
    if (startWatching) {
      setLocalOfflineCount(offlineCountFromRedux);
    }
  }, [offlineCountFromRedux, startWatching]);


  const data = [
    {
      id: '1',
      title: translate("WishList"),
      subtitle: translate("Saved_items_for_quicker_ordering"),
      image: require("../../assets/Images/wishlistImgIcon.png"),
    },
    {
      id: '2',
      title: translate("Offers"),
      subtitle: translate("All_about_offers_and_discounts"),
      image: require("../../assets/Images/offerImgIcon.png"),
    },
    {
      id: '3',
      title: translate("termsConditions"),
      subtitle: translate("All_about_company_conditions"),
      image: require("../../assets/Images/termsAndConditionsImgIcon.png"),
    },
    {
      id: '4',
      title: translate("App_Language"),
      subtitle: translate("Your_preferred_app_language"),
      image: require("../../assets/Images/appLanguageIconImg.png"),
    }

    // {
    //   id: '6',
    //   title: translate("accountCloser"),
    //   subtitle: translate("close_account_des"),
    //   image: require("../../assets/Images/deleAccount.png"),
    // },
    // {
    //   id: '5',
    //   title: translate("logout"),
    //   subtitle: translate("Sign_out_from_the_current_account"),
    //   image: require("../../assets/Images/logoutImgIcon.png"),
    // },

  ];

  //.............................................

  // const textContent = translate('morescreentext');
  // const wordCount = textContent.split(' ').length;

  const logout = async () => {
    // const navigation = useNavigation();

    try {
      // Clear all sensitive data
      await dispatch(setCompanyStyle({}));
      await deleteFromAsyncStorage(USER_ID);
      await deleteFromAsyncStorage(MOBILENUMBER);
      await deleteFromAsyncStorage(USERNAME);
      await deleteFromAsyncStorage(REFERRALCODE);
      await deleteFromAsyncStorage(USER_IMG);
      await deleteFromAsyncStorage(STATE_ID)
      await deleteFromAsyncStorage(STATE_NAME)
      await deleteFromAsyncStorage(DISTRICT_ID)
      await deleteFromAsyncStorage(DISTRICT_NAME)
      await deleteFromAsyncStorage(FIRSTNAME)
      await deleteFromAsyncStorage(LASTNAME)
      await deleteFromAsyncStorage(COMPANYCODE)
      await deleteFromAsyncStorage(OFFLINETOTALCOUNT)
      // dispatch(setCompanyStyle(dynamicStyles));

      await removeDatbaseData();
      await clearDownloadedImages()
      // Navigate to the login screen
      // navigation.replace('Login');

      console.log('Logged out successfully.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };



  useFocusEffect(
    useCallback(() => {
      getUserDetailsVersion11()

      const fetchUserData = async () => {
        const userName = await getFromAsyncStorage(USERNAME);
        const mobileNumber = await getFromAsyncStorage(MOBILENUMBER)
        const userPic = await getFromAsyncStorage(USER_IMG);
        const appversion = await getAppVersion();
        console.log("ueeeeeeeeeeee==", userPic)
        setUserData({
          userName,
          mobileNumber,
          userPic
        });
        setProfileImage(userPic)
        setVersionApp(appversion)
      };

      fetchUserData();
    }, [])
  )

  const getUserDetailsVersion11 = async () => {
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.companyCode = dynamicStyles.companyCode
        const response = await axios.post(
          `${APIConfig.BASE_URL}${APIConfig.dashboardDetails_v2}`,
          { languageId: headers.languageId },
          { headers: { ...headers, authType: 'JSONREQUEST' } }
        );
        if (response?.data?.statusCode === HTTP_OK) {
          const data = response?.data?.response;
          console.log("asaasas", JSON.stringify(data))
          const newDynamicStyles = existingDynamicStyles;
          console.log("datacheking=-=-=>", data)
          newDynamicStyles.languageId = (data?.languageId != undefined && data?.languageId != "" && data?.languageId != null) ? data?.languageId : "1";
          newDynamicStyles.companyName = (data?.companyName != undefined && data?.companyName != "" && data?.companyName != null) ? data?.companyName : "";
          newDynamicStyles.programName = (data?.programName != undefined && data?.programName != "" && data?.programName != null) ? data?.programName : "";
          newDynamicStyles.companyCode = (data?.companyCode != undefined && data?.companyCode != "" && data?.companyCode != null) ? data?.companyCode : "";
          newDynamicStyles.companyLogo = (data?.companyLogo != undefined && data?.companyLogo != "" && data?.companyLogo != null) ? data?.companyLogo : "";
          newDynamicStyles.primaryColor = (data?.primaryColor != undefined && data?.primaryColor != "" && data?.primaryColor != null) ? data?.primaryColor : "#ed3237";
          newDynamicStyles.secondaryColor = (data?.secondaryColor != undefined && data?.secondaryColor != "" && data?.secondaryColor != null) ? data?.secondaryColor : "#ffffff";
          newDynamicStyles.textColor = (data?.textColor != undefined && data?.textColor != "" && data?.textColor != null) ? data?.textColor : "#000000";
          newDynamicStyles.id = (data?.id != undefined && data?.id != "" && data?.id != null) ? data?.id : "0";
          if (data?.loaderLogo != undefined && data?.loaderLogo != "" && data?.loaderLogo != null) {
            const filePath = await downloadFileToLocal(false, data?.loaderLogo, data?.loaderLogo.split('/').pop())
            newDynamicStyles.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
            newDynamicStyles.programInfo = (data?.programInfo != undefined && data?.programInfo != "" && data?.programInfo != null) ? data?.programInfo : "";
            newDynamicStyles.companyInfo = (data?.companyInfo != undefined && data?.companyInfo != "" && data?.companyInfo != null) ? data?.companyInfo : "";
            newDynamicStyles.programLogo = (data?.programLogo != undefined && data?.programLogo != "" && data?.programLogo != null) ? data?.programLogo : "";
            newDynamicStyles.programLogoNew = (data?.programLogoNew != undefined && data?.programLogoNew != "" && data?.programLogoNew != null) ? data?.programLogoNew : "";
          } else {
            newDynamicStyles.loaderPath = "";
          }

          newDynamicStyles.firstName = (data?.firstName != undefined && data?.firstName != "" && data?.firstName != null) ? data?.firstName : "";
          newDynamicStyles.lastName = (data?.lastName != undefined && data?.lastName != "" && data?.lastName != null) ? data?.lastName : "";
          newDynamicStyles.pincode = (data?.pincode != undefined && data?.pincode != "" && data?.pincode != null) ? data?.pincode : "";
          newDynamicStyles.state = (data?.state != undefined && data?.state != "" && data?.state != null) ? data?.state : "";
          newDynamicStyles.district = (data?.district != undefined && data?.district != "" && data?.district != null) ? data?.district : "";
          newDynamicStyles.tahsil = (data?.tahsil != undefined && data?.tahsil != "" && data?.tahsil != null) ? data?.tahsil : "";
          newDynamicStyles.addressLine = (data?.addressLine != undefined && data?.addressLine != "" && data?.addressLine != null) ? data?.addressLine : "";
          newDynamicStyles.landMark = (data?.landMark != undefined && data?.landMark != "" && data?.landMark != null) ? data?.landMark : "";
          newDynamicStyles.villageLocation = (data?.villageLocation != undefined && data?.villageLocation != "" && data?.villageLocation != null) ? data?.villageLocation : "";
          newDynamicStyles.crop = (data?.crop != undefined && data?.crop != "" && data?.crop != null) ? data?.crop : "";
          newDynamicStyles.stateId = (data?.stateId != undefined && data?.stateId != "" && data?.stateId != null) ? data?.stateId : "";
          newDynamicStyles.districtId = (data?.districtId != undefined && data?.districtId != "" && data?.districtId != null) ? data?.districtId : "";
          newDynamicStyles.profilePic = (data?.profilePic != undefined && data?.profilePic != "" && data?.profilePic != null) ? data?.profilePic : "";
          dispatch(setCompanyStyle(newDynamicStyles));
        }

      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        // setLoaderApi(false);
      }

    } else {
      // SimpleToast.show(translate("no_internet_conneccted"))
    }
  }

  const handleContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        // routes: [{ name: 'Login' }],
        routes: [{ name: 'LoginScreenRn' }],

      })
    );
  }

  // const comingSoon = () => {
  //   ToastAndroid.show("Coming Soon", ToastAndroid.SHORT);
  // }

  const ForcedLougoutUrl = APIConfig.BASE_URL + APIConfig.AUTH.LOGOUT
  //   LOGOUT GET CALL...............
  const logoutMethod = async () => {
    setLoader(true)
    const headers = await GetApiHeaders();
    const response = await fetchData(ForcedLougoutUrl, headers);
    console.log("resssss===>", JSON.stringify(response))

    if (response != null && response?.data != null &&
      response?.data?.statusCode == HTTP_OK) {
      return true
    }
    else {
      return false
    }

  }

  useEffect(() => {
    const retrievedData = getData
    console.log("Logout successful", retrievedData);
    if (retrievedData?.statusCode === 200) {
      setLogoutData(retrievedData?.statusCode)
      // BackHandler.exitApp();
      // navigation.replace("Login");

    } else if (error) {
      console.error("Failed to Logout:", error);
    }

  }, [getData, error])

  useEffect(() => {
    if (logoutData) {
    }
  }, [logoutData]);

  const removeAccountClicked = async () => {
    //   const roleTypeDetails = await retrieveData(ROLENAME)
    //  if ((roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor')) {
    //     if (offlineCountFromRedux == 0) {
    //       showAlertWithMessage(translate('alert'), true, true, translate('accountDeleteWarning_wtihoutData'), true, true, translate('proceed'), translate('cancel'))
    //     }
    //     else {
    //       showAlertWithMessage(translate('alert'), true, true, translate('accountDeleteWarning'), true, true, translate('sync_and_proceed'), translate('cancel'))
    //     }

    //  }

    if (offlineCountFromRedux === 0) {
      showAlertWithMessage(translate('alert'), true, true, translate('accountDeleteWarning_wtihoutData'), true, true, translate('proceed'), translate('cancel'))
    } else {
      showAlertWithMessage(translate('alert'), true, true, translate('accountDeleteWarning'), true, true, translate('sync_and_proceed'), translate('cancel'))
    }
  }


  const handleItemClick = async (item) => {
    if (item.id === "5") {
      if (offlineCountFromRedux === 0) {
        setAlertModal(true)
        setLogoutModal(false)
      }
      else {
        setAlertModal(false)
        setLogoutModal(true)
      }

    } else if (item.id === "3") {
      console.log("Opening Terms & Conditions link");
      const langId = await getFromAsyncStorage(LANGUAGEID)
      const finalUrl = `https://subeejkisan.com/termsAndConditions?companyCode=${companyCode} &ProgramName=${programName}&languageId=${langId}`;

      Linking.openURL(finalUrl).catch((err) =>
        console.error("Failed to open URL", err)
      );
    } else if (item.id === "4") {
      // console.log("Navigating to Language Screen");
      if (isConnected) {
        navigation.navigate("LanguageScreenRn"); // Ensure this matches your screen name
      } else {
        SimpleToast.show(translate("no_internet_conneccted"))
      }
      // ToastAndroid.show(translate("Coming_Soon"), ToastAndroid.SHORT);
    } else if (item.id === "6") {
      removeAccountClicked()
    }
    else {
      // console.log(`${item.id} clicked`);
      if (Platform.OS == "ios") {
        SimpleToast.show(translate("Coming_Soon"))
      } else {
        ToastAndroid.show(translate("Coming_Soon"), ToastAndroid.SHORT);
      }
    }
  };



  const renderItem = ({ item }) => {
    console.log("lal=-=-=>", item.id !== "Terms & Conditions" || "Logout")
    return (

      <TouchableOpacity style={{ flexDirection: "row", marginBottom: 10 }} onPress={() => handleItemClick(item)}>
        <View style={{ height: width * 0.15, width: width * 0.15, backgroundColor: "#FEF3F3CC", borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
          {item.id !== "5" && item.id !== "3" && item.id !== "4" && item.id !== "6" &&
            <Image source={require("../../assets/Images/comingSoon.png")} style={{ height: 15, width: "80%", resizeMode: "contain" }} />
          }

          <Image source={item.image} style={{ height: width * 0.08, width: width * 0.08, resizeMode: "contain" }} />
        </View>
        <View style={{ marginLeft: 10, width : "100%" }}>
          <Text style={{
            color: dynamicStyles.textColor, fontSize: RFValue(16, height), fontFamily: fonts.SemiBold, width: "100%"
          }}>{item.title}</Text>
          <Text style={[{ color: dynamicStyles.textColor, fontSize: RFValue(14, height), fontFamily: fonts.Regular,  width: "90%", }]}>{item.subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const handleNoSyncLogout = async () => {
    if (isConnected) {
      setAlertModal(false);
      setLogoutModal(false);
      setLoader(true);
      const logoutFlag = await logoutMethod();
      if (logoutFlag) {
        logout();
        // await removeDatbaseData();
        // await clearDownloadedImages()

        handleContinue();
      }
      else {
        SimpleToast.show("Logout aborted.");
      }
      setLoader(false)
    }
    else {
      SimpleToast.show(translate("please_check_connection"))
    }

  }


  const handleSyncLogout = async () => {
    if (!isConnected) {
      const message = translate("please_check_connection");
      Platform.OS === "ios"
        ? SimpleToast.show(message)
        : ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }

    setLogoutModal(false);
    setLoader(true);

    let anySyncFailed = false;

    const hassOfflineSeedCalc = hasSeedCalc();
    const hassOfflineYieldCalc = hasYieldCalc();

    if (hassOfflineSeedCalc) {
      const seedCalUpdated = await uploadOfflineSeedCalc();
      if (!seedCalUpdated) anySyncFailed = true;
    }

    if (hassOfflineYieldCalc) {
      const yieldCalUpdated = await uploadOfflineYieldCalc();
      if (!yieldCalUpdated) anySyncFailed = true;
    }

    if (getOfflineGeoTagCount() > 0) {
      const result = await uploadOfflineGeoTagDataToServer();
      if (!result.success) anySyncFailed = true;
    }

    if (getOfflineHelpDeskCount() > 0) {
      const result = await uploadOfflineHelpDesk();
      if (!result.success) anySyncFailed = true;
    }

    if (!anySyncFailed) {
      updateOfflineCount();      // ✅ Will update Redux count
      triggerOfflineWatcher();   // ✅ Now start watching Redux for changes
    } else {
      setLoader(false);
      SimpleToast.show("Some data failed to sync. Logout aborted.");
    }
  };

  const handleSyncAndCloseAccount = async () => {
    if (!isConnected) {
      const message = translate("please_check_connection");
      Platform.OS === "ios"
        ? SimpleToast.show(message)
        : ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }

    setLogoutModal(false);
    setLoader(true);

    let anySyncFailed = false;

    const hassOfflineSeedCalc = hasSeedCalc();
    const hassOfflineYieldCalc = hasYieldCalc();

    if (hassOfflineSeedCalc) {
      const seedCalUpdated = await uploadOfflineSeedCalc();
      if (!seedCalUpdated) anySyncFailed = true;
    }

    if (hassOfflineYieldCalc) {
      const yieldCalUpdated = await uploadOfflineYieldCalc();
      if (!yieldCalUpdated) anySyncFailed = true;
    }

    if (getOfflineGeoTagCount() > 0) {
      const result = await uploadOfflineGeoTagDataToServer();
      if (!result.success) anySyncFailed = true;
    }

    if (getOfflineHelpDeskCount() > 0) {
      const result = await uploadOfflineHelpDesk();
      if (!result.success) anySyncFailed = true;
    }

    if (!anySyncFailed) {
      updateOfflineCount();  // ✅ Will update Redux count
      const langId = await getFromAsyncStorage(LANGUAGEID)

      // setTimeout(() => {
      //   // setLoading(false);
      //   // setLoadingMessage('');
      //   const accountCloserLinkUrl =APIConfig.ACCOUNT_CLOSE_URL({
      //     mobileNumber: userData?.mobileNumber,
      //     languageId: langId,
      //     buttonColor: dynamicStyles.primaryColor
      //   });
      //   console.log("fetched account closer", accountCloserLinkUrl);
      //   setAlertVisible(false)
      //    navigation.navigate('AccountCloser', {  onClose: () => {claringUserDataToLogin() }, from: 'MoreScreenRn', dynamicStyles: dynamicStyles, mobileNumber:  userData?.mobileNumber, accountCloseLink: accountCloserLinkUrl, title: translate('accountCloser')})
      // }, 500);
      const accountCloserLinkUrl = APIConfig.ACCOUNT_CLOSE_URL({
        mobileNumber: userData?.mobileNumber,
        languageId: langId,
        buttonColor: dynamicStyles.primaryColor
      });
      console.log("fetched account closer", accountCloserLinkUrl);
      setAlertVisible(false)
      navigation.navigate('AccountCloser', { onClose: () => { claringUserDataToLogin() }, from: 'MoreScreenRn', dynamicStyles: dynamicStyles, mobileNumber: userData?.mobileNumber, accountCloseLink: accountCloserLinkUrl, title: translate('accountCloser') })

      // triggerOfflineWatcher();   // ✅ Now start watching Redux for changes
    } else {
      setLoader(false);
      SimpleToast.show("Some data failed to sync. Logout aborted.");
    }
  };


  const alertCloseHandle = () => {
    setAlertModal(false)
    setLogoutModal(false)
  }


  return (
    <View style={RnStyles.mainContainer}>
      {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}

      <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
        <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
          <View style={[RnStyles.headerContentContainer, Platform.OS == "ios" && { bottom: 15 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
            </TouchableOpacity>
            <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate('Profile')}</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
        <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
      </View>
      <TouchableOpacity style={RnStyles.profileNavContainer} onPress={() => navigation.navigate('ProfileScreen')}>

        <View style={RnStyles.userContent}>

          <View style={RnStyles.farmerIconContainer}>
           
            {userData?.userPic ? (
              <>
                {isConnected ?
                  <Image
                    style={RnStyles.farmerIcon1}
                    source={{ uri: userData?.userPic }}// Update to your actual local image
                  />
                  :
                  <Image
                    style={RnStyles.farmerIcon1}
                    source={defaultImage} // Update to your actual local image
                  />

                }
              </>


            ) : (
              <Image
                style={RnStyles.farmerIcon1}
                source={defaultImage} // Update to your actual local image
              />
            )}
          </View>

          <View style={RnStyles.userNameTextContainer}>
            <Text style={[RnStyles.userNameText, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]} numberOfLines={3}>{userData?.userName}</Text>
            <Text style={[styles.mobileNumText, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{userData?.mobileNumber}</Text>
            <Text style={[styles.mobileNumText, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{dynamicStyles?.companyName}</Text>
          </View>

        </View>
        <Image source={require("../../assets/Images/rightArrowIconImg.png")} style={{ height: width * 0.05, width: width * 0.05, right:15, resizeMode: "contain" }} />
      </TouchableOpacity>

      <View style={{ flexDirection: "row", marginTop: height * 0.07, marginBottom: 15, width: "90%", alignSelf: "center" }}>
        <TouchableOpacity style={RnStyles.serviceListContainer}>
          <View style={RnStyles.serviceListSubContainer}>
            <Image source={require("../../assets/Images/comingSoon.png")} style={{ height: 15, width: "80%", resizeMode: "contain" }} />
            <Image source={require("../../assets/Images/myOrderImgIcon.png")} style={RnStyles.serviceImgs}
            />
          </View>
          <View style={RnStyles.serviceTextContainer}>
            <Text style={[RnStyles.serviceMainText, { fontFamily: fonts.SemiBold }]}>{translate('my_orders')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={RnStyles.serviceListContainer}>
          <View style={RnStyles.serviceListSubContainer}>
            <Image source={require("../../assets/Images/comingSoon.png")} style={{ height: 15, width: "80%", resizeMode: "contain" }} />

            <Image source={require("../../assets/Images/myServiceImgIcon.png")} style={RnStyles.serviceImgs}
            />
          </View>
          <View style={RnStyles.serviceTextContainer}>
            <Text style={[RnStyles.serviceMainText, { fontFamily: fonts.SemiBold }]}>{translate('my_services')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 8, width: "90%", alignSelf: "center", height: height * 0.45, paddingHorizontal: 15, paddingTop: 10 }}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 25 }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Text style={{ fontSize: RFValue(16, height), fontFamily: fonts.Regular, color: "#000", alignSelf: "center", marginTop: height * 0.05, bottom: 10 }}>{`${translate("Version")}${versionApp}`}</Text>

      <CustomCommonModalTwo
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        headerText={translate("Logout_Confirmation")}
        ErrorText={translate("Are_you_sure_you_want_to_log_out")}
        ButtonText={translate("cancel")}
        secondButtonText={translate("logout")}
        ButtonFun={alertCloseHandle}
        secondButton={handleNoSyncLogout}
        buttonVisible={true}
      />

      <LogoutModal
        visible={logoutModal}
        onNoSyncLogout={handleNoSyncLogout}
        onSyncLogout={handleSyncLogout}
        onClose={alertCloseHandle}
      />

      {isAlertVisible && (
        <CustomAlert
          visible={isAlertVisible}
          onPressClose={() => setAlertVisible(false)}
          title={alertTitle}
          showHeader={showAlertHeader}
          showHeaderText={showAlertHeaderText}
          message={alertMessage}
          onPressOkButton={handleOkPress}
          onPressNoButton={handleNoPress}
          showYesButton={showAlertYesButton}
          showNoButton={showAlertNoButton}
          yesButtonText={showAlertYesButtonText}
          noButtonText={showAlertNoButtonText}
        />
      )}

      {loader && <CustomLoader loading={loader} message={loadingMessage} loaderImage={loaderImage} progress={progress} />}
    </View>
  )
}

export default MoreScreenRn

const RnStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // width: "100%",
    backgroundColor: "#F2F6F9"
  },

  headerMainContainer: {
    paddingTop: height * 0.03,
    paddingHorizontal: 20,
    height: height * 0.15
  },

  headerContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // width: "55%"
  },

  backArrowImg: {
    height: height * 0.05,
    width: width * 0.1,
    resizeMode: "contain"
  },

  bookSeedsText: {
    fontSize: RFValue(16, height),
    alignSelf: "center",
    lineHeight: 30
  },

  flowerImg: {
    position: "absolute",
    top: 30,
    right: 20,
    height: 50,
    width: 100,
    tintColor: "#000",
    resizeMode: "contain"
  },

  profileNavContainer: {
    // styles.height_82,
    //  styles.width_335, 
    //  styles.marginTop_20,
    //  styles.white_bg,
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
    position: "absolute",
    top: height * 0.1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    minHeight: height * 0.05
  },

  userContent: {
    flexDirection: "row"
  },

  farmerIconContainer: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 40,
    height: height * 0.06,
    width: height * 0.06,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginRight: 5
  },

  farmerIcon1: {
    height: width * 0.1,
    width: width * 0.1,
    borderRadius: 40
  },

  farmerIcon: {
    height: height * 0.05,
    width: width * 0.2,
    resizeMode: "contain"
  },

  userNameTextContainer: {
    marginLeft: 10
  },

  userNameText: {
    fontSize: RFValue(15, height),
    width: 240,
  },

  mobileNumText: {
    fontSize: RFValue(14, height),
  },

  serviceListContainer: {
    width: "31.4%",
    height: height * 0.14,
    backgroundColor: "#fff",
    marginRight: 9,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    padding: 5,
    paddingTop: 15
  },

  serviceListSubContainer: {
    backgroundColor: "#F2F6F9",
    width: 85,
    height: 58,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },

  serviceImgs: {
    height: width * 0.1,
    width: width * 0.1,
  },

  serviceTextContainer: {
    marginTop: 5,
    alignItems: "center"
  },

  serviceMainText: {
    color: "#000",
    fontSize: RFValue(16, height),
    lineHeight: 20
  }
})