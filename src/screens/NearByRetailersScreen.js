import { Alert, Linking, Pressable, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, FlatList, StatusBar, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Styles } from '../styles/Styles';
import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from 'react-native-responsive-fontsize';
import { CustomCommonModal } from '../components/CustomCommonModal';
import { useFontStyles } from '../hooks/useFontStyles';
const { height } = Dimensions.get("window")

const NearByRetailersScreen = ({ navigation, route }) => {
  const fonts = useFontStyles()
  const { mobileNumber, latitude, longitude, distance, filterString } = route.params;
  const currentTheme = useSelector(state => state.theme.theme);
  const styles = Styles(currentTheme);
  const { fetchData } = useGetRequestWithJwt();
  const [loader, setLoader] = useState(false);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const [retailers, setRetailers] = useState([]);
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")
  const API_URL = `${APIConfig.BASE_URL}${APIConfig.NEARBYRTAILERS}latitude=${latitude}&longitude=${longitude}&distance=${distance}&filterString=${filterString}&mobileNumber=${mobileNumber}`;

  useEffect(() => {
    const fetchRetailers = async () => {
      setLoader(true); // Start loader before fetching

      try {
        const headers = await GetApiHeaders(); // Get JWT token headers
        console.log("Headers used:", headers);

        const rawData = await fetchData(API_URL, headers);

        if (!rawData || !rawData.data || !rawData?.data?.NearByRetailersList) {
          console.error("Invalid API response structure.");
          return;
        }

        const retailerList = rawData?.data?.NearByRetailersList; // Extract list

        if (!Array.isArray(retailerList)) {
          console.error("NearByRetailersList is not an array:", retailerList);
          return;
        }

        setRetailers(retailerList); // Update state with valid array
      } catch (error) {
        console.error("Error fetching retailer data:", error);
      } finally {
        setLoader(false); // Stop loader after fetching
      }
    };

    fetchRetailers();
  }, [latitude, longitude, distance, filterString, mobileNumber]);



  const alertCloseHandle = () => {
    setAlertModal(false)
  }

  const handleCall = (mobileNumber) => {
    if (!mobileNumber) {
      setAlertModal(true)
      setAlertTextContent(translate("Invalid_phone_number"))

      return;
    }

    const phoneUrl = `tel:${mobileNumber}`; // Correct format for opening the dialer

    Linking.openURL(phoneUrl).catch(err => {
      console.error("Error opening dialer", err);
      setAlertModal(true)
      setAlertTextContent(translate("Could_not_open_the_dialer"))
    });
  };

  const openWhatsApp = (mobileNumber) => {
    if (!mobileNumber) {
      setAlertModal(true)
      setAlertTextContent(translate("Invalid_phone_number"))
      return;
    }

    const whatsappUrl = `whatsapp://send?phone=${mobileNumber}`;

    Linking.openURL(whatsappUrl).catch(() => {
      setAlertModal(true)
      setAlertTextContent(translate("WhatsApp_is_not_installed_on_this_device"))
    });
  };

  const handleOpenMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url).catch(err => {
      console.error("Error opening map", err);
      setAlertModal(true)
      setAlertTextContent(translate("Unable_to_open_the_map_application"))
    });
  };

  return (
    <View style={[styles.flexFull, { backgroundColor: "#F2F6F9" }]}>
      {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}

      <View style={[{
        paddingTop: 20,
        paddingHorizontal: Platform.OS == "ios" ? 0 : 20,
        height: Platform.OS == "ios" ? 100 : 80, backgroundColor: dynamicStyles.primaryColor,
        marginBottom: Platform.OS === 'ios' ? 15 : 0
      }]}>
        <View style={{ backgroundColor: dynamicStyles.primaryColor, paddingBottom: Platform.OS === 'ios' ? 10 : 0 }} edges={['top']}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: Platform.OS === 'ios' ? 15 : 0 }}>
              <Image source={require('../../assets/Images/BackIcon.png')} style={[{
                height: 40,
                width: 40,
                resizeMode: "contain", tintColor: dynamicStyles.secondaryColor
              }]} />
            </TouchableOpacity>
            <Text style={[{
              fontSize: RFValue(16, height),
              fontFamily: fonts.SemiBold,
              alignSelf: "center",
              color: dynamicStyles.secondaryColor
            }]}> {translate('Nearby_RetailersList')}</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
      </View>




      <View style={{ maxHeight: "85%" }}>
        <FlatList
          data={retailers}
          keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            return (
              // <Center>
              <Pressable style={{
                alignSelf: "center", marginTop: 10,
                borderRadius: 15, borderColor: "#000", width: "90%"
              }}>

                {/* <Box
                      style={[styles.height_65, styles.width_335, { backgroundColor: "#E31E2512" }]} borderTopRadius={15} > */}
                <View style={{ backgroundColor: "#E31E2512", width: "100%", borderTopLeftRadius: 15, borderTopRightRadius: 15, flexDirection: "row", justifyContent: "space-between" }}>
                  {/* <HStack> */}
                  <View style={{ flexDirection: "row", paddingTop: 5, paddingLeft: 5, width: "80%" }}>

                    <View style={{ width: 50, height: 50, borderRadius: 7, backgroundColor: "#D9D9D9", alignItems: "center", justifyContent: "center" }}>
                      <Image style={{ height: 20, width: 20, resizeMode: "contain" }} source={require("../../assets/Images/personimgicon.png")} />
                    </View>
                    <View style={{ marginLeft: 10, width: "75%" }}>
                      {item?.name &&
                        <Text style={{ color: "#000", fontSize: RFValue(14, height), lineHeight: 30, fontFamily: fonts.SemiBold }}>{item?.name}</Text>
                      }
                      {item?.mobileNumber &&
                        <Text style={{ color: "#00000099", fontSize: RFValue(12, height), lineHeight: 25, fontFamily: fonts.Regular }}>{item?.mobileNumber}</Text>
                      }
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Pressable style={{ backgroundColor: "#0D99FF", borderRadius: 30, height: 30, width: 30, justifyContent: "center", alignItems: "center" }} onPress={() => handleCall(item?.mobileNumber)}>
                      {/* <View style={[styles.margin_3]}> */}
                      <Image style={{ height: 20, width: 20, resizeMode: "contain" }} source={require('../../assets/Images/callIconNew.png')} />
                      {/* </View> */}
                    </Pressable>

                    <Pressable style={{ marginHorizontal: 5 }} onPress={() => openWhatsApp(item?.mobileNumber.length == 10 ? "+91" + item?.mobileNumber : item?.mobileNumber)}>
                      {/* <View style={[styles.margin_3]}> */}
                      <Image style={{ height: 30, width: 30, resizeMode: "contain" }} source={require('../../assets/Images/whatsappkn.png')} />
                      {/* </View> */}
                    </Pressable>
                  </View>

                  {/* </Text> */}
                </View>
                {/* </Box> */}

                {/* Bottom Section */}
                {/* <Box style={[styles.white_bg, styles.marginTop_5]} borderBottomRightRadius={15} borderBottomLeftRadius={15} > */}
                <View style={{ backgroundColor: "#fff", borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: "row", paddingVertical: 5 }}>
                  {/* <HStack style={[styles.margin_8]} justifyContent={"space-evenly"}> */}
                  <View style={{ borderRightWidth: 1, borderColor: "#0000000F", width: "25%", paddingVertical: 10, paddingLeft: 5 }}>
                    <Text style={{ color: "#000000", fontSize: RFValue(12, height), fontFamily: fonts.Regular }}>{translate('distance_nearby')}</Text>
                    {item?.distance &&
                      <Text style={{ color: "#000000", fontSize: RFValue(14, height), fontFamily: fonts.SemiBold }}>{item?.distance}</Text>
                    }
                  </View>

                  {/* <Divider bg="gray.100" thickness="2" mx="2" orientation="vertical" /> */}

                  <View style={{ width: "25%", paddingVertical: 10, paddingLeft: 5 }}>
                    <Text style={{ color: "#000000", fontSize: RFValue(12, height), fontFamily: fonts.Regular }}>{translate('Territory')}</Text>
                    {item?.territory &&
                      <Text style={{ color: "#000000", fontSize: RFValue(14, height), fontFamily: fonts.SemiBold }}>{item?.territory}</Text>
                    }
                  </View>

                  {/* <Divider bg="gray.100" thickness="2" mx="2" orientation="vertical" /> */}

                  <View style={{ borderRightWidth: 1, borderLeftWidth: 1, borderColor: "#0000000F", width: "25%", paddingVertical: 10, paddingLeft: 5 }}>
                    <Text style={{ color: "#000000", fontSize: RFValue(12, height), fontFamily: fonts.Regular }}>{translate('Pincode_nearby')}</Text>
                    {item?.pincode &&
                      <Text style={{ color: "#000000", color: 'red', fontSize: RFValue(14, height), fontFamily: fonts.SemiBold }}>{item?.pincode}</Text>
                    }
                  </View>

                  <Pressable onPress={() => handleOpenMap(item.latitude, item.longitude)} style={{ justifyContent: "center", alignItems: "flex-end", width: "25%", paddingRight: 10 }}>
                    <View>
                      <Image source={require("../../assets/Images/directionIcon.png")} style={{ height: 25, width: 25, resizeMode: "contain" }} />
                    </View>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: "#000", fontFamily: fonts.Bold, fontSize: RFValue(17, height), alignSelf: "center", marginTop: Platform.OS === 'ios' ? 100 : 15 }}>{translate("No_data_available")}</Text>
          }
        />

      </View>

      {loader && <PreLoginCustomLoader />}

      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}

      />
    </View>
  )
}

export default NearByRetailersScreen

const styles = StyleSheet.create({})