import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { useSelector } from "react-redux";
import { StatusBar, TouchableWithoutFeedback, Dimensions, Image, Modal, Text as RnText, Platform, TouchableOpacity, View, StyleSheet, Linking, SafeAreaView } from "react-native";
import { RNHoleView } from "react-native-hole-view";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import APIConfig, { HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK } from "../api/APIConfig";
import { GetApiHeaders } from "../utils/helpers";
import { getFromAsyncStorage, getUserLocation } from "../utils/keychainUtils";
import { RFValue } from "react-native-responsive-fontsize";
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { translate } from "../Localization/Localisation";
import { CustomCommonModal } from '../components/CustomCommonModal';
import { WebView } from 'react-native-webview';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from "../hooks/useFontStyles";
import { FIELDACTIVITYQR, getWindowHeight, getWindowWidth } from "../assets/Utils/Utils";
import { responsiveWidth } from "react-native-responsive-dimensions";
import RenderHTML from "react-native-render-html";
import CustomButton from "../components/CustomButton";
import axios from "axios";
import { EMP_DASHBOARD_SCREEN, ROLDID, SCREENNAME } from "../utils";



const { height, width } = Dimensions.get("window")
var camDevice;

function QRScannerRn({ route }) {
  console.log("called=-=-=-productscan")
  const fonts = useFontStyles()
  console.log("route====>", JSON.stringify(route))
  const navigation = useNavigation();
  camDevice = useCameraDevice('back');
  const currentTheme = useSelector(state => state.theme.theme);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const isConnected = useSelector(state => state.network.isConnected);
  const [qrActivate, setQRActivate] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const { width, height } = Dimensions.get('window');
  const { error: apiError, postStatusCode, sendData } = usePostRequestWithJwt();
  const [productDetails, setProductDetails] = useState({});
  const [modalOpen, setModalOpen] = useState(false)
  const [loaderApi, setLoaderApi] = useState(false)
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")
  const [productLeafLetModal, setProductLeafLetModal] = useState(false)
  const [fieldQRActive, setFieldQRActive] = useState(false)
  const [fieldQRPopup, setFieldQRPopup] = useState(false)
  const [bonusMessage, setBonusMessage] = useState("");
  const [congratulationsContent, setCongratulationsContent] = useState(false)
  const locationCheck = useSelector(state => state.selectLocationReducer?.locationStyles)


  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.type === FIELDACTIVITYQR) {
        setFieldQRActive(true);
      }
    }, [route?.params?.type])
  );

  const validateCoupon = async (coupon) => {
    const regex = /^https:\/\/nslbeejtantra\.com\/Authentication\/dg_activity\?activity_code=[A-Z0-9]{10,}$/;
    return regex.test(coupon);
  };



  const qrUrl = APIConfig.BASE_URL + APIConfig.NEWGENUNITYURL
  console.log("saoasiaoia=-=-=->", qrUrl)

  const alertCloseHandle = () => {
    setAlertModal(false)
    setQRActivate(true);
  }

  const qrData = async (qrData) => {
    const headers = await GetApiHeaders();
    const payload = {
      farmerMobileNumber: headers.mobileNumber, // Example farmer mobile number
      qrCodeData: qrData, // Empty initially, will be filled with scanned code
      farmerId: headers.userId, // Example farmer ID
      deviceType: headers.deviceType, // Assuming the app is running on Android
      type: "mobile", // Can be set based on your needs
      geoLocations: locationCheck, // Can be set with actual geo-location data
      // geoLocations: "", // Can be set with actual geo-location data
      authType: route?.params?.type ? route?.params?.type : "",
      fellowFarmerName: route?.params?.fellowFarmerName ? route?.params?.fellowFarmerName : "",
      fellowFarmerMobileNumber: route?.params?.fellowFarmerMobileNumber ? route?.params?.fellowFarmerMobileNumber : ""
    };

    console.log("check1=-=-=>", headers)
    console.log("check2=-=-=>", payload)

    // console.log(" payload", payload);
    await fetchData(qrUrl, headers, payload);
  };


  const fetchData = async (url, headers, payload) => {
    setLoaderApi(true)
    if (isConnected) {
      try {
        const response = await sendData(qrUrl, payload, headers, false);
        //   const responseobj=JSON.parse(response)
        console.log(" Data response:", response.data.statusCode);
        if (response?.statusCode === HTTP_OK) {
          setLoaderApi(false)

          const rawData = response?.data;
          const qrResult = rawData?.response;
          console.log("checkinssg=-=->", headers, qrResult)
          // const qrResult = rawData?.response ? JSON.parse(await decodeJwt(rawData.response)) : null;
          console.log("QR Data Response:", rawData, qrResult);

          if (qrResult?.isGenuine) {
            setProductDetails(qrResult);
            setModalOpen(true)
            setFlashOn(false)
          } else {
            setAlertModal(true)
            setAlertTextContent(response.data.message)
            console.log("Called=-=-")
          }
        }
        else if (response?.statusCode === 201) {
          // QR code already scanned
          setLoaderApi(false)
          setAlertModal(true)
          setAlertTextContent(response.message || translate("This_QR_code_has_already_been_scanned"))
        } else if (response.data.statusCode === "202") {
          setLoaderApi(false)
          console.log("response.message=-=->", response)
          setAlertModal(true)
          setAlertTextContent(response.message)
        }

        else {
          setLoaderApi(false)
          setAlertModal(true)
          setAlertTextContent(response.message || translate("Unable_to_process_the_QR_code"))
        }
      } catch (error) {
        setLoaderApi(false)
        setAlertModal(true)
        setAlertTextContent(translate("An_unexpected_error_occurred_Please_try_again"))
      }
    } else {
      setLoaderApi(false)
      setQRActivate(true)

      SimpleToast.show(translate('no_internet_conneccted'))
    }
  };

  const openYouTube = () => {
    const url = productDetails?.testimonial;
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const fieldQRAcitivityQR = async (qrData) => {
    const headers = await GetApiHeaders();
    const latlong = await getUserLocation();
    var url = APIConfig.BASE_URL + APIConfig.FIELDACTIVITYQRURL;
    const payload = {
      tfaQrCode: qrData.split('=')[1],
      type: "MNA",
      geoLocations: latlong?.latitude + "," + latlong?.longitude
    };
    console.log("check1=-=-=>", headers)
    console.log("check2=-=-=>", payload)
    const response = await axios.post(url, payload, { headers });
    console.log("FIELDACTIVITYQRURL====>", JSON.stringify(response))
    if (response.data.statusCode === HTTP_OK) {
      setFieldQRPopup(true)
      setBonusMessage(response?.data?.response?.message)
      setCongratulationsContent(true);
      setLoaderApi(false)
      setAlertModal(false)
    }
    else if (response?.data?.statusCode === HTTP_CREATED) {
      // QR code already scanned
      setLoaderApi(false)
      setAlertModal(true)
      setAlertTextContent(response?.data?.message || translate("This_QR_code_has_already_been_scanned"))
    } else if (response.data.statusCode === HTTP_ACCEPTED) {
      setLoaderApi(false)
      setAlertModal(true)
      setAlertTextContent(response?.data?.message)
    }
  };

  const onSuccess = async (response) => {
    setQRActivate(false);
    const scannedCode = response; // This will be the QR code value

    if (fieldQRActive) {
      const isValidCoupon = await validateCoupon(scannedCode);
      if (isValidCoupon) {
        // here need to call api call 
        await fieldQRAcitivityQR(response)
      } else {
        setQRActivate(true);
        setLoaderApi(false)
        if (Platform.OS === 'android') {
          SimpleToast.show(translate('Invalid_QR_Code'))

        } else {
          setTimeout(() => {
            SimpleToast.show(translate('Invalid_QR_Code'))
          }, 200);
        }
      }
    }
    else {
      qrData(scannedCode); // Pass the scanned QR code to the API call
    }
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
    console.log("erorChecking=-=-=->", error)
    setAlertModal(true)
    setAlertTextContent(error.message)
  };

  const navigationHome = async () => {
    const screenName = await getFromAsyncStorage(SCREENNAME)
    screenName == EMP_DASHBOARD_SCREEN ? navigation.navigate('BottomTabsNavigatorEmp') : navigation.navigate('MainTabs');
    // navigation.navigate("MainTabs")
    setQRActivate(true);
    setModalOpen(false);
  }

  const handleProductInfo = () => {
    if (isConnected) {
      setModalOpen(false)
      setProductLeafLetModal(true)
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))

    }
  }
  const backBtnHandle = () => {
    navigation.goBack()
  }

  return (
    <>

      <View style={RnStyles.mainContainer}>
        {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}
        <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
          <View style={{ backgroundColor: dynamicStyles.primaryColor, width: "100%", height: height * 0.08 }}>
            <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />


            {/* <HStack> */}
            <View style={{
              paddingTop: 20,
              paddingHorizontal: 20,
              height: 80
            }}>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <TouchableOpacity onPress={backBtnHandle}>
                  <Image style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.07, width: width * 0.15, resizeMode: "contain" }} source={require('../../assets/Images/BackIcon.png')} />
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
                  <Image source={flashOn ? require('../../assets/Images/FlashIcon.png') : require('../../assets/Images/ic_flash.png')} style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.05, width: 40, resizeMode: "contain" }} />
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
                    {/* redText....................... */}
                    <SafeAreaView>
                      <View style={[{ flexDirection: "row", backgroundColor: dynamicStyles.primaryColor, width: '100%', padding: 10, borderRadius: 5, position: 'absolute', bottom: 0, top: Platform.OS === 'android' ? Dimensions.get('window').height / 1.3 : Dimensions.get('window').height / 1.35, alignSelf: 'center', height: Platform.OS === 'ios' ? 130 : 100, }]}>
                        {/* <HStack style={[]}> */}
                        <View style={[{ width: '80%' }]}>
                          <RnText style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(15, height), fontFamily: fonts.Regular }}>
                            {translate('please_make_qr_code_infocus')}
                          </RnText>
                          <Image style={{ height: 15, width: 15, tintColor: dynamicStyles.secondaryColor }} source={require('../../assets/Images/ic_warning.png')} />
                        </View>
                        <Image style={{ height: 45, width: 45, resizeMode: "contain" }} source={require('../../assets/Images/ic_qr.png')} />
                        {/* </HStack> */}
                      </View>
                    </SafeAreaView>
                  </View>
                )
              }
            </View>
          }
        </View>
      </View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalOpen}
      >
        <TouchableWithoutFeedback>
          <View style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <View style={{
              backgroundColor: "#fff",
              // padding: 10,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              width: "100%",
              minHeight: "60%",
              borderRadius: 10,
              paddingBottom: 10,
              paddingHorizontal: 10
            }}>
              <View style={{ paddingRight: 15, paddingTop: 15 }}>
                <TouchableOpacity style={{ alignSelf: "flex-end", height: 30, width: 30, borderRadius: 30, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: dynamicStyles.primaryColor }} onPress={() => {
                  setQRActivate(true);
                  setModalOpen(false);
                }}>
                  <Image source={require("../../assets/Images/crossIcon.png")} style={{
                    height: 15,
                    width: 15,
                    resizeMode: "contain",
                    tintColor: dynamicStyles.primaryColor,
                  }} />
                </TouchableOpacity>
              </View>


              <Image source={require('../../assets/Images/successIconMssg.png')} style={{
                height: 50,
                width: 50,
                resizeMode: "contain",
                alignSelf: "center",
                marginTop: 20
              }} />
              {productDetails?.message &&
                <RnText style={[{ color: "#000", fontSize: RFValue(15, 680), fontFamily: fonts.SemiBold, textAlign: "center", marginVertical: 5 }]}>{productDetails.message}</RnText>
              }
              {productDetails?.RewardMessage &&
                <RnText style={{ fontSize: RFValue(13, 680), color: "#7A7A7A", fontFamily: fonts.Regular, textAlign: "center", marginVertical: 10 }}>{productDetails.RewardMessage}</RnText>
              }


              <View style={{ alignSelf: "center", backgroundColor: "#F2F6F9", width: "85%", paddingVertical: 2, borderRadius: 10 }}>
                <View style={{ flexDirection: "row" }}>
                  {productDetails?.cropName &&
                    <View style={{ width: "50%", borderRightWidth: 1, borderColor: "#E8E8E8", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Crop")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{productDetails.cropName}</RnText>
                    </View>
                  }
                  {productDetails?.manufactureDate &&
                    <View style={{ width: "50%", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Packaging_Date")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{productDetails.manufactureDate}</RnText>
                    </View>
                  }
                </View>




                <View style={{ flexDirection: "row" }}>
                  {productDetails?.productName &&
                    <View style={{ width: "50%", borderRightWidth: 1, borderColor: "#E8E8E8", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Variety")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{productDetails?.productName}</RnText>
                    </View>
                  }
                  {productDetails?.packSize &&
                    <View style={{ width: "50%", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Net_Quantity")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{productDetails?.packSize + productDetails?.packUnit}</RnText>
                    </View>
                  }


                </View>




                <View style={{ flexDirection: "row" }}>
                  {productDetails?.lotNumber &&
                    <View style={{ width: "50%", borderRightWidth: 1, borderColor: "#E8E8E8", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Lot_Number")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{productDetails.lotNumber}</RnText>
                    </View>
                  }
                  {productDetails?.mrp &&
                    <View style={{ width: "50%", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("MRP_Packet")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{productDetails.mrp}</RnText>
                    </View>
                  }



                </View>
              </View>
              <View style={{ width: 60, height: 100, alignSelf: "center" }}>
                {productDetails?.productImage &&
                  <Image
                    style={{ width: 60, height: 100, resizeMode: "contain", alignSelf: "center" }}
                    source={{ uri: productDetails.productImage }}
                  />
                }
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center", marginVertical: 10 }}>
                {productDetails?.testimonial &&
                  <TouchableOpacity onPress={openYouTube} style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                    <Image style={{ resizeMode: "contain", height: 10, width: 10, tintColor: dynamicStyles.primaryColor, marginRight: 5 }} source={require("../../assets/Images/navigationIcon.png")} />
                    <RnText style={{ color: dynamicStyles.primaryColor, fontSize: RFValue(15, height), fontFamily: fonts.SemiBold, textDecorationLine: "underline" }}>{translate("Product_Video")}</RnText>
                  </TouchableOpacity>
                }

                {productDetails?.productLeaflet &&
                  <TouchableOpacity onPress={() => handleProductInfo()} style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image style={{ resizeMode: "contain", height: 10, width: 10, tintColor: dynamicStyles.primaryColor, marginRight: 5 }} source={require("../../assets/Images/navigationIcon.png")} />
                    <RnText style={{ color: dynamicStyles.primaryColor, fontSize: RFValue(15, height), fontFamily: fonts.SemiBold, textDecorationLine: "underline" }}>{translate("Product_Info")}</RnText>
                  </TouchableOpacity>
                }


              </View>
              <View style={{ width: "80%", flexDirection: "row", alignSelf: "center", marginTop: 10, justifyContent: "space-between" }}>
                <TouchableOpacity onPress={() => {
                  setQRActivate(true);
                  setModalOpen(false);
                  setFlashOn(false)
                }} style={{ borderRadius: 10, width: "48%", borderWidth: 1, borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.secondaryColor, height: 50, alignItems: "center", justifyContent: "center" }}>
                  <RnText style={{ fontSize: RFValue(12, 680), fontFamily: fonts.SemiBold, color: dynamicStyles.primaryColor }}>{productDetails.buttonTitle1}</RnText>
                </TouchableOpacity>

                <TouchableOpacity onPress={navigationHome} style={{ borderRadius: 10, width: "48%", borderWidth: 1, borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.primaryColor, height: 50, alignItems: "center", justifyContent: "center" }}>
                  <RnText style={{ fontSize: RFValue(12, 680), fontFamily: fonts.SemiBold, color: dynamicStyles.secondaryColor }}>{productDetails.buttonTitle2}</RnText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={productLeafLetModal}
      >
        <TouchableWithoutFeedback>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              flex: 1,
              width: "100%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <View
              style={{
                backgroundColor: "#000",
                // padding:13,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                borderRadius: 5,
                width: "90%",
                height: "70%",
                // paddingHorizontal: 12,
                // paddingBottom: 10
              }}
            >
              <TouchableOpacity onPress={() => { setModalOpen(true), setProductLeafLetModal(false) }} style={{ marginVertical: 10, alignSelf: "flex-end", marginRight: 10, height: 30, width: 30, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: dynamicStyles.primaryColor, borderRadius: 30 }}>
                <Image source={require("../../assets/Images/crossIcon.png")} style={{ resizeMode: "contain", height: 15, width: 15, tintColor: dynamicStyles.primaryColor }} />
              </TouchableOpacity>
              <WebView
                source={{ uri: productDetails?.productLeaflet }}
                style={[{ height: '100%', width: '100%', alignSelf: "center" }]}
                containerStyle={[{ width: '100%', height: '100%' }]}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(event) => {
                  console.log("event", event.nativeEvent.data)
                  if (event.nativeEvent.data == "Accepted") {
                    approveTermsButtonClick()
                  }
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal animationType='fade'
        transparent={true}
        visible={fieldQRPopup}
      >
        {congratulationsContent &&
          <View style={RnStyles.centeredView}>
            <View style={RnStyles.modalView}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                width: "100%",
              }}>
                <RenderHTML source={{ html: bonusMessage }}
                  enableCSSInlineProcessing={true} />
              </View>
              <CustomButton
                title={translate('ok')}
                onPress={async () => {
                  setFieldQRPopup(false)
                  setFieldQRActive(false)
                  navigation.goBack()
                }}
                buttonBg={dynamicStyles.primaryColor}
                btnWidth={'100%'}
                titleTextColor={dynamicStyles.secondaryColor}
                textAlign={'center'}
                isBoldText={true}
              />
            </View>
          </View>
        }
      </Modal>

      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}

      />
      {loaderApi && <PreLoginCustomLoader />}

    </>
  )

}

export default QRScannerRn

const RnStyles = StyleSheet.create({
  booksSeedsMainContainer: {
    backgroundColor: "#F2F6F9",
    flex: 1,
    width: "100%"
  },
  headerMainContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    height: 80
  },
  headerContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  backArrowImg: {
    height: 40,
    width: 40,
    resizeMode: "contain"
  },
  bookSeedsText: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 20
  },
  timerImg: {
    height: 30,
    width: 30,
    resizeMode: "contain"
  },
  flowerImg: {
    position: "absolute",
    top: 30,
    right: 40,
    height: 50,
    width: 100,
    tintColor: "#000",
    resizeMode: "contain"
  },
  contentMainContainer: {
    padding: 20
  },
  textFieldsMainContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    paddingBottom: 20
  },
  labelText: {
    color: "#5D5D5D",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18
  },
  textInputContainer: {
    borderColor: "#D6D6D6",
    backgroundColor: "#FBFBFB",
    borderWidth: 1,
    height: 55,
    marginTop: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10
  },
  selectCropTextInput: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 16,
    width: "90%",
    paddingLeft: 10
  },
  dropDownIcon: {
    height: 20,
    width: 20,
    tintColor: "#000",
    resizeMode: "contain"
  },
  bookNowButtonContainer: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  bookNowButtonText: {
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20
  },
  modalMainContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  modalSubContainer: {
    backgroundColor: "#fff",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 5,
    width: "100%",
  },

  crossIconContainer: {
    alignItems: "flex-end"
  },

  crossIcon: {
    height: 15,
    width: 15,
    resizeMode: "contain"
  },

  successIcon: {
    height: 60,
    width: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 20
  },

  textContainer: {
    alignItems: "center"
  },

  successText: {
    marginVertical: 10,
    color: "#000",
    fontWeight: "500",
    fontSize: 14
  },

  successMainContainerText: {
    marginBottom: 10,
    alignItems: "center"
  },

  successSubText: {
    color: "#7A7A7A",
    fontWeight: "500",
    fontSize: 13
  },

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

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#000000d6"
  },
  modalView: {
    width: responsiveWidth(85),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
})
