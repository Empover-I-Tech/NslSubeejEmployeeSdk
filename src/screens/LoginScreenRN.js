import { Pressable, View, Dimensions, StyleSheet, Keyboard, ImageBackground, BackHandler, ScrollView, StatusBar, Linking, TouchableOpacity, Text as RnText, TextInput, Image, Platform, PermissionsAndroid, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { strings } from '../Localization/StringsCopy';
import usePostRequestWithJwt from '../api/usePostRequestWithJwt';
import APIConfig, { FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, APP_ENV_PROD, HTTP_OK, HTTP_SWITCHING_PROTOCOLS, SECOND_LOGIN } from '../api/APIConfig';
import { decodeJwt, GetApiHeaders, getAppVersion, getBuildNumber, downloadFileToLocal } from '../utils/helpers';
import { MOBILENUMBER, ROLDID, USER_ID, USERNAME, LANGUAGEID, USER_IMG, FIRSTNAME, LASTNAME, COMPANYCODE, SCREENNAME, EMP_DASHBOARD_SCREEN, ROLENAME } from '../utils';
import CustomAlert from '../components/CustomAlert';
import { storeInAsyncStorage, getFromAsyncStorage } from '../utils/keychainUtils';
import PermissionManager from '../utils/PermissionManager';
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { translate } from '../Localization/Localisation';
import { useDispatch, useSelector } from 'react-redux';
import { setCompanyStyle } from '../state/actions/companyStyles';
import { setIsEmployee } from '../state/actions/employeeActions';
import { RFValue } from 'react-native-responsive-fontsize';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { setSelectedCompanyAct } from '../state/actions/selectedCompanyActions';
import { CustomCommonModal, CustomCommonModalTwo } from '../components/CustomCommonModal';
import firestore from '@react-native-firebase/firestore';
import CustomOTP from '../components/CustomOTP';
import CustomLoader from '../components/CustomLoader';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from '../hooks/useFontStyles';
import { compareVersions } from '../assets/Utils/Utils';
const { width, height } = Dimensions.get('window');
const playStore = "https://play.google.com/store/apps/details?id=com.nsl.subeejkisan"
const appStoreLink = 'https://apps.apple.com/us/app/subeej/id6748138745'


const LoginScreenRn = () => {
  const fonts = useFontStyles();
  const navigation = useNavigation();
  const [isClicked, setIsClicked] = useState(false);
  const isConnected = useSelector((state) => state.network.isConnected);
  const dispatch = useDispatch();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(true);
  const [checkboxError, setCheckboxError] = useState('');
  const currentTheme = useSelector(state => state.theme.theme);
  const { error: apiError, sendData, } = usePostRequestWithJwt();
  const [otpEnable, setOTPEnable] = useState(false);
  const [otp, setOtp] = useState(undefined);
  const [timer, setTimer] = useState(120);
  const [resetOtp, setResetOtp] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [apiRequestType, setApiRequestType] = useState(null);
  const [startTimer, setStartTimer] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false);
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertYesButton, setShowAlertYesButton] = useState(false);
  const [showAlertNoButton, setShowAlertNoButton] = useState(false);
  const [showAlertYesButtonText, setShowAlertYesButtonText] = useState("");
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState("");
  const [isStoringData, setIsStoringData] = useState(false);
  const [loader, setLoader] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../../assets/Images/SubeejLoader.gif'))
  const [progress, setProgress] = useState(10)
  const [serverOtp, setServerOTP] = useState('')
  const [checkedWA, setCheckedWA] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [storagePermission, setStoragePermission] = useState(null);
  const [verifyDisable, setVerifyDisable] = useState(true)
  const selectedCompanyData = useSelector(state => state.selectedCompnayAct.selectedCompanyAct)
  const [alertModal, setAlertModal] = useState(false)
  const [alertModalContent, setAlertModalContent] = useState("")
  const [languageSetId, setLanguageSetId] = useState("")
  const [requestOtpDisable, SetRequestOtpDisable] = useState(true)
  const [alertModalSecond, setAlertModalSecond] = useState(false)
  const [alertSecondTitle, setAlertSecondTitle] = useState("")
  const [alertSecondDescription, setAlertSecondDescription] = useState("")
  const [alertSecondButtonFirstName, setAlertSecondsButtonFirstName] = useState("")
  const [alertSecondButtonSecondName, setAlertSecondsButtonSecondName] = useState("")
  const [successOtp, setSuccessOtp] = useState(true)

  useEffect(() => {
    const handleBackPress = () => {
      if (otpEnable) {
        setOTPEnable(false);
        return true;
      }
      setAlertModalSecond(true)
      setAlertSecondTitle(translate("Exit_App"))
      setAlertSecondDescription(translate('exitAppMessage'))
      setAlertSecondsButtonFirstName(translate("cancel"))
      setAlertSecondsButtonSecondName(translate('yes'))
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [otpEnable]);

  const secondBtnHandleAlert = async () => {
    if (alertSecondDescription === translate('exitAppMessage')) {
      BackHandler.exitApp();
    } else if (alertSecondDescription === translate("already_logged_in")) {
      if (validateForm()) {
        clearOtp()
        setAlertModalSecond(false)
        const payload = { mobileNumber: mobileNumber, userAcceptanceKey: 1 };
        const getURL = APIConfig.BASE_URL + APIConfig.AUTH.GETOTP;
        const getHeaders = await GetApiHeaders();
        getHeaders.authType = "JSONREQUEST";
        getHeaders["Content-Type"] = "application/json";
        setTimer(40);
        if (isConnected) {
          try {
            const response = await fetch(getURL, {
              method: "POST",
              headers: getHeaders,
              body: JSON.stringify(payload),
            });
            const jsonData = await response.json();
            setLoader(false)
            setVerifyDisable(true)
            setIsOtpSent(true);
            if (jsonData.statusCode === SECOND_LOGIN) {
              SetRequestOtpDisable(true)
              setLoader(false)
              setVerifyDisable(true)
              return;
            } else if (jsonData.statusCode === HTTP_OK) {
              SetRequestOtpDisable(false)
              setLoader(false)
              setVerifyDisable(true)
              setTimer(120);
              setOTPEnable(true);
              setServerOTP(response?.otp?.otp);
              setStartTimer(true);
              setAlertVisible(false);
              return;
            } else {
              setLoader(false)
              SetRequestOtpDisable(true)
            }
          } catch (error) {
            SetRequestOtpDisable(true)
            console.error("Network or parsing error:", error);
          }
        } else {
          setLoader(false)
          SetRequestOtpDisable(true)
          SimpleToast.show(translate("no_internet_conneccted"))
        }
      }
    }
  }

  useEffect(() => {
    if (startTimer && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [startTimer, timer]);

  useFocusEffect(
    useCallback(() => {
      handleLocationPermission()
      checkPermissions()
      checkForceUpdate()
      requestNotificationPermission()
    }, [])
  );

  async function requestNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (!granted) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission granted');
          return true;
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            translate("Enable_Notifications"),
            translate("Please_allow_notification_permission_settings"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        } else {
          console.log('Permission denied');
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true; // No runtime permission needed below Android 13
    }
  }

  async function checkForceUpdate() {
    try {
      const subscriber = firestore()
        .collection(FIREBASE_VERSION_COLLECTION_NAME)
        .doc(FIREBASE_VERSION_DOC_ID)
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot?.exists) {
            const data = documentSnapshot?.data();
            if (data) {
              setTimeout(() => {
                // checkAppversionUpdate(data);
                if (Platform.OS == "android") {
                  checkAppversionUpdate(data);
                } else {
                  checkAppversionUpdateIOS(data);
                }
              }, 500);
            } else {
              console.error('Document data is undefined');
            }
          } else {
            console.error('Document does not exist');
          }
        });

      return () => subscriber();
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  }

  async function checkAppversionUpdate(documentSnapshot) {
    try {
      const appDetails = await getAppVersion();
      const appVersionCode = await getBuildNumber()
      console.log("App version details:", appDetails);
      console.log("Document snapshot data:", documentSnapshot);
      console.log("VERSIONCODE=-=-=->", appVersionCode)
      if (documentSnapshot) {
        const AppVersionPROD = Platform.OS === 'ios' ? documentSnapshot.iosAppVersion : documentSnapshot?.androidAppVersion;
        console.log("Version from Firestore:", AppVersionPROD);
        let showForceUpdateOrNOT = documentSnapshot?.showForceUpdate;
        let AppVersionUAT = Platform.OS == "ios" ? documentSnapshot?.iosAppVersionUAT : documentSnapshot?.androidAppVersionUAT
        console.log("showForceUpdateOrNOT=-==>", showForceUpdateOrNOT)
        console.log("FIREBASEAPPVERSIONUAT=-=-=->", AppVersionUAT)
        console.log("LOCALVERSIONCODE=-=-=->", appVersionCode)
        console.log("BASEURL=-=->", APIConfig.BASE_URL)
        console.log("APP_ENV_PROD=-=->", APP_ENV_PROD)
        console.log("ISGREATERTHENLOCAL=-=->", AppVersionUAT > appVersionCode)
        //APP_ENV_PROD
        if (APP_ENV_PROD) {
          console.log('we are in LIVE server')
          if (AppVersionPROD && AppVersionPROD > appVersionCode) {
            const isMandatory = Platform.OS === 'android'
              ? documentSnapshot.isMandatoryForAndroid
              : documentSnapshot.isMandatoryForIos;
            // showAlertWithMessage(strings.alert, true, true, documentSnapshot.message || strings.update_message, true, !isMandatory, strings.update, strings.cancel);
          }
        } else {
          console.log('we are in UAT server')
          if (AppVersionUAT && AppVersionUAT > appVersionCode) {
            const isMandatory = Platform.OS === 'android'
              ? documentSnapshot.isMandatoryForAndroid
              : documentSnapshot.isMandatoryForIos;
            console.log("Update is mandatory:", isMandatory);
            console.log("documentSnapshot=-=-=>", documentSnapshot.message)
            // showAlertWithMessage(strings.alert, true, true, documentSnapshot.message || strings.update_message, true, !isMandatory, strings.update, strings.cancel);
          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error in checkAppversionUpdate:', error);
    }
  }
  async function checkAppversionUpdateIOS(documentSnapshot) {
    // const localVersion = DeviceInfo.getVersion(); // Need to change for Android in future
    const localVersion = await getAppVersion();
    let remoteVersion = '';

    if (APP_ENV_PROD) {
      if (Platform.OS === 'android') {
        remoteVersion = documentSnapshot.androidAppVersion;
      } else {
        remoteVersion = documentSnapshot.iosAppVersion;
      }
    } else {
      if (Platform.OS === 'android') {
        remoteVersion = documentSnapshot.androidAppVersionUAT;
      } else {
        remoteVersion = documentSnapshot.iosAppVersionUAT;
      }
    }
    // let showForceUpdate = Platform.OS == 'ios' ? documentSnapshot?.showForceUpdateIOS : documentSnapshot?.showForceUpdate;
    let isMandatory = Platform.OS == 'ios' ? documentSnapshot.isMandatoryForIos : documentSnapshot.isMandatoryForAndroid;

    console.log(`Local: ${localVersion} | Remote: ${remoteVersion}`);
    if (compareVersions(localVersion, remoteVersion) < 0) {
      //showAlertWithMessage(strings.alert, true, true, documentSnapshot.message || strings.update_message, true, !isMandatory, strings.update, strings.cancel);
    } else {
      setAlertVisible(false);
    }
  }

  const checkPermissions = async () => {
    const cameraStatus = await check(
      Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
    );

    const storageStatus = await check(
      Platform.OS === "android"
        ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.PHOTO_LIBRARY
    );

    setCameraPermission(cameraStatus);
    setStoragePermission(storageStatus);
    if (cameraStatus !== RESULTS.GRANTED || storageStatus !== RESULTS.GRANTED) {
      requestPermissions();
    }
  };

  const requestPermissions = async () => {
    if (cameraPermission !== RESULTS.GRANTED) {
      const newCameraStatus = await request(
        Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
      );
      setCameraPermission(newCameraStatus);
    }

    if (storagePermission !== RESULTS.GRANTED) {
      const newStorageStatus = await request(
        Platform.OS === "android" ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : PERMISSIONS.IOS.PHOTO_LIBRARY
      );
      setStoragePermission(newStorageStatus);
    }
  };

  const extractOtp = (message) => {
    const otpRegex = /\b\d{6}\b/;
    const match = message.match(otpRegex);
    return match ? match[0] : null;
  };


  const handleLocationPermission = async () => {
    const isGranted = await PermissionManager.requestLocationPermission();
    console.log('Location Permission:', isGranted ? 'Granted' : 'Denied');
  };

  const storeUserData = async (data) => {
    try {
      setIsStoringData(true);
      await storeInAsyncStorage(MOBILENUMBER, `${mobileNumber}`);
      console.log("DATA_FROM_SERVER", data);

      if (data?.id) await storeInAsyncStorage(USER_ID, `${data.id}`);
      if (data?.firstName) {
        await storeInAsyncStorage(USERNAME, `${data.firstName} ${data.lastName}`);
        await storeInAsyncStorage(FIRSTNAME, `${data.firstName}`);
        await storeInAsyncStorage(LASTNAME, `${data.lastName}`);
      }
      if (data?.roleId) await storeInAsyncStorage(ROLDID, `${data.roleId}`)
      if (data?.roleName) await storeInAsyncStorage(ROLENAME, `${data.roleName}`)
      if (data?.screenName) await storeInAsyncStorage(SCREENNAME, `${data.screenName}`)
      if (data?.profilePic) await storeInAsyncStorage(USER_IMG, `${data?.profilePic}`);
      if (data?.companyCode !== undefined && data?.companyCode !== null && data?.companyCode !== "") {

        await storeInAsyncStorage(COMPANYCODE, `${data?.companyCode}`);
      } else {
        await storeInAsyncStorage(COMPANYCODE, `${""}`);
      }

      await storeInAsyncStorage('isLoggedIn', 'true');
      // navigation.dispatch(
      //   CommonActions.reset({
      //     index: 0,
      //     routes: [{ name: 'HomeScreenRn', params: { languageId: selectedCompanyData?.languageId || 0, } }],
      //   })
      // );
      // navigation.dispatch(
      //   CommonActions.reset({
      //     index: 0,
      //     routes: [
      //       {
      //         name: 'MainTabs',
      //         params: {
      //           screen: 'HomeScreenRn', // default tab
      //           params: { languageId: selectedCompanyData?.languageId || 0 },
      //         },
      //       },
      //     ],
      //   })
      // );
      const isEmployee = (data?.screenName == EMP_DASHBOARD_SCREEN);
      dispatch(setIsEmployee(isEmployee));

      const routeConfig = isEmployee
        ? {
          name: 'BottomTabsNavigatorEmp',
          screen: 'HomeScreenEmp',
        }
        : {
          name: 'MainTabs',
          screen: 'HomeScreenRn',
        };
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: routeConfig.name,
              params: {
                screen: routeConfig.screen,
                params: { languageId: selectedCompanyData?.languageId || 0 },
              },
            },
          ],
        })
      );

      setLoader(false);
    } catch (error) {
      console.error("Failed to store user data in keychain:", error);
    } finally {
      setIsStoringData(false);
    }
  };

  const showAlertWithMessage = (title, header, headerText, message, yesBtn, noBtn, yesText, noText) => {
    setAlertTitle(title);
    setShowAlertHeader(header);
    setShowAlertHeaderText(headerText);
    setAlertMessage(message);
    setShowAlertYesButton(yesBtn);
    setShowAlertNoButton(noBtn);
    setShowAlertYesButtonText(yesText);
    setShowAlertNoButtonText(noText);
    setAlertVisible(true);
  };

  const handleOkPress = async () => {
    if (alertMessage == translate('exitAppMessage')) {
      BackHandler.exitApp();
    }
    if (alertMessage == 'OTP has expired') {
      clearOtp()
    }
    if (alertMessage == strings.update_message) {
      if (Platform.OS == 'ios') {
        Linking.openURL(appStoreLink)
      } else {
        Linking.openURL(playStore)
      }
    }
    setAlertVisible(false);
  };

  const handleNoPress = () => {
    console.log("No Pressed");
    setAlertVisible(false);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardVisible]);

  const alertCloseHandle = () => {
    setAlertModal(false)
    setAlertModalSecond(false)
  }

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const validate = () => {
    let isValid = true;
    if (otp != serverOtp) {
      isValid = false;
      return;
    }
    return isValid;
  }

  const validateForm = () => {
    let isValid = true;

    if (mobileNumber.length === 0) {
      setError(translate("Mobile_number_is_required"));
      isValid = false;
      return;
    } else if (mobileNumber.length < 10) {
      setError(translate("Mobile_number_must_be_digits"));
      isValid = false;
      return;
    } else {
      setError('');
    }

    if (!isCheckboxChecked) {
      setCheckboxError('You must agree to the Terms & Conditions and Privacy Policy.');
      isValid = false;
    } else {
      setCheckboxError('');
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (mobileNumber.length === 10) {
      SetRequestOtpDisable(false)
    }
    if (isConnected) {
      if (mobileNumber.length === 0) {
        setError(translate("Mobile_number_is_required"));
        isValid = false;
        return;
      } else if (mobileNumber.length < 10) {
        setError(translate("Mobile_number_must_be_digits"));
        isValid = false;
        return;
      }
      else {
        setLoader(true)
        clearOtp();
        const payload = { mobileNumber: mobileNumber, userAcceptanceKey: 0 };
        const getURL = APIConfig.BASE_URL + APIConfig.AUTH.GETOTP;
        const getHeaders = await GetApiHeaders();
        getHeaders.authType = "JSONREQUEST";
        getHeaders["Content-Type"] = "application/json";
        console.log("getHeaders", getHeaders)
        try {
          const response = await fetch(getURL, {
            method: "POST",
            headers: getHeaders,
            body: JSON.stringify(payload),
          });
          const jsonData = await response.json();
          console.log("Parsed response:", jsonData);
          setLoader(false)
          setVerifyDisable(true)
          setIsOtpSent(true);
          console.log("otpResponse", jsonData.statusCode);
          if (jsonData.statusCode === SECOND_LOGIN) {
            SetRequestOtpDisable(true)
            setLoader(false)
            setVerifyDisable(true)
            setAlertModalSecond(true)
            setAlertSecondTitle(translate("alert"))
            setAlertSecondDescription(translate('already_logged_in'))
            setAlertSecondsButtonFirstName(translate("cancel"))
            setAlertSecondsButtonSecondName(translate('proceed'))
            return;
          } else if (jsonData.statusCode === HTTP_OK) {
            setLoader(false)
            setVerifyDisable(true)
            setTimer(120);
            setOTPEnable(true);
            setServerOTP(response?.otp?.otp);
            setStartTimer(true);
            return;
          } else if (jsonData.statusCode === 500) {
            showAlertWithMessage(translate('alert'), true, true, jsonData?.message, true, false, translate('ok'), translate('cancel'));
            SetRequestOtpDisable(true)
            setLoader(false)
            setVerifyDisable(true)
            console.log("VALIDATE_RESPONSE_500",);
            setOtp("")
          }
          else if (jsonData.statusCode === 106) {
            SetRequestOtpDisable(true)
            setAlertModal(true)
            setAlertModalContent(jsonData?.message)
            setLoader(false)
            setOTPEnable(false);
          }
          else {
            setLoader(false)
            SetRequestOtpDisable(true)
          }
        } catch (error) {
          SetRequestOtpDisable(true)
          console.error("Network or parsing error:", error);
        }
      }
    } else {
      setLoader(false)
      SetRequestOtpDisable(true)
      SimpleToast.show(translate("no_internet_conneccted"))
    }
  };

  const handleVerifyOtpCLick = async () => {
    setVerifyDisable(false)
    if (otp.length == 6) {
      setLoader(true)
      const getURL = APIConfig.BASE_URL + APIConfig.AUTH.VALIDATEOTP;
      const getHeaders = await GetApiHeaders();
      getHeaders.authType = "JSONREQUEST";
      getHeaders["Content-Type"] = "application/json";
      const payload = {
        mobileNumber: mobileNumber,
        otp: otp,
        optInForWhatsApp: checkedWA,
        termsAndConditionsAccepted: true
      }
      if (isConnected) {
        try {
          const response = await fetch(getURL, {
            method: "POST",
            headers: getHeaders,
            body: JSON.stringify(payload),
          });
          const jsonData = await response.json();
          if (jsonData.statusCode === HTTP_SWITCHING_PROTOCOLS) {
            SetRequestOtpDisable(true)
            setAlertModal(true)
            setAlertModalContent(jsonData?.message)
            setLoader(false)
            setOTPEnable(false);
          } else if (jsonData.statusCode === HTTP_OK) {
            setSuccessOtp(false)
            const data = jsonData.response
            const dynamicStyles = {};
            console.log("datacheking=-=-=>", JSON.stringify(data))
            dynamicStyles.languageId = (data?.languageId != undefined && data?.languageId != "" && data?.languageId != null) ? data?.languageId : "1";
            dynamicStyles.companyName = (data?.companyName != undefined && data?.companyName != "" && data?.companyName != null) ? data?.companyName : "";
            dynamicStyles.programName = (data?.programName != undefined && data?.programName != "" && data?.programName != null) ? data?.programName : "";
            dynamicStyles.companyCode = (data?.companyCode != undefined && data?.companyCode != "" && data?.companyCode != null) ? data?.companyCode : "";
            dynamicStyles.companyLogo = (data?.companyLogo != undefined && data?.companyLogo != "" && data?.companyLogo != null) ? data?.companyLogo : "";
            dynamicStyles.primaryColor = (data?.primaryColor != undefined && data?.primaryColor != "" && data?.primaryColor != null) ? data?.primaryColor : "#ed3237";
            dynamicStyles.secondaryColor = (data?.secondaryColor != undefined && data?.secondaryColor != "" && data?.secondaryColor != null) ? data?.secondaryColor : "#ffffff";
            dynamicStyles.textColor = (data?.textColor != undefined && data?.textColor != "" && data?.textColor != null) ? data?.textColor : "#000000";
            dynamicStyles.id = (data?.id != undefined && data?.id != "" && data?.id != null) ? data?.id : "0";
            if (data?.loaderLogo != undefined && data?.loaderLogo != "" && data?.loaderLogo != null) {
              const filePath = await downloadFileToLocal(false, data?.loaderLogo, data?.loaderLogo.split('/').pop())
              dynamicStyles.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
              dynamicStyles.programInfo = (data?.programInfo != undefined && data?.programInfo != "" && data?.programInfo != null) ? data?.programInfo : "";
              dynamicStyles.companyInfo = (data?.companyInfo != undefined && data?.companyInfo != "" && data?.companyInfo != null) ? data?.companyInfo : "";
              dynamicStyles.programLogo = (data?.programLogo != undefined && data?.programLogo != "" && data?.programLogo != null) ? data?.programLogo : "";
              dynamicStyles.programLogoNew = (data?.programLogoNew != undefined && data?.programLogoNew != "" && data?.programLogoNew != null) ? data?.programLogoNew : "";
            } else {
              dynamicStyles.loaderPath = "";
            }

            dynamicStyles.firstName = (data?.firstName != undefined && data?.firstName != "" && data?.firstName != null) ? data?.firstName : "";
            dynamicStyles.lastName = (data?.lastName != undefined && data?.lastName != "" && data?.lastName != null) ? data?.lastName : "";
            dynamicStyles.pincode = (data?.pincode != undefined && data?.pincode != "" && data?.pincode != null) ? data?.pincode : "";
            dynamicStyles.state = (data?.state != undefined && data?.state != "" && data?.state != null) ? data?.state : "";
            dynamicStyles.district = (data?.district != undefined && data?.district != "" && data?.district != null) ? data?.district : "";
            dynamicStyles.tahsil = (data?.tahsil != undefined && data?.tahsil != "" && data?.tahsil != null) ? data?.tahsil : "";
            dynamicStyles.addressLine = (data?.addressLine != undefined && data?.addressLine != "" && data?.addressLine != null) ? data?.addressLine : "";
            dynamicStyles.landMark = (data?.landMark != undefined && data?.landMark != "" && data?.landMark != null) ? data?.landMark : "";
            dynamicStyles.villageLocation = (data?.villageLocation != undefined && data?.villageLocation != "" && data?.villageLocation != null) ? data?.villageLocation : "";
            dynamicStyles.crop = (data?.crop != undefined && data?.crop != "" && data?.crop != null) ? data?.crop : "";
            dynamicStyles.stateId = (data?.stateId != undefined && data?.stateId != "" && data?.stateId != null) ? data?.stateId : "";
            dynamicStyles.districtId = (data?.districtId != undefined && data?.districtId != "" && data?.districtId != null) ? data?.districtId : "";
            dynamicStyles.profilePic = (data?.profilePic != undefined && data?.profilePic != "" && data?.profilePic != null) ? data?.profilePic : "";

            dispatch(setCompanyStyle(dynamicStyles));
            await storeUserData(data);
          } else if (jsonData.statusCode === 500) {
            setAlertModal(true)
            setAlertModalContent(jsonData?.message)
            setLoader(false)
            setVerifyDisable(true)
            setOtp("")
            console.log("VALIDATE_RESPONSE_500",);
          } else if (jsonData.statusCode === 900) {
            const data = jsonData.response
            await storeInAsyncStorage(MOBILENUMBER, `${mobileNumber}`);
            const selectedCompnayDetails = selectedCompanyData
            selectedCompnayDetails.selectedCompanyDet = data
            dispatch(setSelectedCompanyAct(selectedCompnayDetails));
            navigation.navigate('RegistrationRn');
            setLoader(false)
            setOtp("")
            setVerifyDisable(true)
            setOTPEnable(false);
          } else {
            setLoader(false);
          }
          setResetOtp(true);

          setTimeout(() => {
            setResetOtp(false);
          }, 500);
        } catch (error) {
          console.error("Network or parsing error:", error);
        }
      } else {
        SimpleToast.show(translate("no_internet_conneccted"))
      }
    } else {
      setLoader(false)
    }
  }

  const handleResendOtp = async () => {
    setVerifyDisable(true)
    clearOtp()
    const payload = { mobileNumber: mobileNumber, userAcceptanceKey: 0, };
    const getURL = APIConfig.BASE_URL + APIConfig.AUTH.GETOTP;
    const getHeaders = await GetApiHeaders();
    getHeaders.authType = "JSONREQUEST";
    getHeaders["Content-Type"] = "application/json";
    setTimer(120);
    try {
      const response = await fetch(getURL, {
        method: "POST",
        headers: getHeaders,
        body: JSON.stringify(payload),
      });
      const jsonData = await response.json();
      console.log("Parsed response:", jsonData);
      setLoader(false)
      setVerifyDisable(true)
      setIsOtpSent(true);
      console.log("otpResponse", jsonData.statusCode);
      if (jsonData.statusCode === SECOND_LOGIN) {
        setLoader(false)
        setVerifyDisable(true)
        setAlertModalSecond(true)
        setAlertSecondTitle(translate("alert"))
        setAlertSecondDescription(translate('already_logged_in'))
        setAlertSecondsButtonFirstName(translate("cancel"))
        setAlertSecondsButtonSecondName(translate('proceed'))
        return;
      } else if (jsonData.statusCode === HTTP_OK) {
        setLoader(false)
        setVerifyDisable(true)
        setTimer(120);
        setOTPEnable(true);
        setServerOTP(response?.otp?.otp);
        setStartTimer(true);
        SimpleToast.show(translate("OTP_send_Successfully"))
        return;
      } else {
        setLoader(false)
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
    }
  };

  const clearOtp = () => {
    setOtp(""); // Clear OTP by resetting the value
  };

  useEffect(() => {
    if (apiError) {
      setError(apiError || 'Network error. Please check your connection and try again.');
      setApiRequestType(null); // Clear the request type on error
    }
  }, [apiError]);

  useEffect(() => {
    const getLanguageIdFn = async () => {
      const langId = await getFromAsyncStorage(LANGUAGEID)
      setLanguageSetId(langId ? langId : "")
    }
    getLanguageIdFn()

  }, [])

  const otpSubmitBut = () => {
    handleSubmit();
  }

  const handlePress = () => {
    navigation.navigate("SignUp")
  };

  onCodeChanged = (code) => {
    setOtp(code)
    console.log('what is OTP code', code);
  }

  const handleOnChangeMobileNum = useCallback((text) => {
    setOTPEnable(false);
    SetRequestOtpDisable(true)
    const cleanedText = text.replace(/[^0-9]/g, '').replace(/^[^6-9]+/, '');
    setMobileNumber(cleanedText);
    setError('');
  }, []);

  const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0;


  return (
    // <>
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} >
      <ImageBackground source={require("../../assets/Images/backgroundImg.png")} style={{
        width: '100%',
        minHeight: '100%',
        paddingTop: statusBarHeight
      }}
        resizeMode="cover">
        {Platform.OS === 'android' && (<StatusBar backgroundColor={"#845EF1"} barStyle={currentTheme.statusBar} />)}
        <View style={Rnstyles.companyLogoMain} />
        <View style={Rnstyles.contentMainContainer}>
          <View style={[Platform.OS == "ios" && { paddingTop: 50 }]}>
            <RnText style={[Rnstyles.welcomeText, { fontFamily: fonts.Bold }]}>{translate("welcome")}</RnText>
            <RnText style={[Rnstyles.letSignText, { fontFamily: fonts.SemiBold }]}>{translate("lets_sign_you_in")}</RnText>
          </View>
          <ScrollView bounces={false} scrollEnabled={true} showsVerticalScrollIndicator={false} >
            <View>
              <View>
                <RnText style={[Rnstyles.mobileNumberLabel, { fontFamily: fonts.Regular }]}>{translate('mobile_number')}</RnText>
                <View style={[Rnstyles.mobileNumberTextContainer, { borderColor: error ? "red" : "#BFC4C1", }]}>
                  <View style={Rnstyles.countryCodeContainer}>
                    <RnText style={[Rnstyles.countryCodeText, { fontFamily: fonts.Regular }]}>{translate('+91')}</RnText>
                  </View>
                  <TextInput
                    placeholder={translate('enter_your_mobile_number')}
                    placeholderTextColor={"#BFC4C1"}
                    maxLength={10}
                    keyboardType="phone-pad"
                    style={[Rnstyles.mobileTextInput, { fontFamily: fonts.Regular }]}
                    value={mobileNumber}
                    onChangeText={handleOnChangeMobileNum}
                  />
                  <Image resizeMode="contain" style={Rnstyles.mobileIcon} source={require("../../assets/Images/mobileIconImg.png")} />
                </View>

              </View>
              {error ? <RnText style={[Rnstyles.errorMssgText, { fontFamily: fonts.Regular }]}>{error}</RnText> : null}
              <View style={Rnstyles.whatsAppContainer}>
                <Pressable onPress={() => { otpEnable ? "" : setCheckedWA(!checkedWA) }}>
                  <Image style={Rnstyles.whatsAppIcon} source={require("../../assets/Images/whatsAppIconImg.png")} />
                </Pressable>
                <RnText style={[Rnstyles.whatsUpText, { fontFamily: fonts.Regular }]}>
                  {translate('optInForWhatsApp')}
                </RnText>
              </View>
              <View style={Rnstyles.checkBoxContainer}>
                <View style={[Rnstyles.termsAndConditiosnMainContainer, { backgroundColor: isCheckboxChecked ? "#845EF1" : "#fff", borderColor: isCheckboxChecked ? "#845EF1" : "#B4B4B4", }]}>
                  {isCheckboxChecked &&
                    <Image style={Rnstyles.checkIcon} source={require("../../assets/Images/correctTickIcon.png")} />
                  }
                </View>
                <RnText style={[Rnstyles.termsAndConditionsText, { fontFamily: fonts.Regular }]}>
                  {translate('bySigningText')}{' '}<RnText onPress={() => Linking.openURL(`https://subeejkisan.com/termsAndConditions?languageId=${languageSetId}&companyCode=&ProgramName=`)} style={[Rnstyles.termsAndConditionText2, { fontFamily: fonts.Regular }]}>{translate('termsConditions')}</RnText> {translate("and")}{' '}
                  <RnText onPress={() => Linking.openURL(`https://subeejkisan.com/privacy?languageId=${languageSetId}`)} style={Rnstyles.termsAndConditionText2}>{translate('privacyPolicy')}</RnText>
                </RnText>
              </View>
              {checkboxError && <RnText style={[Rnstyles.checkBoxError, { fontFamily: fonts.Regular }]}>{checkboxError}</RnText>}
              {requestOtpDisable &&
                <TouchableOpacity style={[Rnstyles.requestOptBtnContainer, { backgroundColor: isClicked ? "#D6BCFA" : "#845EF1" }]} disabled={!otpEnable ? false : true} onPress={() => {
                  handleSubmit();
                }}>
                  <RnText style={[Rnstyles.requestOtpText, { fontFamily: fonts.SemiBold }]}>
                    {translate('Request_OTP')}
                  </RnText>
                </TouchableOpacity>
              }
              {otpEnable &&
                <View style={Rnstyles.verifyOtpTextContainer}>
                  <View style={Rnstyles.verifyTextSubContainer}>
                    <RnText style={[Rnstyles.verifyOtpText, { fontFamily: fonts.Bold }]}>
                      {translate('verify_otp')}
                    </RnText>
                    <View style={Rnstyles.timerContainer}>
                      <ImageBackground
                        source={require("../../assets/Images/timeIcon_n.png")}
                        style={[{ width: 18, height: 20, marginEnd: 5, }]}>
                        <AnimatedCircularProgress
                          size={15}
                          width={8}
                          fill={(timer / 120) * 100}
                          tintColor="red"
                          tintTransparency={false}
                          rotation={+0}
                          style={{ alignSelf: 'center', padding: 3, marginTop: 0.65 }}
                        />
                      </ImageBackground>
                      <RnText style={[Rnstyles.timerColor, { fontFamily: fonts.Bold }]}>{formatTime(timer)}</RnText>
                    </View>
                  </View>
                  <CustomOTP otpKeyBoardVisibe={successOtp} resetOTP={resetOtp} onEndEditting={(otp) => { onCodeChanged(otp) }} />
                  <View style={Rnstyles.resendOtpContainer}>
                    <RnText style={[Rnstyles.notYetReceivedText, { fontFamily: fonts.Regular }]}>
                      {translate('not_received_code')}
                    </RnText>
                    <RnText
                      style={[Rnstyles.resendText, { color: timer > 0 ? '#FBCEB1' : 'red', fontFamily: fonts.SemiBold }]}
                      onPress={handleResendOtp}
                      disabled={timer > 0}
                    >
                      {translate('resend_code')}
                    </RnText>
                  </View>
                  <TouchableOpacity
                    style={[Rnstyles.verifyContainer,
                    {
                      backgroundColor: otp && otp.length === 6 ? "#845EF1" : "#D1C4E9",
                    },
                    ]}
                    onPress={handleVerifyOtpCLick}
                    disabled={!(verifyDisable && otp.length === 6)}
                  >
                    <RnText
                      style={[Rnstyles.verify, { fontFamily: fonts.Bold }]}
                    >
                      {translate('verify')}
                    </RnText>
                  </TouchableOpacity>
                </View>
              }
            </View>
            <View style={{ height: Platform.OS == "ios" ? height * 0.05 : height * 0.2 }} />
          </ScrollView>
        </View>

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

        <CustomCommonModal
          modalVisible={alertModal}
          modalClose={alertCloseHandle}
          ErrorText={alertModalContent}
          ButtonText={translate("ok")}
          ButtonFun={alertCloseHandle}

        />

        <CustomCommonModalTwo
          modalVisible={alertModalSecond}
          modalClose={alertCloseHandle}
          headerText={alertSecondTitle}
          ErrorText={alertSecondDescription}
          ButtonText={alertSecondButtonFirstName}
          secondButtonText={alertSecondButtonSecondName}
          ButtonFun={alertCloseHandle}
          secondButton={secondBtnHandleAlert}
          buttonVisible={true}
        />
      </ImageBackground>
      {loader && <CustomLoader loading={loader} message={loadingMessage} loaderImage={loaderImage} progress={progress} />}
    </KeyboardAvoidingView>

    // </>

  )
}

export default LoginScreenRn

const Rnstyles = StyleSheet.create({
  contentMainContainer: {
    width: "100%",
    paddingHorizontal: width * 0.08,
    backgroundColor: "transparent",
    height: Platform.OS == "ios" ? height * 0.8 : height * 0.7
  },

  welcomeText: {
    color: "#000000",
    fontSize: RFValue(30, height),
    borderWidth: 1,
    borderColor: "transparent"
  },

  letSignText: {
    color: "#000",
    fontSize: RFValue(20, height),
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "transparent"
  },

  mobileNumberLabel: {
    color: "#5D5D5D",
    fontSize: RFValue(15, height),
    marginBottom: 8
  },

  errorMssgText: {
    color: "red",
    fontSize: RFValue(14, height),
  },

  mobileNumberTextContainer: {
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    flexDirection: "row",
    padding: 1,
    height: 50
  },

  countryCodeContainer: {
    marginRight: 2,
    borderColor: "#BFC4C1",
    borderRightWidth: 1,
    justifyContent: "center",
    width: "12%",
    alignItems: "center",
    height: height * 0.04,
    alignSelf: "center"
  },

  countryCodeText: {
    color: "#BFC4C1",
    fontSize: RFValue(15, height),
  },

  mobileTextInput: {
    width: "75%",
    color: "#000",
    fontSize: RFValue(14, height),
    paddingLeft: 5
  },

  mobileIcon: {
    height: width * 0.061,
    width: width * 0.1,
    alignSelf: "center"
  },

  whatsAppContainer: {
    width: "90%",
    marginVertical: 10,
    alignItems: "center",
    flexDirection: "row"
  },

  whatsAppIcon: {
    height: width * 0.05,
    width: width * 0.05,
    resizeMode: "contain"
  },

  whatsUpText: {
    color: "#000",
    fontSize: RFValue(13, height),
    marginLeft: 5
  },

  checkBoxContainer: {
    marginTop: 5,
    flexDirection: "row",
  },

  termsAndConditionsText: {
    width: "92%",
    color: "#000",
    fontSize: RFValue(14, height),
  },

  termsAndConditionText2: {
    textDecorationLine: "underline",
    color: "#DB710E",
    // lineHeight: 30,
    fontSize: RFValue(13, height),
  },

  checkBoxError: {
    color: "red",
    fontSize: RFValue(15, height),
    marginTop: 5
  },

  termsAndConditiosnMainContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.004,
    width: width * 0.05,
    marginRight: 5,
    height: width * 0.053,
    borderRadius: 5,
    borderWidth: 1.8,
  },

  checkIcon: {
    height: 10,
    width: 10,
    tintColor: "#fff",
    resizeMode: "contain"
  },

  requestOptBtnContainer: {
    borderRadius: 8,
    marginTop: 10,
    height: height * 0.06,
    alignItems: "center",
    justifyContent: "center",
  },

  requestOtpText: {
    fontSize: RFValue(16, height),
    color: "#fff",
  },

  verifyOtpTextContainer: {
    marginTop: 20
  },

  verifyTextSubContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  verifyOtpText: {
    fontSize: RFValue(18, height),
    color: "#000"
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center"
  },

  timerColor: {
    marginLeft: 5,
    fontSize: RFValue(14, height),
    color: "#000"
  },

  timerIcon: {
    height: width * 0.05,
    width: width * 0.04,
    resizeMode: "contain"
  },

  resendOtpContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center"
  },

  notYetReceivedText: {
    fontSize: RFValue(14, height),
    marginRight: 5,
    color: "#000"
  },

  resendText: {
    fontSize: RFValue(14, height),
    textDecorationLine: "underline"
  },

  verifyContainer: {
    borderRadius: 8,
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    height: height * 0.06,
  },

  verify: {
    color: "#fff",
    fontSize: RFValue(17, height),
    // lineHeight: 25
  },

  companyLogoMain: {
    height: 80,
    width: 150,
    alignSelf: "center",
    marginTop: height * 0.02
  }
})