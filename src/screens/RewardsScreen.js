import { StatusBar, StyleSheet, Image as RnImage, Text, FlatList as RnFlatList, Dimensions, View as RnView, TouchableWithoutFeedback, Linking, Platform, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Styles } from "../styles/Styles";
import { useSelector } from "react-redux";
import { Colors } from "../styles/colors";
import moment from "moment";
import APIConfig, { HTTP_OK } from "../api/APIConfig";
import useGetRequestWithJwt from "../api/useGetRequestWithJwt";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import Share from "react-native-share";
import { getFromAsyncStorage } from "../utils/keychainUtils";
import { REFERRALCODE } from "../utils";
import { GetApiHeaders } from "../utils/helpers";
import { translate } from "../Localization/Localisation";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from "../hooks/useFontStyles";

const { width, height } = Dimensions.get('window');
import { RFValue } from "react-native-responsive-fontsize";
import { responsiveHeight } from "react-native-responsive-dimensions";

const RewardsScreen = ({ navigation }) => {
  const fonts = useFontStyles()
  const [inputText, setInputText] = useState("");
  const isConnected = useSelector(state => state.network.isConnected);
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [selectedTab, setSelectedTab] = useState(translate("promotions"));
  const [scanHistoryData, setScanHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [apiRequestType, setApiRequestType] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const currentTheme = useSelector((state) => state.theme.theme);
  const [loader, setLoader] = useState(false)

  const dynamicStyles = useSelector(
    (state) => state.companyStyles.companyStyles
  );

  const { getData, getLoading, error, statusCode, fetchData } = useGetRequestWithJwt();



  const [rewardsData, setRewardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bonusPromotionsList, setBonusPromotionsList] = useState([])
  const [programPointsList, setProgramPointsList] = useState([])
  const [tabSelections, setTabSelections] = useState(true)


  const apiUrl = APIConfig.BASE_URL + APIConfig.getAllRewards_v1


  useEffect(() => {
    if (isConnected) {
      fetchRewards();
    }
  }, []);

  const fetchRewards = async () => {
    try {
      const headers = await GetApiHeaders();
      const response = await fetchData(apiUrl, headers);
      // const response = await fetch(apiUrl);
      console.log("apiUrl=-=-=>", response.data.rewardsList)
      // const json = await response.json();
      if (response.statusCode === 200) {
        setRewardsData(response.data.rewardsList);
      } else {
        setLoading(false);

        // Alert.alert(translate("Error"), translate("Failed_to_fetch_rewards"));
        // SimpleToast.show(translate("Failed_to_fetch_rewards"))

      }
    } catch (error) {
      setLoading(false);

      console.error("API Error:", error);
      // Alert.alert(translate("Error"), translate("Something_went_wrong"));
      // SimpleToast.show(translate("Something_went_wrong"))
    } finally {
      setLoading(false);
    }
  };

  const renderBounusList = ((item) => {
    console.log("saikiran=-=-asalsalsk=-=>", item.item)
    const date = item?.item?.scannedOn ? moment(item.item.scannedOn).format('DD-MMM-YYYY, hh:mm A') : ""
    return (
      <RnView style={RnStyles.promotionsCard}>
        <RnView style={RnStyles.promotionTopCard}>
          <RnImage resizeMode="contain" source={{ uri: item.item.imagePath }} style={{ height: width * 0.1, width: width * 0.15 }} />
          <RnView style={{ flexDirection: "row", flexWrap: "wrap", width: "80%" }}>
            <Text style={[RnStyles.labelPromotions, { fontFamily: fonts.Regular }]}>{translate("Scheme_Type")} </Text>
            <Text style={[RnStyles.labelPromotions3, { width: "65%", fontFamily: fonts.Regular }]}> {item.item.schemeType}</Text>
          </RnView>

        </RnView>
        <RnView style={{ padding: 5, width: "100%", borderWidth: 1, borderColor: "#D6D6D64D", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, flexDirection: "row" }}>
          <RnView style={{ width: "30%" }}>
            <Text style={[RnStyles.labelPromotions, { fontFamily: fonts.Regular }]}>{translate("Reward_Points")}</Text>
            <Text style={[RnStyles.labelPromotions2, { fontFamily: fonts.Regular }]}>{item.item.rewardPoints}</Text>
          </RnView>
          <RnView style={{ borderColor: "#0000000F", borderLeftWidth: 1, borderRightWidth: 1, width: "35%", alignItems: "center" }}>
            <Text style={[RnStyles.labelPromotions, { fontFamily: fonts.Regular }]}>{translate("mobile_number")}</Text>
            <Text style={[RnStyles.labelPromotions2, { fontFamily: fonts.Regular }]}>{item.item.farmerMobileNumber}</Text>
          </RnView>
          <RnView style={{ width: "30%" }}>
            <Text style={[RnStyles.labelPromotions, { fontFamily: fonts.Regular }]}>{translate("Scanned_Date")}</Text>
            <Text style={[RnStyles.labelPromotions2, { fontFamily: fonts.Regular }]}>{date}</Text>
          </RnView>
        </RnView>
      </RnView>
    )
  })

  const tabsHandle = (value) => {
    setTabSelections(value)

  }

  const renderHowToEarn = (item) => {
    console.log("sas;las;la=-=->", item.item)
    return (
      <RnView style={{ marginBottom: 5, flexDirection: "row" }}>
        <RnImage source={{ uri: item.item.imageUrl }} style={{ height: width * 0.2, width: width * 0.2, resizeMode: "contain" }} />
        <RnView style={{ marginLeft: 10, width: "70%" }}>
          <Text style={{ color: "#000", fontSize: RFValue(14, height), fontFamily: fonts.SemiBold, marginBottom: 10 }}>{item.item.pointTypes}{item.item.description}</Text>
          <RnView style={{ backgroundColor: dynamicStyles.primaryColor, width: "50%", maxWidth: "70%", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(11, height), fontFamily: fonts.SemiBold }}>{item.item.earnedPoints}</Text>
          </RnView>
        </RnView>
      </RnView>
    )
  }

  //   Referrral code  getting from AsyncStorage...........
  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const referralCode = await getFromAsyncStorage(REFERRALCODE);
      console.log("reffer data", referralCode);
      setInputText(referralCode); // Set referral code to input field
      //   setPlayStoreUrl(applicationUrl)
    } catch (error) {
      console.error("Error fetching referral code:", error);
    }
  };


  RewardsUrl = APIConfig.BASE_URL + APIConfig.AUTH.REWARDS;
  referralUrl = APIConfig.BASE_URL + APIConfig.AUTH.REFERRAL;


  useEffect(() => {
    const fetchRewardsList = async (requestType) => {
      setIsLoading(true); // Start loading
      try {
        const headers = await GetApiHeaders();
        await fetchData(RewardsUrl, headers); // Fetch data
        setApiRequestType(requestType);
      } catch (error) {
        console.error("Error fetching rewards list:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    };
    isConnected && fetchRewardsList();
  }, [RewardsUrl]);

  useEffect(() => {
    const retrievedData = getData;
    console.log("REWARDS DATA", retrievedData);
    if (retrievedData?.scanHistoryList) {
      setScanHistoryData(retrievedData?.scanHistoryList);
    } else if (error) {
      console.error("Failed to load rewards list:", error);
    }
  }, [getData, error]);



  useEffect(() => {
    isConnected && fetchReferralList();
  }, [referralUrl]);

  const fetchReferralList = async (requestType) => {
    const headers = await GetApiHeaders();
    setApiRequestType(requestType);
    fetchData(referralUrl, headers);
  };

  useEffect(() => {
    const referralData = getData; // This is where the referral data will be available
    console.log("REFERRAL DATA", referralData);
    if (referralData) {
      setReferralData(referralData); // Setting referral data to state
      // setInputText(referralData?.referralCode);
      setPlayStoreUrl(referralData.applicationUrl);
    } else if (error) {
      console.error("Failed to load referral data:", error);
    }
  }, [getData, error]);

  useFocusEffect(
    useCallback(() => {
      getMeetingsDrops();
    }, [])
  );

  const getMeetingsDrops = async () => {
    // console.log("CALLLED=-=-=-")
    setLoader(true)

    if (isConnected) {
      try {

        var getFertilizerCalcURL = APIConfig.BASE_URL + APIConfig.GEOTAGGINGGETALLFARMERREWARDS

        var getHeaders = await GetApiHeaders()
        var header = {}
        header.farmerId = getHeaders.userId
        header.mobileNumber = getHeaders.mobileNumber
        console.log("HEADERS=-=-=>", getHeaders)

        var APIResponse = await fetchData(getFertilizerCalcURL, header, false);
        if (APIResponse.statusCode === HTTP_OK) {
          setBonusPromotionsList(APIResponse.data.bonusPontsList)
          setProgramPointsList(APIResponse.data.programPointsList)
          setLoader(false)

        } else {
          setLoader(false)
        }
      }
      catch (error) {
        setLoader(false)
        SimpleToast.show(error.message)
      }
    } else {
      setLoader(false)
      // Alert.alert("NO INTER NENT")
      SimpleToast.show(translate("no_internet_conneccted"))
    }
  }



  return (

    <RnView style={RnStyles.mainContainer}>

      <RnView style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
       
        {/* <RnView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }}>
          <RnView style={RnStyles.headerContentContainer}>
            <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("reward")}</Text>
          </RnView>
        </RnView> */}

         <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
        <RnView style={RnStyles.headerContentContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <RnImage source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor, marginLeft:20 }]} />
          </TouchableOpacity>
          <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate("reward")}</Text>
          {/* <Text style={{ fontWeight:"600",fontSize:RFValue(25,height),color: dynamicStyles.secondaryColor,width:40 }}>
            {translate("₹")}
          </Text> */}
          <RnView style={{width:40}}/>
        </RnView>
        </SafeAreaView>
       

        <RnView style={{ flexDirection: "row", marginTop: height * 0.025, paddingStart : 25 }}>
          <TouchableOpacity onPress={() => setSelectedTab(translate("promotions"))}
            style={[{ paddingHorizontal: 10, paddingBottom: 5 }, selectedTab === translate("promotions") && { borderBottomWidth: 2, borderColor: dynamicStyles.secondaryColor }]}>
            <Text style={{ fontSize: RFValue(14, height), color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }}>{translate("Bonus_Points")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() =>
            setSelectedTab(translate("how_to_earn_bonus_Points"))
          } style={[{ paddingHorizontal: 10, paddingBottom: 5 }, selectedTab === translate("how_to_earn_bonus_Points") && { borderBottomWidth: 2, borderColor: dynamicStyles.secondaryColor }]}>
            <Text style={{ fontSize: RFValue(14, height), color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }}>{translate("how_to_earn_bonus_Points")}</Text>
          </TouchableOpacity>
        </RnView>
      </RnView>

      {selectedTab === translate("promotions") ? (
        <RnView style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <RnView style={{ backgroundColor: "#fff", borderRadius: 10, width: "100%", maxHeight: height * 0.73, paddingBottom: 10 }}>
            <RnView style={{ marginTop: 15, flexDirection: "row", width: "90%", alignSelf: "center", backgroundColor: "#FFF1F2", borderRadius: 10 }}>
              {/* <TouchableOpacity onPress={()=>tabsHandle(true)}
               style={{alignItems:"center",justifyContent:"center",backgroundColor:tabSelections?dynamicStyles.primaryColor:"#FFF1F2",
               width:"50%",borderRadius:10,
               height:height*0.055}}>
                <Text style={[RnStyles.tabsText,{color:tabSelections?dynamicStyles.secondaryColor:"#000"}]}>{translate("Bonus_Points")}</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={()=>tabsHandle(false)}  
              style={{backgroundColor:!tabSelections?dynamicStyles.primaryColor:"#FFF1F2",borderRadius:10,alignItems:"center",justifyContent:"center",width:"50%",
              height:height*0.055}}>
                <Text style={[RnStyles.tabsText,{color:!tabSelections?dynamicStyles.secondaryColor:"#000"}]}>{translate("Program_Points")}</Text>
              </TouchableOpacity> */}
            </RnView>

            {tabSelections ?

              <>
                {!loader &&
                  <RnView style={{ marginBottom: 55 }}>
                    <RnFlatList ListEmptyComponent={() => <Text style={{ color: "#000", fontFamily: fonts.Bold, fontSize: RFValue(17, height), alignSelf: "center", marginTop: 15 }}>{translate("No_data_available")}</Text>}
                      data={bonusPromotionsList}
                      renderItem={renderBounusList}
                      ListFooterComponent={<RnView style={{ height: responsiveHeight(1) }} />}
                    />
                  </RnView>

                }
              </>

              :

              <Text style={{ color: "#000", fontFamily: fonts.Bold, fontSize: RFValue(17, height), alignSelf: "center", marginTop: 15 }}>{translate("No_data_available")}</Text>}





          </RnView>
        </RnView>

      ) : (
        <RnView style={{ alignItems: "center", height: "90%", marginTop: 10 }}>
          <RnView
            style={{ backgroundColor: "#FFF9F9", borderRadius: 15, width: "90%", alignSelf: "center", paddingHorizontal: 15, paddingVertical: 10, maxHeight: "80%" }}
          > 
            <Text style={{ color: "#ED3237", fontSize: RFValue(15, height), fontFamily: fonts.SemiBold, lineHeight: 20 }}>
              {translate("new_referral_text")}
            </Text>
           
            <RnView style={{ marginTop: 20, marginBottom: 55 }}>
              <RnFlatList
                // data={data}
                data={rewardsData}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={renderHowToEarn}
                nestedScrollEnabled={true}
                ListEmptyComponent={() => <Text style={{ color: "#000", fontFamily: fonts.SemiBold, fontSize: RFValue(17, height), alignSelf: "center", marginTop: 15 }}>{translate("No_data_available")}</Text>}

              />
            </RnView>
          </RnView>
          <Text style={{ fontSize: RFValue(16, height), fontFamily: fonts.SemiBold, color: "#000", textAlign: "center", width: "100%", marginTop: 10 }}>{translate('cashback_text')}</Text>
        </RnView>
      )}

      {loader && <PreLoginCustomLoader />}
    </RnView>
    // </Box>
  );
};

export default RewardsScreen;

const RnStyles = StyleSheet.create({
  promotionsCard: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 10, marginTop: 10,
    backgroundColor: "#FBFBFB"
  },

  promotionTopCard: {
    backgroundColor: "#FFF1F2",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    flexDirection: "row"
  },

  labelPromotions: {
    fontSize: RFValue(12, height),
    color: "#000000",
    lineHeight: 25
  },

  labelPromotions2: {
    fontSize: RFValue(12, height),
    color: "#000000",
    flexShrink: 1,     // Allow it to shrink if needed
    // flexWrap: 'wrap',
    // width:"60%",
    // lineHeight:30,
    // numberOfLines: 1,
    ellipsizeMode: 'tail',
    // lineHeight:25
    // lineHeight:30
  },

  labelPromotions3: {
    fontSize: RFValue(12, height),
    color: "#000000",
    lineHeight: 25
  },

  tabsText: {
    fontWeight: "500",
    fontSize: RFValue(15, height)
  },

  mainContainer: {
    backgroundColor: "#F2F6F9",
    flex: 1,
    width: "100%"
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
    fontSize: RFValue(16, height),
    alignSelf: "center",
    // lineHeight: 30
  },

  timerImg: {
    height: 30,
    width: 30,
    resizeMode: "contain"
  },
  flowerImg: {
    position: "absolute",
    top: height * 0.04,
    right: 40,
    height: 50,
    width: 100,
    tintColor: "#000",
    resizeMode: "contain"
  },

  headerMainContainer: {
    // paddingTop: 20,
    // paddingHorizontal: 10,
    height: height * 0.10
  },

});

