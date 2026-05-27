import {
  Text,
  useWindowDimensions,
  View,
  Image as RnImage,
  Pressable,
  StatusBar,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Styles } from '../styles/Styles';
import { useSelector } from 'react-redux';
import { GetApiHeaders } from '../utils/helpers';
import moment from 'moment';
import Share from 'react-native-share';
import usePostRequestWithJwt from '../api/usePostRequestWithJwt';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { LineChart } from "react-native-chart-kit";
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import SimpleToast from 'react-native-simple-toast';
import { CustomCommonModal } from "../components/CustomCommonModal";
import { useFontStyles } from '../hooks/useFontStyles';


const CropDetailsScreen = ({ route }) => {
  const fonts=useFontStyles()
  const viewShotRef = useRef();
  const navigation = useNavigation()
  console.log("sap=-=-=->", route)
  const currentTheme = useSelector(state => state.theme.theme);
  const styles = Styles(currentTheme);
  const { id, minPrice, maxPrice, variety, modal_price, createdOn, lastUpdateTime, marketName, name, cropImage, location, productImage, origin } = route.params;
  const { width, height } = useWindowDimensions();
  const displayImage = origin === "Home" ? productImage : cropImage;
  const { sendData } = usePostRequestWithJwt();
  const [graphData, setGraphData] = useState(null);
  const [loader, setLoader] = useState(false)
  const [apiRequestType, setApiRequestType] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [alertModal, setAlertModal] = useState(false)
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const isConnected = useSelector(state => state.network.isConnected);

  const buttonStyle = (period) => {
    return {
      backgroundColor: period === selectedPeriod ? dynamicStyles.primaryColor : "transparent",
      padding: 10,
      borderRadius: 5,
    };
  };

      const alertCloseHandle = () => {
        setAlertModal(false)
    }

  const buttonTextStyle = (period) => {
    return {
      color: period === selectedPeriod ? dynamicStyles.secondaryColor : "#000",
      fontSize: period === selectedPeriod ? RFValue(14, height) : RFValue(13, height),
      fontFamily:fonts.Bold,
      lineHeight: 20
    };
  };

  const handleAPICall = async (requestType, payload) => {
    setLoader(true)
    setGraphData(null)
    const url = APIConfig.BASE_URL + APIConfig.AUTH.CHART_V1;
    const headers = await GetApiHeaders();
    setApiRequestType(requestType);
    if(isConnected){
   try {
      const response = await sendData(url, payload, headers, false);
      console.log("reapapI=-=->",JSON.stringify(response.data))
      if (response.statusCode === HTTP_OK) {
        if(response?.data?.response?.labels.length>0){
        setGraphData(response?.data?.response)
        }else{
          SimpleToast.show(translate("No_data_available"))
        }
      }
      else {
        SimpleToast.show(response.message != "" ? response.message : translate("No_More_Data"))
      }
      setLoader(false)
    } catch (e) {
      setLoader(false)
      console.log("API error:", e.message);
    }
    }else{
      SimpleToast.show(translate("please_check_connection"))
      setLoader(false)
      // setAlertModal(true)
    }
 
  };
  console.log("selectedPeriod=-=-1>",selectedPeriod)

  useEffect(() => {
    const object = {
      state:dynamicStyles?.state?dynamicStyles?.state:"",
      district: "",
      crop:name?name: "",
      type: selectedPeriod === "week" ? "W" : selectedPeriod === "month" ? 'M' : 'Y',
    };
    console.log("obejctPayload=-=->",object)
    handleAPICall("CROP DATA REQUEST", object);
  }, [selectedPeriod]);


  useEffect(() => {
    setSelectedPeriod("week");
  }, []);


  const handleShare = async () => {
    const uri = await viewShotRef.current.capture();
    const shareOptions = {
      title: 'Share via',
      message: ``,
      url: uri,
      // social: Share.Social.WHATSAPP,
    };

    try {
      await Share.open(shareOptions);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Share Error:', error);
      }
    }

  };

  return (
    <ScrollView>
    <ViewShot
      ref={viewShotRef} style={{
        flex: 1
      }}
      captureMode="mount"
      onCapture={() => {
        console.log("do something with ");
      }}
      options={{ format: 'jpg', quality: 0.9 }}>
      <View style={{ backgroundColor: "#F2F6F9", flex: 1 }}>
        {Platform.OS === 'android' && (
          <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />
        )}

        <View style={{ width: "100%" }}>
          <View>
          <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: dynamicStyles.primaryColor, height: 50, paddingLeft: 10 }]}>
              <Pressable onPress={() => { navigation.goBack() }}>
                <RnImage
                  tintColor={dynamicStyles.secondaryColor}
                  source={require('../../assets/Images/backIconTrans.png')}
                  style={{ height: 30, width: 30, resizeMode: "contain" }}
                />
              </Pressable>
              <Text style={[
                // styles.fontSize_20, 
                // styles.centerContent,
                // styles.marginRight_10,
                { color: '#fff', fontSize: RFValue(22, height), fontFamily:fonts.Bold}
              ]}>
                {name}
              </Text>
              <View style={{ width: 60 }} />
            </View>
            </SafeAreaView>
          </View>
          <View style={{ alignItems: 'center' }}>
            {displayImage ? (
              <RnImage
                source={{ uri: displayImage }}
                style={[styles.height_200, styles.widthPct_100]}
              />
            ) : (
              <Text style={{fontFamily:fonts.SemiBold,fontSize:14,color:"#000"}}>{translate('No_Image_Available')}</Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: "space-between", paddingHorizontal: 20 }}>
          <Text style={[{ fontSize: RFValue(18, height), textAlign: "center",fontFamily:fonts.Bold, color: dynamicStyles.textColor }]}>{marketName}</Text>
          <Pressable onPress={handleShare}>
            <RnImage
              source={require('../../assets/Images/share.png')}
              style={{ height: 30, width: 30, resizeMode: "contain", tintColor: dynamicStyles.primaryColor }}
            />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, marginVertical: 5 }}>
          <View style={[
            {
              backgroundColor: "#F2F6F9",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              borderRadius: 10,
            }
          ]}>
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.widthPct_33]}>
                <Text style={{ fontSize: RFValue(12, height), textAlign: "center", fontFamily:fonts.Regular, color: dynamicStyles.textColor, lineHeight: 20 }}>
                  {translate('min_price')}
                </Text>
                <Text style={[{ fontSize: RFValue(14, height), textAlign: "center", fontFamily:fonts.SemiBold,  color: dynamicStyles.textColor }]} numberOfLines={1}>
                  ₹{minPrice}
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: '#c8c8c8', marginVertical: 5 }} />

              <View style={[styles.widthPct_33]}>
                <Text style={[{ fontSize: RFValue(12, height), textAlign: "center", fontFamily:fonts.Regular, color: dynamicStyles.textColor, lineHeight: 20 }]}>
                  {translate('max_price')}
                </Text>
                <Text style={[{ fontSize: RFValue(14, height), textAlign: "center", fontFamily:fonts.SemiBold, color: dynamicStyles.textColor }]} numberOfLines={1}>
                  ₹{maxPrice}
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: '#c8c8c8', marginVertical: 5 }} />

              <View style={[styles.widthPct_33]}>
                <Text style={[{ fontSize: RFValue(12, height), textAlign: "center", fontFamily:fonts.Regular, color: dynamicStyles.textColor, lineHeight: 20 }]}>
                  {translate('market_price')}
                </Text>
                <Text style={[ styles.textColor_green, styles.textAlignCenter,{fontSize:16,fontFamily:fonts.SemiBold}]} numberOfLines={1}>
                  ₹{maxPrice}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#c8c8c8', marginVertical: 8 }} />

            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.widthPct_33, styles.padding_5]}>
                <Text style={[{ fontSize: RFValue(12, height), textAlign: "center",fontFamily:fonts.Regular, color: dynamicStyles.textColor, lineHeight: 20 }]}>
                  {translate('commodity')}
                </Text>
                <Text style={[{ fontSize: RFValue(14, height), textAlign: "center",fontFamily:fonts.SemiBold, color: dynamicStyles.textColor }]}>
                  {name}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#c8c8c8', marginVertical: 5 }} />
              <View style={[styles.widthPct_33, styles.padding_5]}>
                <Text style={[{ fontSize: RFValue(12, height), textAlign: "center",fontFamily:fonts.Regular, color: dynamicStyles.textColor, lineHeight: 20 }]}>
                  {translate('variety')}
                </Text>
                <Text style={[{ fontSize: RFValue(14, height), textAlign: "center",fontFamily:fonts.SemiBold, color: dynamicStyles.textColor }]}>
                  {name}
                  </Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#c8c8c8', marginVertical: 5 }} />
              <View style={[styles.widthPct_33, styles.padding_5]}>
                <Text style={[{ fontSize: RFValue(12, height), textAlign: "center",fontFamily:fonts.Regular, color: dynamicStyles.textColor, lineHeight: 20 }]}>
                  {translate('Arrival_Date')}
                </Text>
                <Text style={[{ fontSize: RFValue(14, height), textAlign: "center",fontFamily:fonts.SemiBold, color: dynamicStyles.textColor }]} numberOfLines={1}>
                  {moment().format('DD-MM-YYYY')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.marginTop_5]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={buttonStyle("week")}
              onPress={() => setSelectedPeriod("week")}
            >
              <Text style={buttonTextStyle("week")}>
                {translate('this_week')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={buttonStyle("month")}
              onPress={() => setSelectedPeriod("month")}
            >
              <Text style={buttonTextStyle("month")}>
                {translate('this_month')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={buttonStyle("year")}
              onPress={() => setSelectedPeriod("year")}
            >
              <Text style={buttonTextStyle("year")}>
                {translate('this_year')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        <View style={{justifyContent: 'center',}}>
          {graphData !== null && graphData?.labels?.length > 0 &&
            <LineChart
              data={{
                labels: graphData?.labels?.reverse(),
                datasets: [
                  {
                    data: graphData?.maxPrices?.reverse(), // Maximum Price
                    color: () => 'rgba(17, 172, 53, 1)',
                    strokeWidth: 2,
                  },
                  {
                    data: graphData?.minPrices?.reverse(), // Minimum Price
                    color: () => 'rgba(216, 193, 27, 1)',
                    strokeWidth: 2,
                  },
                ],
              }}
              width={responsiveWidth(85)}
              height={300}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                },
              }}
              style={{
                marginTop: 8,
                borderRadius: 16,
                alignSelf: "center",
              }}
            />}
          {loader &&
            <View style={{ position: "absolute", alignSelf: "center", justifyContent: "center", top : 30 }}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>}
        </View>
      </View>
      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={translate("please_check_connection")}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}
      />
    </ViewShot>
  </ScrollView>


  );
}

export default CropDetailsScreen;