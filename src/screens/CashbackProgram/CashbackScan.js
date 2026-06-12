import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, {useState } from "react";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { useDispatch, useSelector } from "react-redux";
import { StatusBar, Dimensions, Image, Text as RnText, Platform, TouchableOpacity, View, StyleSheet } from "react-native";
import { RNHoleView } from "react-native-hole-view";
import { getWindowHeight, getWindowWidth } from "../../components/Upgrade/helpers";
import usePostRequestWithJwt from "../../api/usePostRequestWithJwt";
import APIConfig, { HTTP_601, HTTP_OK } from "../../api/APIConfig";
import { GetApiHeaders } from "../../utils/helpers";
import { deleteFromAsyncStorage, getFromAsyncStorage} from "../../utils/keychainUtils";
import { RFValue } from "react-native-responsive-fontsize";
import PreLoginCustomLoader from '../../components/PreLoginCustomLoader';
import { translate } from "../../Localization/Localisation";
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from "../../hooks/useFontStyles";
import { CASHBACKSCAN, CASHBACKSCAN2, DOWNLOAD_FOLDER_PATH } from "../../assets/Utils/Utils";
import { setCashBackSuccessModal } from "../../state/actions/cashBackSuccessModal";
import { setCashBackSuccessGenuineModal } from "../../state/actions/cashBackSuccessGenuineModal";
import { SafeAreaView } from "react-native-safe-area-context";

import { MOBILENUMBER, REFERRALCODE, USER_ID, USERNAME, USER_IMG, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, LANGUAGEID, OFFLINETOTALCOUNT, FIRSTNAME, LASTNAME, COMPANYCODE, ROLDID, SCREENNAME, EMP_DASHBOARD_SCREEN } from '../../utils';
import { setCompanyStyle } from "../../state/actions/companyStyles";
import realm from "../realmOffline/realmConfig";
import RNFS from 'react-native-fs';
import axios from 'axios';


const { height, width } = Dimensions.get("window")
var camDevice;

const CashBackScan=({ route })=> {
  const fonts = useFontStyles()
  const navigation = useNavigation();
  camDevice = useCameraDevice('back'); 
  const currentTheme = useSelector(state => state.theme.theme);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const isConnected = useSelector(state => state.network.isConnected);
  const [qrActivate, setQRActivate] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const { width, height } = Dimensions.get('window');
  const { error: apiError, sendData } = usePostRequestWithJwt();
  const [loaderApi, setLoaderApi] = useState(false)
  const dispatch=useDispatch()

  const cachedImages = realm.objects('Image');
  const Meeting = realm.objects('Meeting');
  const FABDetails = realm.objects('FABDetails')
  const helpDeskRaise = realm.objects('helpDeskRaise')
  const YieldMaster = realm.objects('YieldMaster');
  const SeedMaster = realm.objects('SeedMaster');
  const FertilizerMaster = realm.objects('FertilizerMaster');
  const FertilizerMaster2 = realm.objects('FertilizerMaster2')
  const SeedCalSubmit = realm.objects('SeedCalSubmit')
  const YieldCalSubmit = realm.objects('YieldCalSubmit')
  const cachedHybridList = realm.objects('hybridMaster');
  const cachedKnowledgeCenter = realm.objects('KnowledgeCenter');
  const GeoTaggingView = realm.objects('GeoTaggingView');
  const cachedGeoTaggingHistory = realm.objects('GEOTAGGINGHISTORY');
  const cachedSamadhanHistory = realm.objects('SAMADHANHISTORY');
  const cachedGoldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')
  const goldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')
  const locationCheck = useSelector(state => state.selectLocationReducer?.locationStyles)
  console.log("locationCheck-=-=>",locationCheck)

  const qrUrl = APIConfig.BASE_URL + APIConfig.GENUINITYCHECKFORPRODUCTIONAUTHENTICATIONANDCASHBACK

  const qrData = async (qrData) => {
    const headers = await GetApiHeaders();
    headers.authType=""
    const payload = {
      farmerMobileNumber: headers.mobileNumber,
      qrCodeData: qrData,
      farmerId: headers.userId,
      deviceType: headers.deviceType,
      type: "mobile",
      geoLocations: locationCheck,
      authType: route?.params?.type ? route?.params?.type : "",
      fellowFarmerName: route?.params?.fellowFarmerName ? route?.params?.fellowFarmerName : "",
      fellowFarmerMobileNumber: route?.params?.fellowFarmerMobileNumber ? route?.params?.fellowFarmerMobileNumber : "",
      screenName:route?.params?.screenName
    };
    console.log("HEADER=-=-=->",JSON.stringify(headers))
    console.log("PAYLOAD=-=-=->", JSON.stringify(payload))
    await fetchData(headers, payload);
  };


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
          realm.delete(cachedGoldClubKnowledgeCenter)
        });
        console.log("Successfully deleted all Realm data");
      }
    } catch (realmError) {
      console.error('Error deleting objects from Realm:', realmError);
    }
  };

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

  const logoutMethod = async () => {
    if (!isConnected) {
      setLoaderApi(false)
      return;
    }

    try {
      setLoaderApi(true);
      const ForcedLougoutUrl = APIConfig.BASE_URL + APIConfig.AUTH.LOGOUT
      const headers = await GetApiHeaders();
      const apiCallLogout = await axios.get(ForcedLougoutUrl, { headers });
      // Full response
      console.log("Full Response:", apiCallLogout);
      // Access response data
      console.log("Response Data:", apiCallLogout.data);

      // Example: access specific field

      if (apiCallLogout.data.statusCode === HTTP_OK) {
        console.log("Message:", apiCallLogout.data.statusCode);

        await Promise.all([
          deleteFromAsyncStorage(USER_ID),
          deleteFromAsyncStorage(MOBILENUMBER),
          deleteFromAsyncStorage(USERNAME),
          deleteFromAsyncStorage(REFERRALCODE),
          deleteFromAsyncStorage(USER_IMG),
          deleteFromAsyncStorage(STATE_ID),
          deleteFromAsyncStorage(STATE_NAME),
          deleteFromAsyncStorage(DISTRICT_ID),
          deleteFromAsyncStorage(DISTRICT_NAME),
          deleteFromAsyncStorage(FIRSTNAME),
          deleteFromAsyncStorage(LASTNAME),
          deleteFromAsyncStorage(OFFLINETOTALCOUNT),
          deleteFromAsyncStorage(COMPANYCODE),
          removeDatbaseData(),
          clearDownloadedImages()
        ]);
        dispatch(setCompanyStyle({}));
        navigation.replace('LoginScreenRn');
        setLoaderApi(false)
      } else {
        setLoaderApi(false)
        SimpleToast.show(apiCallLogout.data.message)
      }

    } catch (error) {
      setLoaderApi(false)

      console.log("Logout error:", error.response?.data || error.message);
    }
  };

  const handleForceLogout = async () => {
    try {
      logoutMethod()
    } catch (error) {
      console.error('Error during logout:', error);
      SimpleToast.show(translate('logout_error') || 'Failed to log out');
    }
  }

  const fetchData = async (headers, payload) => {
    setLoaderApi(true)
    if (isConnected) {
      try {
        const response = await sendData(qrUrl, payload, headers, false);
        console.log("Data response:",response?.data);
        if (response?.data?.statusCode === HTTP_OK) {
          setLoaderApi(false)
          handlingModal(response?.data?.response)
          setFlashOn(false)
          if(!response?.data?.response){
            SimpleToast.show(response?.data?.message?response?.data?.message:translate("Something_went_wrong"))
          }
        } else if (response?.data?.statusCode === HTTP_601) {
          handleForceLogout()
          return
        }
        else{
          setLoaderApi(false)
          handlingModal2("",response?.data?.statusCode,response?.data?.message)
        }
      } catch (error) {
        SimpleToast.show(translate("Unable_to_process_your_request_moment_Please_again_later"))
        setLoaderApi(false)
      }
    } else {
      setLoaderApi(false)
      setQRActivate(true)
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  };

  const onSuccess = async (response) => {
    console.log("qrChecking=-=--=>",response)
    setQRActivate(false);
    const scannedCode = response; // This will be the QR code value
      qrData(scannedCode); // Pass the scanned QR code to the API call
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        if (codes[0].value) {
          setLoaderApi(true)
          setQRActivate(false);
          setTimeout(() => onSuccess(codes[0]?.value), 500);
        }
      }
      return;
    },
  });

  const switchFalsh = () => {
    setFlashOn(!flashOn)
  }

  const onError = (error) => {

  };

  const backBtnHandle = () => {
    navigation.goBack()
  }

  const handlingModal=async(response)=>{
    const screenName = await getFromAsyncStorage(SCREENNAME);
    const isEmployee = (screenName == EMP_DASHBOARD_SCREEN);
    const {cashbackWindow,genuinityWindow}=response
    if(genuinityWindow){
      if (isEmployee) {
        navigation.navigate('BottomTabsNavigatorEmp', {
          screen: 'HomeScreenEmpSDK',
          params: {
            response: response,
            title: CASHBACKSCAN
          }
        });

      } 
   
    dispatch(setCashBackSuccessModal(false))
    dispatch(setCashBackSuccessGenuineModal(true))
    }else if(cashbackWindow){
      if (isEmployee) {
        navigation.navigate('BottomTabsNavigatorEmp', {
          screen: 'HomeScreenEmpSDK',
          params: {
            response: response,
            title: CASHBACKSCAN
          }
        });
      } 
      dispatch(setCashBackSuccessGenuineModal(false))
      dispatch(setCashBackSuccessModal(true))
    }

  }

  const handlingModal2 = async (response, statusCode, mssg) => {
    const screenName = await getFromAsyncStorage(SCREENNAME);
    const isEmployee = (screenName == EMP_DASHBOARD_SCREEN);
    if (isEmployee) {
      navigation.navigate('BottomTabsNavigatorEmp', {
        screen: 'HomeScreenEmpSDK',
        params: {
          response: "",
          title: CASHBACKSCAN2,
          statuCode: statusCode,
          message: mssg
        }
      })
    } 
  }

  return (
    <>

      <View style={RnStyles.mainContainer}>
        {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}
        <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
          <View style={{ backgroundColor: dynamicStyles.primaryColor, width: "100%", height: height * 0.05}}>
            <Image source={require('../CashbackProgram/assets/flowerIcon.png')} style={RnStyles.flowerImg} />
            <View style={{
              // paddingTop: 20,
              paddingHorizontal: 20,
              height: 80
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <TouchableOpacity onPress={backBtnHandle}>
                  <Image style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.07, width: width * 0.15, resizeMode: "contain" }} source={require('../CashbackProgram/assets/BackIcon.png')} />
                </TouchableOpacity>
                <RnText style={{
                  color: dynamicStyles.secondaryColor,
                  fontSize: RFValue(16, height),
                  fontFamily: fonts.SemiBold,
                  alignSelf: "center",
                  lineHeight: 30
                }}>
                  {translate('scan')}
                </RnText>
                <TouchableOpacity onPress={() => { switchFalsh() }}>
                  <Image source={flashOn ? require('../CashbackProgram/assets/FlashIcon.png') : require('../CashbackProgram/assets/ic_flash.png')} style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.05, width: 40, resizeMode: "contain" }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
        <View style={[{ marginTop: Platform.OS === 'ios' ? 0 : 0, alignItems: 'center', backgroundColor: '#fff' }]}>
          {qrActivate &&
            <View style={[{ backgroundColor: 'transparent', height: Dimensions.get('window').height * 2, width: Platform.OS === 'ios' ? Dimensions.get('window').width / 1 : Dimensions.get('window').width / 0.9, alignItems: 'center' }]}>
              {
                camDevice != null && (
                  <View style={[{ height: Dimensions.get('window').height * 2, width: Dimensions.get('window').width, overflow: 'hidden', alignSelf: 'center', backgroundColor: 'black' }]}>
                    <Camera
                      torch={flashOn ? 'on' : 'off'}
                      device={camDevice}
                      style={[{ height: Dimensions.get('window').height, width: Dimensions.get('window').width, position: 'absolute' }]}
                      photo={false}
                      enableZoomGesture
                      onError={onError}
                      codeScanner={codeScanner}
                      isActive={qrActivate} />
                    <RNHoleView
                      holes={[
                        {
                          x: getWindowWidth() * 0.2,
                          y: getWindowHeight() * 0.25,
                          width: getWindowWidth() * 0.6,
                          height: getWindowHeight() * 0.3,
                          borderRadius: 10,
                        },
                      ]}
                      style={[{
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        position: 'absolute',
                        width: '100%',
                        height: '66.7%',
                        flex: 1,
                        zIndex: 100,
                      }]}
                    />
                    <SafeAreaView   edges={["bottom"]}>
                      <View style={[{ flexDirection: "row", backgroundColor: dynamicStyles.primaryColor, width: '100%', padding: 10, borderRadius: 5, position: 'absolute', bottom: 0, 
                        top: Platform.OS === 'android' ? Dimensions.get('window').height / 1.4 : Dimensions.get('window').height / 1.35, 
                        alignSelf: 'center', height: Platform.OS === 'ios' ? 130 : 100, }]}>
                        <View style={[{ width: '80%' }]}>
                          <RnText style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(15, height), fontFamily: fonts.Regular }}>
                            {translate('please_make_qr_code_infocus')}
                          </RnText>
                          <Image style={{ height: 15, width: 15, tintColor: dynamicStyles.secondaryColor }} source={require('../CashbackProgram/assets/ic_warning.png')} />
                        </View>
                        <Image style={{ height: 45, width: 45, resizeMode: "contain" }} source={require('../CashbackProgram/assets/ic_qr.png')} />
                      </View>
                    </SafeAreaView>
                  </View>
                )
              }
            </View>
          }
        </View>
      </View>
      {loaderApi && <PreLoginCustomLoader />}
    </>
  )
}

export default CashBackScan

const RnStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)"
  },
  flowerImg: {
    position: "absolute",
    bottom: height * 0.001,
    right: width * 0.05,
    height: 50,
    width: 100,
    tintColor: "#000",
    resizeMode: "contain"
  },

})
