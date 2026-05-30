import {
  StyleSheet, Text, TouchableOpacity, Dimensions, View, Image, FlatList, Platform, TextInput
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Styles } from "../styles/Styles";
import { translate } from "../Localization/Localisation";
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import { GetApiHeaders } from "../utils/helpers";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import APIConfig, { HTTP_OK } from "../api/APIConfig";
import useGetRequestWithJwt from "../api/useGetRequestWithJwt";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getFromAsyncStorage } from '../utils/keychainUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from "react-native-responsive-fontsize";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { CustomCommonModal } from '../components/CustomCommonModal';
import { LANGUAGEID } from "../utils";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import realm from "./realmOffline/realmConfig";
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import SimpleToast from 'react-native-simple-toast';
import { useGeoTaggingCRUD } from "./realmOffline/useGeoTaggingCRUD";
import { processSampleGeoTaggingData } from "./ImageDownloads/GeoImageDownloadUtils";
import { useFontStyles } from "../hooks/useFontStyles";
const { width, height } = Dimensions.get('window');
const defaultImage = require('../../assets/Images/farmerIconImg.png');
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 2;
const GeoTaggingScreen = ({ route }) => {
  console.log("route===", JSON.stringify(route))
  const fonts = useFontStyles()
  const currentTheme = useSelector((state) => state.theme.theme);
  const isConnected = useSelector((state) => state.network.isConnected);
  const navigation = useNavigation()
  const dynamicStyles = useSelector(
    (state) => state.companyStyles.companyStyles
  );
  const { fetchData } = useGetRequestWithJwt();
  const [loader, setLoader] = useState(false)
  const [scanHistory, setScanHistory] = useState([]);
  const [feedback, setFeedback] = useState(route.params?.feedbackValue || "No Feedback");
  const [scanMssg, setScanMssg] = useState("")
  const [cameraPermission, setCameraPermission] = useState(null);
  const [searchValue, setSearchValue] = useState("")
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")
  const [langId, setLangId] = useState(null)
  const [refreshListKey, setRefreshListKey] = useState(0);
  const cachedGeoTaggingHistory = realm.objects('GEOTAGGINGHISTORY');
  const { getAllGeoTags } = useGeoTaggingCRUD();
  const cachedImages = realm.objects('Image');
  const insect = useSafeAreaInsets()


  useEffect(() => {
    setRefreshListKey(prev => prev + 1);
  }, [isConnected]);

  const loadFeedback = async () => {
    try {
      const feedback = await AsyncStorage.getItem('feedback');
      if (feedback !== null) {
        console.log("Feedback loaded from AsyncStorage:", feedback); // Debug log
        setFeedback(feedback);
      }
    } catch (error) {
      console.error("Error loading feedback from AsyncStorage:", error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      loadFeedback();
      checkPermissions()
      getSampleGeoTaggingHistory(); // Fetch scan history whenever the screen is focused
    }, [])
  );

  // Handle sync after QR scan or View submission success
  useEffect(() => {
    if (['QrScan', 'GeoTaggingViewScreen'].includes(route?.params?.screen)) {
      console.log("Triggered due to route screen param:", route?.params?.screen);
      setLoader(true);
      callHistoryApi();
      // Clean route param after use to avoid repeat call
      navigation.setParams({ screen: undefined });
    }
  }, [route?.params?.screen]);

  useEffect(() => {
    const cleanupStaleImages = async () => {
      try {
        const images = [...cachedImages.filtered('localPath != null')];
        const toDelete = [];
        for (const img of images) {
          const exists = await RNFS.exists(img.localPath);
          if (!exists) {
            toDelete.push(img);
            console.log(`Marked stale image for deletion: ${img.url}`);
          }
        }
        if (toDelete.length > 0) {
          realm.write(() => {
            toDelete.forEach(img => realm.delete(img));
          });
          console.log(`Deleted ${toDelete.length} stale images`);
        }
      } catch (error) {
        console.error('Error cleaning up stale images:', error);
      }
    };
    cleanupStaleImages();
    const getLanId = async () => {
      const checkingLangId = await getFromAsyncStorage(LANGUAGEID);
      console.log("checking=-=->")
      setLangId(checkingLangId)
    }
    getLanId()
  }, []);

  // const ensureDownloadFolderExists = async () => {
  //   const exists = await RNFS.exists(DOWNLOAD_FOLDER_PATH);
  //   if (!exists) {
  //     await RNFS.mkdir(DOWNLOAD_FOLDER_PATH);
  //   }
  // };

  // const downloadImageToLocalCopy = async (url, fileName) => {
  //   try {
  //     await ensureDownloadFolderExists();

  //     const localPath = `${DOWNLOAD_FOLDER_PATH}/${fileName}`;
  //     const fileExists = await RNFS.exists(localPath);

  //     if (fileExists) {
  //       console.log(`Image already exists at: ${localPath}`);
  //       return `file://${localPath}`;
  //     }

  //     const res = await RNFS.downloadFile({
  //       fromUrl: url,
  //       toFile: localPath,
  //       // timeout and retry are not native RNFS params, handle retry separately if needed
  //     }).promise;

  //     if (res.statusCode === 200) {
  //       console.log(`Image downloaded successfully to: ${localPath}`);
  //       return `file://${localPath}`;
  //     } else {
  //       console.warn(`Image download failed with status: ${res.statusCode} for URL: ${url}`);
  //       return '';
  //     }
  //   } catch (error) {
  //     console.warn(`Image download failed for URL: ${url}, Error: ${error.message}`);
  //     return '';
  //   }
  // };

  // const processSampleGeoTaggingData = async (data) => {
  //   console.log("marketChecjin=-=-=>", data)
  //   const updatedList = await Promise.all(
  //     data.map(async (item, index) => {
  //       console.log("checking[[p[>>", item)
  //       const fileName = `cropImgs_${item.productLabel}_${item.cropName}.png`;
  //       const localPath = await downloadImageToLocalCopy(item.imageUrl, fileName);
  //       console.log("localCheclk=-=--=>", localPath)
  //       return {
  //         ...item,
  //         imageUrlLocal: localPath,
  //       };
  //     })
  //   );

  //   console.log("upfatye=-=-=->", updatedList)
  //   return {
  //     updatedList
  //   };
  // };


  const checkPermissions = async () => {
    const cameraStatus = await check(
      Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
    );
    setCameraPermission(cameraStatus);
    if (cameraStatus !== RESULTS.GRANTED) {
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
  };


  const alertCloseHandle = () => {
    setAlertModal(false)
  }

  const callQRScannerClass = async () => {
    if (isConnected) {
      // navigation.navigate('QRScanner')
      navigation.navigate("QRScanner", { from: "geo" });
    }
    else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }


  const handleSearchvalue = (value) => {
    setSearchValue(value.replace(/\s/g, ""))
    const filterValue = scanHistory.filter((item) =>
      item.cropName.toLowerCase().includes(value.replace(/\s/g, "").toLowerCase())
    );

    if (value.length > 0) {
      setScanHistory(filterValue)
    } else {
      callHistoryApi()
    }
  }

  const callHistoryApi = async () => {
    if (isConnected) {
      try {
        const url = APIConfig.BASE_URL + APIConfig.geoTagging_getScanHistory
        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        console.log("reposneKnHistor=-=-=->", JSON.stringify(response))
        if (response.statusCode == HTTP_OK) {
          console.log("reposneKnHistor=-=-=->", JSON.stringify(response.data))
          if (response && response?.data) {
            setScanHistory([])
            if (response?.data?.scanHistoryList) {
              setScanHistory(response?.data?.scanHistoryList);
              const uploadedGeotaggingData = await processSampleGeoTaggingData(response?.data?.scanHistoryList)
              console.log("traysyu=-=->5", uploadedGeotaggingData.updatedList)
              if (uploadedGeotaggingData?.updatedList?.length > 0) {
                setScanHistory(uploadedGeotaggingData.updatedList); // ✅ Set here to reflect in UI
              }
              let scanMssgOffline
              if (langId === "2") {
                scanMssgOffline = response.data.scanTeluguMessage
              } else if (langId === "3") {
                scanMssgOffline = response.data.scanHindiMessage
              } else if (langId === "1") {
                scanMssgOffline = response.data.scanMessage
              }
              setScanMssg(scanMssgOffline)
              let geoTaggingHistoryId;
              const maxAttempts = 3;
              let attempts = 0;
              while (attempts < maxAttempts) {
                try {
                  geoTaggingHistoryId = uuidv4();
                  const existingDashboard = realm.objects('GEOTAGGINGHISTORY').filtered('_id == $0', geoTaggingHistoryId);
                  if (existingDashboard.length === 0) {
                    break;
                  }
                  attempts++;
                } catch (uuidError) {
                  return;
                }
                if (attempts >= maxAttempts) {
                  return;
                }
              }
              if (uploadedGeotaggingData) {
                console.log("checapopo=-=-=->", uploadedGeotaggingData.updatedList)
                setLoader(false)

                try {
                  realm.write(() => {
                    realm.delete(cachedGeoTaggingHistory);
                    realm.create('GEOTAGGINGHISTORY', {
                      _id: geoTaggingHistoryId,
                      couponsHistoryList: JSON.stringify(uploadedGeotaggingData.updatedList || []),
                      scanMssg: JSON.stringify(scanMssgOffline || ""),
                      timestamp: new Date(),
                    });
                  });
                  console.log('Successfully created GEOTAGGINGHISTORY with _id:', geoTaggingHistoryId);
                } catch (realmError) {
                  console.error('Error creating GEOTAGGINGHISTORY object in Realm:', realmError);
                  return;
                }
              }
            } else {
              setLoader(false)

              console.log("API Error:", response.data.message);
            }
          } else {
            setLoader(false)
          }
        }
        else {
          setLoader(false)
          getSampleGeoTaggingHistory()
        }

      } catch (error) {
        setLoader(false)
        console.error("Error fetching scan history:", error);
      }
    } else {
      getSampleGeoTaggingHistory();
      setLoader(false)
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const updateCouponList = async (couponsList, updatesList) => {
    const updatedCoupons = JSON.parse(JSON.stringify(couponsList));
    console.log("couponsList=-=->", couponsList)
    console.log("updatesList=-=->", updatesList)
    const updatesArray = Array.isArray(updatesList) ? updatesList : [updatesList];

    updatesArray.forEach(update => {
      const match = updatedCoupons.find(c => c.id == update.id);
      console.log("sasa", match);
      if (match) {
        match.geoLocationType = update.geoLocationType || match.geoLocationType;
        match.myFeedBack = update.myFeedBack || match.myFeedBack;
        match.totalSamplePackets = update.totalSamplePacketsReceived || match.totalSamplePackets;
        match.imageUrl = update.imageUrl || match.imageUrl
        match.yield = update.yield || match.yield;

        match.imageUrlLocal = update.imageUrlLocal || match.imageUrlLocal;
        match.mobileUniqueId = update.mobileUniqueId || "";
        match.mobileSubmitionDateTime = update.mobileSubmitionDateTime || "";
        match.fieldAddress = update.fieldAddress || "";
        match.isSynced = update.isSynced ?? false;
      }
    });

    return updatedCoupons;
  };

  const getSampleGeoTaggingHistory = async () => {
    try {
      if (cachedGeoTaggingHistory.length > 0) {
        console.log("offline=-=->geotaggingsc", JSON.stringify(cachedGeoTaggingHistory));

        const getAllGeoTagOfflineList = await getAllGeoTags();
        console.log("getAllGeoTagOfflineList===>", getAllGeoTagOfflineList);

        // Parse couponsHistoryList if it's a JSON string
        let couponsList = cachedGeoTaggingHistory[0]?.couponsHistoryList;
        if (typeof couponsList === 'string') {
          couponsList = JSON.parse(couponsList);
        }

        const updatedCouponList = await updateCouponList(couponsList, getAllGeoTagOfflineList);
        console.log("cachedGeoTaggingHistoryUpdated===>", updatedCouponList);

        setLoader(false);
        setScanHistory(updatedCouponList);

        const scanMsg = cachedGeoTaggingHistory[0]?.scanMssg;
        setScanMssg(typeof scanMsg === 'string' ? JSON.parse(scanMsg) : scanMsg);
      } else {
        callHistoryApi();
      }
    } catch (error) {
      console.error("Error in getSampleGeoTaggingHistory:", error);
      setLoader(false); // Ensure loader stops even on error
    }
  };


  const renderCouponsItems = ((item, index) => {
    console.log("cache=-=->", item?.item?.imageUrl + " " + JSON.stringify(item?.item))
    const dateObj = new Date(item.item.recievedDate);

    // Step 2: Extract parts
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format

    // Step 3: Format result
    const formatted = `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
    return (
      <TouchableOpacity
        disabled={item.item.geoLocationType === "field"}
        key={index} onPress={() => navigation.navigate("GeoTaggingViewScreen", item.item
        )}>
        {/* <View style={{backgroundColor:"red"}}> */}
        <View style={[{
          marginTop: 10, width: "100%", borderWidth: 1, borderColor: "#F1F1F1", flexDirection: "row",
          borderRadius: 10, backgroundColor: item.item.geoLocationType === "field" ? "#E9E9E9" : "#fff"
        }, (item.item.geoLocationType === "field") ? { backgroundColor: '#F2F6F9' } : (item?.item?.isSynced == false) && (item.item.geoLocationType === "other") ? { backgroundColor: '#E9E9E9' } : { backgroundColor: '#fff' },
        ]}>

          {/* Image Section */}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <View style={{ borderWidth: 1, borderColor: "#F1F1F1", height: 70, width: 80, justifyContent: "center", alignItems: "center", margin: 10, borderRadius: 12 }}>
              <Image source={{ uri: isConnected ? item?.item?.imageUrl : item?.item?.imageUrlLocal }} style={{ width: 70, height: 60, borderRadius: 10 }} />
            </View>
          </View>

          {/* Text Section */}
          <View style={{ padding: 10 }}>
            {/* Crop Name */}
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("Crop")}</Text>
              <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{`: ${item.item.cropName}`}</Text>
            </View>

            {/* Hybrid Name */}
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("Hybrid")}</Text>
              <Text style={RnStyles.dotsText}>:</Text>

              <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{` ${item.item.hybridName}`}</Text>

            </View>

            {/* Received Date */}
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("Received_Date")}</Text>
              <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{`: ${formatted}`}</Text>

            </View>
            {item?.item?.totalSamplePackets.toString()
              && (
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("total_sample_packets_received")}</Text>
                  <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{`: ${item.item.totalSamplePackets}`}</Text>
                </View>
              )}

            {item?.item?.yield.toString() &&

              <View style={{ flexDirection: "row", marginBottom: 5 }}>
                <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("yield_from_samples_received")}</Text>
                <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{`: ${item.item.yield}`}</Text>
              </View>
            }
            {item?.item?.myFeedBack
              // && item.myFeedBack !== "No Feedback"
              && (
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("my_feedback")}</Text>
                  {/* <Text style={{ fontWeight: "bold", color: "gray" }}>:</Text> */}
                  {/* <Text style={{ color: "black" }}>{feedback}</Text> */}
                  <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{`: ${item.item.myFeedBack}`}</Text>

                </View>
              )}

            {item?.item?.geoLocationType
              // && item.myFeedBack !== "No Feedback"
              && (
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  <Text style={[RnStyles.labelsText, { fontFamily: fonts.SemiBold }]}>{translate("GeoLocation_Type")}</Text>
                  <Text style={[RnStyles.labelTextValue, { fontFamily: fonts.Regular }]}>{`: ${item.item.geoLocationType}`}</Text>

                </View>
              )}
          </View>
        </View>
        {item?.item?.geoLocationType !== "field" &&
          <Image source={require("../../assets/Images/warningIcon.png")} style={{ height: 15, width: 15, resizeMode: "contain", position: "absolute", top: height * 0.02, right: width * 0.05 }} />
        }
      </TouchableOpacity>
    )
  })

  const onRefresh = () => {
    if (isConnected) {
      setLoader(true);
      callHistoryApi()
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
      setLoader(false);
    }
  }

  return (
    <View style={RnStyles.booksSeedsMainContainer}>
      <View style={{ backgroundColor: dynamicStyles.primaryColor }}>
        <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
          <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
          <View style={RnStyles.headerContentContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
            </TouchableOpacity>
            <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("sample_geo_tagging")}</Text>
            <TouchableOpacity onPress={() => onRefresh()} style={{
              alignSelf: "flex-start", marginLeft: 10, marginRight: 5, right: 0, top: 10, position: "absolute",
            }}>
              <Image source={require("../../assets/Images/RefreshIcon.png")} style={{ height: 30, width: 30, tintColor: "#fff" }} />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>

        </View>
      </View>

      <View style={RnStyles.contentCard}>
        <View style={{ padding: 10, backgroundColor: "#fff", maxHeight: Platform.OS === "ios" ? height * 0.6 : height * 0.72, width: "90%", alignSelf: "center", marginTop: 15, borderRadius: 8 }}>
          <Text style={{ fontSize: RFValue(15, height), fontFamily: fonts.SemiBold, color: "#000", marginTop: 5, lineHeight: 30 }}>
            {translate("received_samples_history")}
          </Text>
          <View style={{ height: 1, width: "100%", backgroundColor: "#B4B4B4", marginVertical: 10 }} />

          <View style={RnStyles.searchFieldMainContainer}>
            <Image source={require('../../assets/Images/SearchingImg.png')} style={RnStyles.searchImg} />
            <TextInput value={searchValue} onChangeText={handleSearchvalue} placeholder={translate("Search_here")}
              style={[RnStyles.searchInputContainer, { fontFamily: fonts.Regular }]} placeholderTextColor={"#00000080"} />
          </View>



          {!loader &&
            <FlatList showsVerticalScrollIndicator={false}
              key={refreshListKey} // re-render on network change
              renderItem={renderCouponsItems} data={scanHistory} ListEmptyComponent={() => <Text style={{ color: "#000", fontFamily: fonts.Bold, fontSize: RFValue(17, height), alignSelf: "center", marginTop: 15 }}>{translate("No_data_available")}</Text>} />
          }
        </View>
        <View>
          <View style={{
            alignItems: "center",
            marginBottom: Platform.OS === "ios" ? scanMssg ? 50 : insect.bottom : insect.bottom
          }}>
            <TouchableOpacity
              onPress={() => callQRScannerClass()}
              style={{
                backgroundColor: dynamicStyles.primaryColor,
                width: width * 0.15,
                height: width * 0.15,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
                // marginBottom: 5
                marginBottom: Platform.OS == 'ios' ? 20 : 40,
              }}
            >
              <Image
                source={require("../../assets/Images/ScanIcon.png")} // Replace with your icon
                style={{
                  width: 30,
                  height: 30,
                  tintColor: dynamicStyles.secondaryColor,
                }}
              />
            </TouchableOpacity>
            {scanMssg &&
              <Text
                style={[
                  { width: "80%", fontSize: RFValue(14, height), color: "#000", textAlign: "center", fontFamily: fonts.Regular },
                ]}
              >
                {scanMssg}
              </Text>
            }
          </View>
        </View>

      </View>
      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}

      />
      {loader && <PreLoginCustomLoader />}

    </View>
  );
};

export default GeoTaggingScreen;

const RnStyles = StyleSheet.create({
  booksSeedsMainContainer: {
    backgroundColor: "#F2F6F9",
    flex: 1,
    width: "100%"
  },
  headerMainContainer: {
    paddingTop: height * 0.04,
    paddingHorizontal: 20,
    height: height * 0.105
  },

  headerContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // width: "70%",
    // paddingLeft:15,
    // borderWidth:1
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

  contentCard: {
    height: height * 0.75,
    width: "100%",
    justifyContent: "space-between"
  },

  labelsText: {
    color: "#000",
    width: width * 0.3,
    fontSize: RFValue(12, height),
  },

  labelTextValue: {
    color: "#000",
    width: width * 0.2,
    fontSize: RFValue(12, height),
  },

  dotsText: {
    color: "#000",
    fontWeight: "400",
    fontSize: RFValue(12, height),
  },

  searchFieldMainContainer: {
    paddingLeft: 15,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED323712",
    borderRadius: 10,
  },

  searchInputContainer: {
    paddingLeft: 20,
    width: "90%",
    fontSize: 13,
    fontWeight: "400",
    color: "#00000066"
  },
});






