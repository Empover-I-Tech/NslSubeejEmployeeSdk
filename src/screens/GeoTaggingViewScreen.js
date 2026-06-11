import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ImageBackground,
  PermissionsAndroid,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Styles } from "../styles/Styles";
import { translate } from "../Localization/Localisation";
import { GetApiHeaders } from "../utils/helpers";
import APIConfig, { HTTP_OK } from "../api/APIConfig";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import useGetRequestWithJwt from "../api/useGetRequestWithJwt";
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import moment from "moment";
import { getFormattedDateTime } from '../assets/Utils/Utils'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from "react-native-responsive-fontsize";
import MapScreen from "../components/MapScreen";
import RenderHTML from 'react-native-render-html';
import axios from 'axios';
import SimpleToast from "react-native-simple-toast"
import realm from "./realmOffline/realmConfig";
import { useGeoTaggingCRUD } from "./realmOffline/useGeoTaggingCRUD";
import Geolocation from "react-native-geolocation-service";
import { CustomCommonModal } from "../components/CustomCommonModal";
import { useOfflineSync } from "../utils/syncUtils";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import { useFontStyles } from "../hooks/useFontStyles";
import { request, openSettings, PERMISSIONS, RESULTS } from "react-native-permissions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { width, height } = Dimensions.get('window');

const GeoTaggingViewScreen = ({ route }) => {
  console.log("routes=-=->", route?.params?.geoLocationType)
  const fonts = useFontStyles()
  const { updateOfflineCount } = useOfflineSync();
  const {
    getAllGeoTags,
    deleteGeoTagByUniquId,
    saveOrUpdateGeoTagById
  } = useGeoTaggingCRUD();


  const currentTheme = useSelector((state) => state.theme.theme);
  const isConnected = useSelector((state) => state.network.isConnected);
  const navigation = useNavigation()
  const dynamicStyles = useSelector(
    (state) => state.companyStyles.companyStyles
  );
  const styles = Styles(currentTheme);
  const [showOptions, setShowOptions] = useState(false);
  const { postData, loading, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
  const { fetchData } = useGetRequestWithJwt();
  const [geoTaggingData, setGeoTaggingData] = useState(null);
  const [feedbackLists, setFeedbackLists] = useState([]);
  const [selectedValue, setSelectedValue] = useState(route?.params?.myFeedBack || translate("Select_Feedback"));
  const [loader, setLoader] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cropName, setCropName] = useState(route?.params?.cropName || "")
  const [hybridName, setHybridName] = useState(route?.params?.hybridName || "")
  const [receivedDate, setReceiveDate] = useState(route?.params?.date || "")
  const [productLabel, setProductLabel] = useState(route?.params?.productLabel || "")
  const [geoLocation, setGeoLocation] = useState(route?.params?.geoLocation || "");
  const [totalPackets, setTotalPackets] = useState(route?.params?.totalSamplePackets ? route?.params?.totalSamplePackets.toString() : "");
  const [yieldValue, setYieldValue] = useState(route?.params?.yield ? route?.params?.yield.toString() : "");
  const [myFeedBack, setMyFeedBack] = useState(route?.params?.myFeedBack || "");
  const [totalPackValidations, setTotalValidations] = useState(false)
  const [yieldValidations, setYieldValidations] = useState(false)
  const [feedBackValidations, setFeedBackValidations] = useState(false)
  const [transactionId, setTransactionId] = useState(route?.params?.transactionId || "")
  const [geoType, setGeoType] = useState(route?.params?.geoLocationType || "")
  const [latitude, setLatitude] = useState(route?.params?.geoLocation?.split(",")[0]);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("")
  const [couponId, setCouponId] = useState(route?.params?.id)
  const [submittedValues, setSubmittedValues] = useState(null);
  const [modalPopOpen, setModalPopOpen] = useState(false)
  const [fieldsValue, setFieldsValue] = useState("")
  const [fieldsValueField, setFieldsValueField] = useState("")
  const [congratulationModalOpen, setCongratulationModalOpen] = useState(false)
  const [submitReponseMssg, setSubMitResponseMssg] = useState({})

  const [geoLocationValidation, setGeoLocationValitaion] = useState(false)
  const [geoLocationValidationContent, setGeoLocationValidationContent] = useState("")
  const [coordinates, setCoordinates] = useState({});
  const [alertModal, setAlertModal] = useState(false)
  const [alertModalContent, setAlertModalContent] = useState("")
  const cachedKnowledgeCenter = realm.objects('KnowledgeCenter');
  const [btnSubmitEnbled, setBtnSubmitEnbled] = useState(true)
  const [addressValidation, setAddressValidation] = useState(false)
  const [mapZoomingLevel, setMapZoomingLevel] = useState(20)
  const [coordinatesCopy, setCoordinatesCopy] = useState({})

  console.log("fieldsValue=-=->", fieldsValue)

  useFocusEffect(
    useCallback(() => {
      // feedBackApi()
      if (cachedKnowledgeCenter.length > 0) {
        const cachedData = cachedKnowledgeCenter[0];
        const parseData = cachedData;
        console.log("checkingFeedBack=-=->", JSON.parse(parseData.cropsList).feedBackList)
        setFeedbackLists(JSON.parse(parseData.cropsList).feedBackList);
      }
      GetUserLocation()
    }, [])
  );





  useEffect(() => {
    setFieldsValue(route?.params?.geoLocationType)
  }, [route?.params?.geoLocationType])



  useEffect(() => {
    // if (route.params?.latitude && route.params?.longitude && route.params?.address) {
    if (route?.params?.backScreen) {
      const geo = `${route?.params?.backScreen?.latitude},${route?.params?.backScreen?.longitude}`
      setLatitude(route?.params?.backScreen?.latitude);
      setLongitude(route?.params?.backScreen?.longitude);
      setCoordinates({ latitude: route?.params?.backScreen?.latitude, longitude: route?.params?.backScreen?.longitude })
      getDetailsFromLatlong(route?.params?.backScreen?.latitude, route?.params?.backScreen?.longitude)
      setGeoLocation(geo)
      setFieldsValue("field")
      setFieldsValueField("(In Field)")
      setMapZoomingLevel(route?.params?.backScreen?.zoom)
    }
  }, [route.params?.backScreen]);




  const GetUserLocation = async () => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("GETTINGCURRENTLOCATIO==-=->", latitude, longitude)
          // setLatitude(latitude)
          // setLongitude(longitude)
          setCoordinatesCopy(position.coords)
        },
        (error) => {
          if (error.code === 3 || error.code === 2) {
            Geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("GETTINGCURRENTLOCATIO==-=->", latitude, longitude)
                // setLatitude(latitude)
                // setLongitude(longitude)
                setCoordinatesCopy(position.coords)
              },
              () => setAlertModal(false),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 },
            );
          }
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert(translate("Error"), translate("An_unexpected_error_occurred_Please_try_again"));
    }
  }

  const CopyGetUserLocationCopy = async () => {
    GetUserLocation()
    // if (isConnected) {
    if (coordinatesCopy && typeof coordinatesCopy === 'object' && Object.keys(coordinatesCopy).length > 0) {
      navigation.navigate('Location', { coordinates: { latitude: coordinatesCopy?.latitude, longitude: coordinatesCopy?.longitude, address: address, screenName: "GeoTaggingViewScreen", zoom: mapZoomingLevel } })
    } else {
      SimpleToast.show(translate("location_error"))
    }
  }

  const submitGeoTaggingDetails = async () => {
    setLoader(true);
    const headers = await GetApiHeaders();
    const submissionTime = await getFormattedDateTime();
    console.log('Submission Time:', headers.userId + "_" + submissionTime);
    const finalJson = {
      id: couponId,
      geoLocation: geoLocation,
      totalSamplePacketsReceived: totalPackets,
      yield: yieldValue,
      myFeedBack: selectedValue,
      geoLocationType: fieldsValue,
      fieldAddress: address,
      mobileUniqueId: headers.userId + "_" + submissionTime,
      mobileSubmitionDateTime: submissionTime
    };
    const success = saveOrUpdateGeoTagById(finalJson);
    if (success) {
      updateOfflineCount()
      const payloadObj = await getAllGeoTags();
      console.log("payloadObj===>", payloadObj)
      if (isConnected && payloadObj != null) {
        try {
          // setLoader(true);
          const url = APIConfig.BASE_URL + APIConfig.geoTagging_submitSampleGeoTaggingDetails_V2
          const headers = await GetApiHeaders(); // Get JWT headers
          const response = await sendData(url, payloadObj, headers, false); // POST call
          if (response.statusCode === 200) {
            console.log("Success Response=-=-=->:", JSON.stringify(response.data.response));
            const ids = response?.data?.response?.uniqueIds ?? [];
            if (ids != undefined && ids.length > 0) {
              console.log("idddds", ids[0])
              if (ids[0] != null) {
                setCongratulationModalOpen(true);
                setSubMitResponseMssg(ids[0])
                setTotalValidations(false)
                setYieldValidations(false)
                setFeedBackValidations(false)
              }
            }
            ids.forEach(item => {
              const result = deleteGeoTagByUniquId(item.mobileUniqueId);
              console.log(`Deletion of ${item.mobileUniqueId}: ${result ? 'Success' : 'Failed'}`);
            });
          } else {
            SimpleToast.show(translate("Failed_to_submit_data"))
          }
        } catch (error) {
          SimpleToast.show(translate("An_unexpected_error_occurred_Please_try_again"))
        } finally {
          setLoader(false);
        }
      }
      else {
        if (success) {
          setLoader(false);
          setAlertModalContent(translate("Data_saved_offline"))
          setAlertModal(true)
        }
      }
      setBtnSubmitEnbled(true)
    }
  };

  const submitBtn = () => {
    if (fieldsValue === "" || fieldsValue == translate("select")) {
      console.log("called")
      setGeoLocationValitaion(true)
      setGeoLocationValidationContent(translate("pleaseSelectGeoloaction"))

    }
    else if (totalPackets === "") {
      setTotalValidations(true)
    } else if (yieldValue === "") {
      setYieldValidations(true)
    } else if (selectedValue === translate("Select_Feedback")) {
      setFeedBackValidations(true)
    } else if (fieldsValue === "field" && address == "") {
      setAddressValidation(true)
    }

    else {
      setTotalValidations(false)
      setYieldValidations(false)
      setFeedBackValidations(false)
      setGeoLocationValitaion(false)
      setBtnSubmitEnbled(false)
      setAddressValidation(false)

      submitGeoTaggingDetails()
    }
  }

  const totalSampleOnChange = (text) => {
    setTotalPackets(text.replace(/[^0-9]/g, '').replace(/^0+/, ''))
    setTotalValidations(false)
  }

  const yieldOnChange = (text) => {
    setYieldValue(text.replace(/[^0-9]/g, '').replace(/^0+/, ''))
    setYieldValidations(false)
  }



  const getDetailsFromLatlong = async (latitude, longitude) => {
    const API_KEY = '5zf2txekry89tciw19sgmjpo7w133ioj';
    const url = `https://apis.mapmyindia.com/advancedmaps/v1/${API_KEY}/rev_geocode`;
    try {
      const response = await axios.get(url, {
        params: {
          lat: latitude,
          lng: longitude
        }
      });
      console.log(response, "kiran-=-=-=->")

      if (response.data && response.data.results) {
        const { pincode, state, district, village, street, subDistrict, lat, lng, formatted_address } = response.data.results[0];
        setLatitude(lat)
        setLongitude(lng)
        setAddress(formatted_address)
        setAddressValidation(false)
        return { pincode, state, district };
      } else {
        console.warn('No results found from reverse geocoding');
        return null;
      }
    } catch (error) {
      console.error('Error fetching reverse geocode data:', error.message);
      return null;
    }

  }



  const feedBackApi = async () => {
    try {
      const url = APIConfig.BASE_URL + APIConfig.masters_getAllFeedback

      const headers = await GetApiHeaders();
      const response = await fetchData(url, headers);

      if (response && response.data && response.data.feedBackList) {
        console.log("Feedback Data:", response.data.feedBackList);
        setFeedbackLists(response?.data?.feedBackList);
      } else {
        console.error("Error: Unexpected Response", response);
      }
    } catch (error) {
      console.error("Error fetching feedback details:", error);
    }
  };


  const alertCloseHandle = () => {
    setAlertModal(false)
    navigation.goBack()
  }

  const handleLocationClick = async () => {

    if (isConnected) {
      console.log("coordinates", coordinates)
      if (coordinates && typeof coordinates === 'object' && Object.keys(coordinates).length > 0) {
        console.log("coordinates===>", coordinates)
        navigation.navigate('Location', { coordinates: { latitude: coordinates?.latitude, longitude: coordinates?.longitude, address: address, screenName: "GeoTaggingViewScreen", zoom: mapZoomingLevel } })
      }
      else {
        GetUserLocation()
        CopyGetUserLocationCopy()
      }

    } else {
      SimpleToast.show(translate('no_internet_conneccted'));
    }
  }

  const handleModalsValue = (value1, value2) => {
    setFieldsValue(value1)
    setMapZoomingLevel(30)
    setFieldsValueField(value2)
    setModalPopOpen(false)
    setGeoLocationValitaion(false)
    setAddress("")
    GetUserLocation();
    SimpleToast.show(translate("Go_Field_submit"))
  }

  const navigationHistory = () => {
    setCongratulationModalOpen(false)
    navigation.navigate("GeoTaggingScreen", { screen: "GeoTaggingViewScreen" })

  }

  const navigationQrscan = () => {
    setCongratulationModalOpen(false)
    // navigation.navigate("QRScanner")
    navigation.navigate("QRScanner", { from: "view" });
  }

  async function requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: translate("Location_Permission"),
            message: translate("need_to_access"),
            buttonNeutral: translate("storagePermissionNeutral"),
            buttonNegative: translate("storagePermissionNegative"),
            buttonPositive: translate("storagePermissionPositive"),
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission granted");
          return true;
        } else {
          console.log("Location permission denied");
          showPermissionDeniedAlert();
          return false;
        }
      }
      else {
        const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (permission === RESULTS.GRANTED) {
          console.log("✅ iOS location permission granted");
          return true;
        } else {
          console.log("❌ iOS location permission denied");
          showPermissionDeniedAlert();
          return false;
        }
      }

    } catch (err) {
      console.warn("requestLocationPermission error:", err);
      return false;
    }
  }

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      translate('Location_Permission_Required'),
      translate("deny_desc"),
      [
        {
          text: translate('open_settings'), onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings(); // for Android
            }
          }

        },
        { text: translate('storagePermissionNegative'), style: 'cancel' },
      ]
    );
  };



  const checkIfGpsEnabled = useCallback(async () => {
    try {
      await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 20000,
        fastInterval: 6000,
      });
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const fieldHandle = async (value1, value2) => {
    if (isConnected) {

      const hasPermission = await requestLocationPermission();
      console.log("hasPermission", hasPermission)
      if (hasPermission) {
        if (Platform.OS == "android") {
          const isGpsEnabled = await checkIfGpsEnabled();
          if (isGpsEnabled) {
            if (!address) {
              // GetUserLocation();
              await CopyGetUserLocationCopy()
              setFieldsValue(value1)
              setFieldsValueField(value2)
            } else {
              handleLocationClick()
              setFieldsValue(value1)
              setFieldsValueField(value2)
            }

          }
          else {
            if (!address) {
              GetUserLocation();
              CopyGetUserLocationCopy()
            } else {
              handleLocationClick()
            }
          }
        }
        else {
          if (!address) {
            // GetUserLocation();
            await CopyGetUserLocationCopy()
            setFieldsValue(value1)
            setFieldsValueField(value2)
          } else {
            setFieldsValue(value1)
            setFieldsValueField(value2)
            handleLocationClick()
          }

        }
      }
      else {
        setModalPopOpen(false)
        setGeoLocationValitaion(false)
        // Permission denied or blocked
        showPermissionDeniedAlert()
        return
      }

      setModalPopOpen(false)
      setGeoLocationValitaion(false)


    }
    else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }

  }

  return (
    <View style={RnStyles.mainContainer}>

      <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
        <View style={RnStyles.headerContentContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
          </TouchableOpacity>
          <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("sample_geo_tagging")}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={10} // adjust if needed
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View
            style={[
              RnStyles.contentContainer
            ]}
          >
            <View
              style={RnStyles.contentSubContainer
              }
            >
              <Text
                style={[RnStyles.receivedSampleDetailsText, { fontFamily: fonts.Bold }]
                }
              >
                {translate("received_sample_details")}
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#E8E8E8",
                  marginVertical: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  // margin: 5,
                }}
              />
              <View
                style={[

                  { backgroundColor: "#F2F6F9", borderRadius: 10 },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",

                    width: "100%"
                  }}
                >
                  <View style={RnStyles.topContentContainer}>
                    <Text
                      style={[RnStyles.cropText, { fontFamily: fonts.SemiBold }]
                      }
                    >
                      {translate("Crop")}
                    </Text>
                    <Text style={[RnStyles.cropTextValue, { fontFamily: fonts.SemiBold }]
                    }>
                      {cropName || "N/A"}
                    </Text>
                  </View>

                  <View style={RnStyles.topContentContainer}>
                    <Text
                      style={[RnStyles.cropText, { fontFamily: fonts.SemiBold }]
                      }
                    >
                      {translate("Hybrid")}
                    </Text>
                    <Text style={[RnStyles.cropTextValue, { fontFamily: fonts.SemiBold }]
                    }>
                      {hybridName || "N/A"}
                    </Text>
                  </View>
                  <View style={{ width: "40%", paddingLeft: 10 }}>
                    <Text

                      style={[RnStyles.cropText, { fontFamily: fonts.SemiBold }]
                      }
                    >
                      {translate("Sample_Received_On")}
                    </Text>
                    <Text style={[RnStyles.cropTextValue, { fontFamily: fonts.SemiBold }]
                    }>
                      {receivedDate ?
                        moment(receivedDate, "DD MMM YYYY hh:mm A").format("DD-MMM-YYYY")
                        //  moment(receivedDate, "YYYY-MM-DD HH:mm:ss.S").format("DD-MM-YYYY")
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E8E8E8",
                    marginVertical: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    // margin: 5,
                    width: "95%",
                    alignSelf: "center"
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    // justifyContent: "space-around",
                    // margin: 2,
                    width: "100%"

                  }}
                >
                  <View style={RnStyles.topContentContainer}>
                    <Text
                      style={[RnStyles.cropText, { fontFamily: fonts.SemiBold }]
                      }
                    >
                      {translate("Product_Label")}
                    </Text>
                    <Text style={[RnStyles.cropTextValue, { fontFamily: fonts.SemiBold }]
                    }>
                      {productLabel}
                    </Text>
                  </View>
                  <View style={RnStyles.topContentContainer}>
                    <Text
                      style={[RnStyles.cropText, { fontFamily: fonts.SemiBold }]
                      }
                    >
                      {translate("MDO_Name")}
                    </Text>
                    <Text style={[RnStyles.cropTextValue, { fontFamily: fonts.SemiBold }]
                    }>
                      {""}
                    </Text>
                  </View>

                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E8E8E8",
                    // marginVertical: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 5,
                    width: "95%",
                    alignSelf: "center"
                  }}
                />

                <View style={{
                  marginBottom: 5, paddingHorizontal: 5,
                  // borderWidth:1
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View>
                      <Text style={[RnStyles.geoLOcationText, { fontFamily: fonts.SemiBold }]}>{`${translate('geo_location')}`}<Text style={{ color: "red" }}>*</Text> </Text>
                    </View>
                    <Text style={[RnStyles.geoLOcationText, { fontFamily: fonts.SemiBold }]}>{fieldsValueField} </Text>

                    {fieldsValue !== "field" &&
                      <Image source={require("../../assets/Images/warningIcon.png")} style={{ height: 15, width: 15, resizeMode: "contain", }} />
                    }
                  </View>
                  <Text style={{ color: "red", fontSize: RFValue(10, height), fontFamily: fonts.SemiBold, }}>{translate("Tap_on_Field_for_options_Field_and_Other")}</Text>



                  <TouchableOpacity onPress={() => setModalPopOpen(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      // margin: 5,
                      width: "100%",
                      borderColor: geoLocationValidation ? "red" : "#D6D6D6",
                      borderWidth: 1,
                      justifyContent: "space-between",
                      minHeight: 40
                    }}
                  >
                    <Text style={{ width: "90%", color: "#000", fontSize: RFValue(14, height), lineHeight: 20, textTransform: "capitalize", fontFamily: fonts.Regular }}>{fieldsValue || translate("select")}</Text>
                    {/* <TouchableOpacity disabled={fieldsValue === ""} style={{ width: "10%", alignItems: "center" }}> */}
                    <Image source={require('../../assets/Images/LocationImg.png')} style={{ width: 10, height: 15, resizeMode: "contain" }} />
                    {/* </TouchableOpacity> */}
                  </TouchableOpacity>
                </View>
                {geoLocationValidation && <Text style={{ color: "red", fontSize: RFValue(13, height), fontFamily: fonts.SemiBold, marginLeft: 15 }}>{geoLocationValidationContent}</Text>}


                {fieldsValue === "field" &&
                  <>
                    {address &&
                      <View style={{
                        marginBottom: 5, paddingHorizontal: 5,
                        // borderWidth:1
                      }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View>
                            <Text style={[RnStyles.geoLOcationText, { fontFamily: fonts.SemiBold }]}>{`${translate('address')}`} </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            // margin: 5,
                            width: "100%",
                            borderColor: addressValidation ? "red" : "#D6D6D6",
                            borderWidth: 1,
                            justifyContent: "space-between",
                            minHeight: 40
                          }}
                        >
                          <Text style={{ width: "90%", color: "#000", fontSize: RFValue(14, height), lineHeight: 20, fontFamily: fonts.Regular }}>{address || ""}</Text>

                        </View>

                        {addressValidation && <Text style={{ color: "red", fontSize: RFValue(13, height), fontFamily: fonts.SemiBold, marginLeft: 15 }}>{translate("please_select_address")}</Text>}

                      </View>

                    }
                  </>
                }

              </View>
              {/* </View> */}

              <View style={{
                borderRadius: 10,
                //  margin: 5 

              }}>
                <Text style={[RnStyles.geoLOcationText, { fontFamily: fonts.SemiBold }]
                  // [
                  // // styles.marginLeft_10,
                }>
                  {translate("total_sample_packets_received")}<Text style={{ color: "red" }}> *</Text>
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    // margin: 5,
                    width: "100%",
                    borderColor: totalPackValidations ? "red" : "#D6D6D6",
                    borderWidth: 1,
                  }}
                >
                  <TextInput style={{ height: 40, color: "#000", fontSize: RFValue(14, height), lineHeight: 20, width: "100%", fontFamily: fonts.Regular }} placeholder={translate("plc_Enter_Number_Packets")}
                    value={totalPackets} // Bind state
                    onChangeText={totalSampleOnChange}
                    keyboardType="decimal-pad"


                    // onChangeText={(text) => setTotalPackets(text)}
                    // keyboardType="numeric"
                    placeholderTextColor={"#B8B8B8"}

                  />
                </View>
              </View>
              {totalPackValidations && <Text style={{ color: "red", fontSize: RFValue(15, height), fontFamily: fonts.SemiBold }}>{translate("Please_Enter_sample_packets")}</Text>}

              <View style={{
                borderRadius: 10,
                // margin: 5 
              }}>
                <Text style={[RnStyles.geoLOcationText, { fontFamily: fonts.SemiBold }]
                  // [
                  // // styles.marginLeft_10, 
                }>
                  {translate("yield_from_samples_received")}<Text style={{ color: "red" }}> *</Text>
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    // margin: 5,
                    width: "100%",
                    borderColor: yieldValidations ? "red" : "#D6D6D6",
                    borderWidth: 1,
                  }}
                >
                  <TextInput style={{ height: 40, color: "#000", fontSize: RFValue(14, height), lineHeight: 20, width: "100%", fontFamily: fonts.Regular }} placeholder={translate("EnterQuintals")}
                    value={yieldValue} // Bind input to state
                    onChangeText={yieldOnChange}
                    keyboardType="decimal-pad"
                    placeholderTextColor={"#B8B8B8"}

                  // editable={isEditable}
                  />

                </View>
              </View>
              {yieldValidations && <Text style={{ color: "red", fontSize: RFValue(15, height), fontFamily: fonts.SemiBold }}>{translate("Please_Enter_Quintals")}</Text>}


              <View style={{
                borderRadius: 10,
                //  margin: 5 
              }}>
                <Text style={[RnStyles.geoLOcationText, { fontFamily: fonts.SemiBold }]
                  // [
                  // // styles.marginLeft_10, 
                }>
                  {translate("my_feedback")}<Text style={{ color: "red" }}> *</Text>
                </Text>

                <TouchableOpacity
                  onPress={() => setShowOptions(!showOptions)}
                  style={{
                    backgroundColor: "white",
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 10,
                    // margin: 5,
                    width: "100%",
                    borderColor: feedBackValidations ? "red" : "#D6D6D6",
                    borderWidth: 1,
                    padding: 10,
                    flex: 1,
                  }}
                >
                  <Text style={{ flex: 1, color: "#000", fontSize: RFValue(14, height), lineHeight: 20, fontFamily: fonts.Regular }}>{selectedValue}</Text>
                  <TouchableOpacity onPress={() => setShowOptions(!showOptions)} >
                    <Image
                      source={require("../../assets/Images/DropDownImg.png")}
                      style={{ width: 15, height: 15, resizeMode: "contain" }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                {showOptions && (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 10,
                      // margin: 5,
                      width: "100%",
                      borderColor: "#D6D6D6",
                      borderWidth: 1,
                      // top: -10,
                      flex: 1,
                    }}
                  >
                    {feedbackLists.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{ padding: 10, borderBottomColor: "#ddd" }}
                        onPress={() => {
                          setSelectedValue(item.name);
                          setShowOptions(false);
                          setMyFeedBack(item.name)
                          setFeedBackValidations(false)

                        }}
                      >
                        <Text style={{ color: "#000", fontSize: RFValue(14, height), lineHeight: 20, fontFamily: fonts.Regular }}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {feedBackValidations && <Text style={{ color: "red", fontSize: RFValue(15, height), fontFamily: fonts.SemiBold }}>{translate("Please_Select_Feedback")}</Text>}


            </View>
          </View>

        </ScrollView>
      </KeyboardAwareScrollView>


      {btnSubmitEnbled && <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          bottom: height * 0.001,
          marginTop: Platform.OS == 'ios' ? 15 : 20,
        }}
      >
        <TouchableOpacity
          onPress={submitBtn}
          style={[
            // styles.height_44,
            // styles.width_315,
            {
              backgroundColor: dynamicStyles.primaryColor,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
              flexDirection: "row",
              paddingHorizontal: 10,
              width: "85%",
              alignSelf: "center",
              height: height * 0.06
            },
          ]}
        >
          <Text
            style={[
              {
                color: dynamicStyles.secondaryColor,
                fontSize: RFValue(15, height),
                fontFamily: fonts.Bold

              },
            ]}
          >
            {translate("submit")}
          </Text>
        </TouchableOpacity>
      </View>}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalPopOpen}
      // visible={true}

      >
        <TouchableWithoutFeedback onPress={() => setModalPopOpen(false)}>
          <View style={RnStyles.modalMainContainer}>
            <View style={RnStyles.modalSubContainer}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[RnStyles.modalSelectText, { fontFamily: fonts.SemiBold }]}>{translate("select")}</Text>
                <TouchableOpacity onPress={() => setModalPopOpen(false)}>
                  <Image source={require("../../assets/Images/crossIcon.png")} style={RnStyles.modalCrossIcon} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => fieldHandle("field", "(In Field)")} style={[RnStyles.modalBtnsContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                <Text style={[RnStyles.modalBtnText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Field")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleModalsValue("other", "(Other)")} style={[RnStyles.modalBtnsContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                <Text style={[RnStyles.modalBtnText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Other")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={congratulationModalOpen}
      // visible={true}

      >
        <TouchableWithoutFeedback onPress={() => setModalPopOpen(false)}>
          <View style={RnStyles.modalMainContainer}>
            <View style={RnStyles.modalSubContainer1}>
              <Image source={require("../../assets/Images/scanmore.png")} style={{ height: width * 0.25, width: width * 0.2, resizeMode: "contain", alignSelf: "center" }} />
              <ImageBackground style={{ height: height * 0.1, width: "100%" }} source={require("../../assets/Images/congratulationStickers.png")}>
                <View style={{ alignItems: "center" }}>
                  {submitReponseMssg?.message1 != undefined ?
                    <RenderHTML contentWidth={width} source={{ html: submitReponseMssg?.message1 }} />
                    :
                    <Text style={{ fontFamily: fonts.Bold, alignSelf: "center", color: "#000", fontSize: RFValue(16, height), marginTop: 10 }}>{"Data Submitted Successfully"}</Text>
                  }
                </View>
                {submitReponseMssg?.message &&
                  <Text style={{ fontFamily: fonts.Regular, alignSelf: "center", color: "#000", fontSize: RFValue(14, height), marginTop: 10 }}>{submitReponseMssg?.message}</Text>
                }
              </ImageBackground>
              <View style={{ paddingHorizontal: 10, paddingTop: 10, flexDirection: "row", marginTop: 10, borderRadius: 15, backgroundColor: "#1EBB000F", width: "100%", height: 100 }}>
                {submitReponseMssg?.productImage &&
                  <Image source={{ uri: submitReponseMssg.productImage }} style={{ height: height * 0.1, width: width * 0.1, resizeMode: "contain" }} />
                }
                <View style={{ marginTop: 10, marginLeft: 20 }}>

                  <Text style={{ color: "#000", fontFamily: fonts.SemiBold, fontSize: RFValue(15, height) }}>{submitReponseMssg?.cropName}</Text>
                  <Text style={{ color: "#00000099", marginTop: 10, fontFamily: fonts.Regular, fontSize: RFValue(13, height) }}>{hybridName}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                <TouchableOpacity onPress={navigationQrscan} style={[RnStyles.modalBtnsContainer1, { borderColor: dynamicStyles.primaryColor }]}>
                  <Text style={{ fontFamily: fonts.SemiBold, color: dynamicStyles.primaryColor, fontSize: RFValue(15, height) }}>{submitReponseMssg?.buttonTitle1}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={navigationHistory} style={[RnStyles.modalBtnsContainer2, { backgroundColor: dynamicStyles.primaryColor }]}>
                  <Text style={{ fontFamily: fonts.SemiBold, color: dynamicStyles.secondaryColor, fontSize: RFValue(15, height) }}>{submitReponseMssg?.buttonTitle2}</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {loader && <PreLoginCustomLoader />}
      <CustomCommonModal
        modalVisible={alertModal}
        ErrorText={alertModalContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}

      />
    </View>

  );
};

export default GeoTaggingViewScreen;

const RnStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#F2F6F9",
    flex: 1,
    width: "100%"
  },

  headerMainContainer: {
    paddingTop: height * 0.03,
    paddingHorizontal: 20,
    height: height * 0.1
  },

  headerContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // width: "75%"
  },

  backArrowImg: {
    height: height * 0.05,
    width: width * 0.1,
    resizeMode: "contain"
  },

  bookSeedsText: {
    fontSize: RFValue(16, height),
    // lineHeight: 20
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
  modalMainContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end"
  },

  modalSubContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: height * 0.25,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 15
    // padding: 20,
  },

  modalSubContainer1: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: height * 0.55,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 15
    // padding: 20,
  },

  contentContainer: {
    // justifyContent: "center", 
    alignItems: "center",
    marginTop: height * 0.015,
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 10,
    alignSelf: "center"
  },

  contentSubContainer: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 10,
    // marginBottom: 30,
    paddingHorizontal: 10,
    padding: 5
  },

  receivedSampleDetailsText: {
    fontSize: RFValue(18, height),
    color: "#000",
    // borderWidth:1
    // marginTop:5
  },

  topContentContainer: {
    borderRightWidth: 1,
    width: "30%",
    // paddingHorizontal:5,
    // paddingTop:5,
    borderColor: "#E8E8E8",
    paddingLeft: 10
  },

  cropText: {
    fontSize: RFValue(10, height),
    color: "#000",
    marginBottom: 5,
    marginTop: 5
  },

  cropTextValue: {
    fontSize: RFValue(14, height),
    color: "#000"
  },

  geoLOcationText: {
    color: "#5D5D5D",
    fontSize: RFValue(14, height),
    marginVertical: 5,
    lineHeight: 20,
  },
  text: {
    backgroundColor: 'red'
  },

  modalSelectCalMainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  modalSelectText: {
    color: "#000",
    fontSize: RFValue(17, height),
  },

  modalCrossIcon: {
    height: 13,
    width: 13,
    resizeMode: "contain",
    tintColor: "#555555"
  },

  modalBtnsContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: height * 0.06,
    width: "100%",
    marginTop: height * 0.019
  },

  modalBtnsContainer1: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: height * 0.06,
    width: "40%",
    marginTop: height * 0.019,
    borderWidth: 1
  },

  modalBtnsContainer2: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: height * 0.06,
    width: "40%",
    marginTop: height * 0.019
  },

  modalBtnText: {
    fontSize: RFValue(15, height),
    lineHeight: 30
  }

});
