import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { useDispatch, useSelector } from "react-redux";
import { StatusBar, TouchableWithoutFeedback, Dimensions, Image, Modal, Text as RnText, Platform, TouchableOpacity, View, StyleSheet, Linking, SafeAreaView } from "react-native";
import usePostRequestWithJwt from "../../api/usePostRequestWithJwt";
import { RFValue } from "react-native-responsive-fontsize";
import PreLoginCustomLoader from '../../components/PreLoginCustomLoader';
import { translate } from "../../Localization/Localisation";
import { CustomCommonModal } from '../../components/CustomCommonModal';
import { WebView } from 'react-native-webview';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from "../../hooks/useFontStyles";
import { responsiveWidth } from "react-native-responsive-dimensions";
import RenderHTML from "react-native-render-html";
import CustomButton from "../../components/CustomButton";
import { setCashBackSuccessGenuineModal } from "../../state/actions/cashBackSuccessGenuineModal";
import { SELF } from "../../assets/Utils/Utils";

const { height, width } = Dimensions.get("window")
var camDevice;

const GenuinityModal=({
  apiResponse,
  visible,
  onClose
})=> {
  const fonts = useFontStyles()
  const navigation = useNavigation();
  camDevice = useCameraDevice('back');
  const currentTheme = useSelector(state => state.theme.theme);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const isConnected = useSelector(state => state.network.isConnected);
  const [qrActivate, setQRActivate] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const { width, height } = Dimensions.get('window');
  const [productDetails, setProductDetails] = useState(apiResponse);
  const [modalOpen, setModalOpen] = useState(true)
  const [loaderApi, setLoaderApi] = useState(false)
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")
  const [productLeafLetModal, setProductLeafLetModal] = useState(false)
  const [fieldQRActive, setFieldQRActive] = useState(false)
  const [fieldQRPopup, setFieldQRPopup] = useState(false)
  const [bonusMessage, setBonusMessage] = useState("");
  const [congratulationsContent, setCongratulationsContent] = useState(false)
  const dispatch=useDispatch()

  const alertCloseHandle = () => {
    setAlertModal(false)
    setQRActivate(true);
  }

  const openYouTube = () => {
    const url = apiResponse?.testimonial;
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  console.log("apiResponse=--=>",apiResponse)


  const navigationHome = () => {
    // navigation.navigate("MainTabs")
    navigation.navigate("CashBackScan",{screenName:SELF});
    setQRActivate(true);

    // setModalOpen(false);
    dispatch(setCashBackSuccessGenuineModal(false))
  }

  const handleProductInfo = () => {
    if (isConnected) {
      // setModalOpen(false)
          dispatch(setCashBackSuccessGenuineModal(false))

      setProductLeafLetModal(true)
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))

    }
  }

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
      >
        <TouchableWithoutFeedback>
          <View style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 15
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
                  // setModalOpen(false);
                      dispatch(setCashBackSuccessGenuineModal(false))

                }}>
                  <Image source={require("../CashbackProgram/assets/ic_close_icon.png")} style={{
                    height: 15,
                    width: 15,
                    resizeMode: "contain",
                    tintColor: dynamicStyles.primaryColor,
                  }} />
                </TouchableOpacity>
              </View>


              <Image source={require('../CashbackProgram/assets/successIconMssg.png')} style={{
                height: 50,
                width: 50,
                resizeMode: "contain",
                alignSelf: "center",
                marginTop: 20
              }} />
              {apiResponse?.message &&
                <RnText style={[{ color: "#000", fontSize: RFValue(15, 680), fontFamily: fonts.SemiBold, textAlign: "center", marginVertical: 5 }]}>{apiResponse.message}</RnText>
              }
              {apiResponse?.RewardMessage &&
                <RnText style={{ fontSize: RFValue(13, 680), color: "#7A7A7A", fontFamily: fonts.Regular, textAlign: "center", marginVertical: 10 }}>{apiResponse.RewardMessage}</RnText>
              }


              <View style={{ alignSelf: "center", backgroundColor: "#F2F6F9", width: "85%", paddingVertical: 2, borderRadius: 10 }}>
                <View style={{ flexDirection: "row" }}>
                  {apiResponse?.cropName &&
                    <View style={{ width: "50%", borderRightWidth: 1, borderColor: "#E8E8E8", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Crop")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{apiResponse.cropName}</RnText>
                    </View>
                  }
                  {apiResponse?.manufactureDate &&
                    <View style={{ width: "50%", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Packaging_Date")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{apiResponse.manufactureDate}</RnText>
                    </View>
                  }
                </View>




                <View style={{ flexDirection: "row" }}>
                  {apiResponse?.productName &&
                    <View style={{ width: "50%", borderRightWidth: 1, borderColor: "#E8E8E8", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Variety")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{apiResponse?.productName}</RnText>
                    </View>
                  }
                  {apiResponse?.packSize &&
                    <View style={{ width: "50%", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Net_Quantity")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{apiResponse?.packSize + apiResponse?.packUnit}</RnText>
                    </View>
                  }


                </View>




                <View style={{ flexDirection: "row" }}>
                  {apiResponse?.lotNumber &&
                    <View style={{ width: "50%", borderRightWidth: 1, borderColor: "#E8E8E8", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("Lot_Number")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{apiResponse.lotNumber}</RnText>
                    </View>
                  }
                  {apiResponse?.mrp &&
                    <View style={{ width: "50%", paddingLeft: 15, paddingVertical: 10 }}>
                      <RnText style={{ fontSize: RFValue(11, 680), color: "#7A7A7A", fontFamily: fonts.Regular }}>{translate("MRP_Packet")}</RnText>
                      <RnText style={{ color: "#000", fontSize: RFValue(14, 680), fontFamily: fonts.SemiBold, marginTop: 5 }}>{apiResponse.mrp}</RnText>
                    </View>
                  }



                </View>
              </View>
              <View style={{ width: 60, height: 100, alignSelf: "center" }}>
                {apiResponse?.productImage &&
                  <Image
                    style={{ width: 60, height: 100, resizeMode: "contain", alignSelf: "center" }}
                    source={{ uri: apiResponse.productImage }}
                  />
                }
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center", marginVertical: 10 }}>
                {apiResponse?.testimonial &&
                  <TouchableOpacity onPress={openYouTube} style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                    <Image style={{ resizeMode: "contain", height: 10, width: 10, tintColor: dynamicStyles.primaryColor, marginRight: 5 }} source={require("../CashbackProgram/assets/navigationIcon.png")} />
                    <RnText style={{ color: dynamicStyles.primaryColor, fontSize: RFValue(15, height), fontFamily: fonts.SemiBold, textDecorationLine: "underline" }}>{translate("Product_Video")}</RnText>
                  </TouchableOpacity>
                }

                {apiResponse?.productLeaflet &&
                  <TouchableOpacity onPress={() => handleProductInfo()} style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image style={{ resizeMode: "contain", height: 10, width: 10, tintColor: dynamicStyles.primaryColor, marginRight: 5 }} source={require("../CashbackProgram/assets/navigationIcon.png")} />
                    <RnText style={{ color: dynamicStyles.primaryColor, fontSize: RFValue(15, height), fontFamily: fonts.SemiBold, textDecorationLine: "underline" }}>{translate("Product_Info")}</RnText>
                  </TouchableOpacity>
                }


              </View>
              <View style={{ width: "80%", flexDirection: "row", alignSelf: "center", marginTop: 10, justifyContent: "space-between" }}>
                <TouchableOpacity  onPress={navigationHome} style={{ borderRadius: 10, width: "48%", borderWidth: 1, borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.secondaryColor, height: 50, alignItems: "center", justifyContent: "center" }}>
                  <RnText style={{ fontSize: RFValue(12, 680), fontFamily: fonts.SemiBold, color: dynamicStyles.primaryColor }}>{apiResponse.buttonTitle1}</RnText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  setQRActivate(true);
                  // setModalOpen(false);
                      dispatch(setCashBackSuccessGenuineModal(false))

                  setFlashOn(false)
                }}  style={{ borderRadius: 10, width: "48%", borderWidth: 1, borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.primaryColor, height: 50, alignItems: "center", justifyContent: "center" }}>
                  <RnText style={{ fontSize: RFValue(12, 680), fontFamily: fonts.SemiBold, color: dynamicStyles.secondaryColor }}>{apiResponse.buttonTitle2}</RnText>
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
              <TouchableOpacity onPress={() => {
                //  setModalOpen(true), 
                dispatch(setCashBackSuccessGenuineModal(true)),
                setProductLeafLetModal(false) }} style={{ marginVertical: 10, alignSelf: "flex-end", marginRight: 10, height: 30, width: 30, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: dynamicStyles.primaryColor, borderRadius: 30 }}>
                <Image source={require("../CashbackProgram/assets/ic_close_icon.png")} style={{ resizeMode: "contain", height: 15, width: 15, tintColor: dynamicStyles.primaryColor }} />
              </TouchableOpacity>
              <WebView
                source={{ uri: apiResponse?.productLeaflet }}
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

export default GenuinityModal

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
