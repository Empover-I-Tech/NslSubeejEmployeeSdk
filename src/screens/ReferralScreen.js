import { StyleSheet, Text, TouchableOpacity, Dimensions, View, FlatList, TextInput, Image, StatusBar, PermissionsAndroid, Platform, SectionList, Alert, TouchableWithoutFeedback, Modal, SafeAreaView } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Styles } from "../styles/Styles";
import { translate } from "../Localization/Localisation";
import Contacts from "react-native-contacts";
import Share from "react-native-share";
import { Linking } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { REFERRALCODE } from "../utils";
import { getFromAsyncStorage } from "../utils/keychainUtils";
import APIConfig, { HTTP_OK } from "../api/APIConfig";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import { GetApiHeaders } from "../utils/helpers";
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import SearchInput from "../components/CustomSearchTextInput";
import { ScrollView } from "react-native-gesture-handler";
import { CustomCommonModal } from '../components/CustomCommonModal';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from "../hooks/useFontStyles";
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
const { width, height } = Dimensions.get('window');


const ReferralScreen = ({ navigation, route }) => {
  const fonts=useFontStyles()
  const currentTheme = useSelector((state) => state.theme.theme);
  const isConnected = useSelector((state) => state.network.isConnected);
  // const statusBarColor = useColorModeValue(
  //   currentTheme.white,
  //   currentTheme.darkBackground
  // );
  const dynamicStyles = useSelector(
    (state) => state.companyStyles.companyStyles
  );
  const styles = Styles(currentTheme);
  const [contacts, setContacts] = useState([]);
  const [contactsList1, setContactsList1] = useState([]);
  const sectionListRef = useRef(null);
  const [selectId, setSelectId] = useState("")
  const [selectedContactNum, setSelectedContactNum] = useState("")
  const [referalCode, setReferalCode] = useState("")
  const [successMssgVisible, setSuccessMssgVisible] = useState(false)
  const [successMssg, setSuccesMssg] = useState("")
  const [loaderApi, setLoaderApi] = useState(false)
  const { postData, loading, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
  const [searchValue, setSearchValue] = useState("")
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")





  // Scroll to the section when an alphabet is clicked

  useEffect(() => {
    const getContacts = async () => {
      let permissionGranted = false;
      if (Platform.OS === "android") {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
  
        if (permission === PermissionsAndroid.RESULTS.GRANTED) {
          permissionGranted = true;
        } else {
                     Alert.alert(
                  translate("permission_required"),
                  translate("ContactPermission"),
                  [
                    { text:translate("cancel"), style: 'cancel' },
                    {
                      text:translate("open_settings"),
                      onPress: () => Linking.openSettings(),
                    },
                  ]
                );
          return; // Don't proceed
        }
      } else if (Platform.OS === "ios") {
        const status = await check(PERMISSIONS.IOS.CONTACTS);
  
        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          permissionGranted = true;
        } else if (status === RESULTS.DENIED) {
          const requestStatus = await request(PERMISSIONS.IOS.CONTACTS);
          if (requestStatus === RESULTS.GRANTED || requestStatus === RESULTS.LIMITED) {
            permissionGranted = true;
          } else {
            Alert.alert(
              translate("permission_required"),
              translate("ContactPermission"),
              [
                { text: translate("cancel"), style: 'cancel' },
                {
                  text: translate("open_settings"),
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
            return;
          }
        } else {
          // BLOCKED or restricted
          Alert.alert(
            translate("permission_required"),
            translate("ContactPermission"),
            [
              { text: translate("cancel"), style: 'cancel' },
              {
                text: translate("open_settings"),
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return;
        }
      }
  
      if (!permissionGranted) return;
  
      // Fetch contacts
      Contacts.getAll()
        .then((contactsList) => {
          const validContacts = contactsList.filter((contact) => contact.phoneNumbers.length > 0);
  
          let finalContacts = validContacts;
  
          if (Platform.OS === 'ios') {
            finalContacts = validContacts.map((contact) => {
              const displayName = [
                contact.givenName,
                contact.middleName,
                contact.familyName,
              ]
                .filter(Boolean)
                .join(' ')
                .trim();
  
              return {
                ...contact,
                displayName: displayName || 'Unknown',
              };
            });
          }
  
          const sortedContacts = finalContacts.sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          );
  
          const groupedContacts = sortedContacts.reduce((acc, contact) => {
            const firstLetter = contact.displayName[0]?.toUpperCase() || '#';
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(contact);
            return acc;
          }, {});
  
          const sections = Object.keys(groupedContacts)
            .sort()
            .map((letter) => ({
              title: letter,
              data: groupedContacts[letter],
            }));
  
          setContacts(sections);
          setContactsList1(sections);
        })
        .catch((error) => console.log("Error fetching contacts:", error));
    };
  
    getContacts();
    fetchReferralCode();
  }, []);

  const alertCloseHandle = () => {
    setAlertModal(false)
    // setQRActivate(true);

  }



  const fetchReferralCode = async () => {
    try {
      const referralCode = await getFromAsyncStorage(REFERRALCODE);
      console.log("reffer data", referralCode);
      setReferalCode(referralCode)

    } catch (error) {
      console.error("Error fetching referral code:", error);
    }
  };

  const scrollToSection = (letter) => {
    const sectionIndex = contacts.findIndex((section) => section.title === letter);
    if (sectionListRef.current && sectionIndex !== -1) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  // const toggleContactSelection = (contact) => {
  //   console.log("apsopao=-=->", contact.phoneNumbers)
  //   if (contact?.phoneNumbers) {
  //     setSelectId(contact.recordID)
  //     setSelectedContactNum(contact.phoneNumbers[0]?.number)
  //   } else {
  //     Alert.alert(translate("No_Number_fetching"))
  //   }
  // };
  const toggleContactSelection = (contact) => {
    console.log("Toggled contact:", contact.displayName, "Current selectId:", selectId);
    if (contact?.phoneNumbers && contact.phoneNumbers.length > 0) {
      if (selectId === contact.recordID) {
        console.log("Unselecting contact:", contact.displayName);
        setSelectId("");
        setSelectedContactNum("");
      } else {
        console.log("Selecting contact:", contact.displayName, "Phone:", contact.phoneNumbers[0]?.number);
        setSelectId(contact.recordID);
        setSelectedContactNum(contact.phoneNumbers[0]?.number);
      }
    } else {
      Alert.alert(translate("No_Number_fetching"));
    }
  };

  const sendWhatsAppInvite = () => {
    const storeSubeejSaral = Platform.OS === 'ios' ? 'https://apps.apple.com/us/app/subeej-saral/id6748138800' : `https://play.google.com/store/apps/details?id=com.nsl.subeejsaral`;
    const message = `
*${translate("Namaste_Kisan_Bhai")}👋

*${translate("Smart_farming_is_just_an_app_away")} 🌱📲

${translate("Download_the_Subeej_Saral_App_for")}
✅ ${translate("Complete_info_from_seeds_to_market")}
✅ ${translate("Live_weather_mandi_updates")}

${translate("Don_miss_out")} 🚀
${translate("Click_the_link_below_and_install_now")}
${storeSubeejSaral}
`;
    const formattedPhone = selectedContactNum.replace(/[^+\d]/g, ''); // Keep digits only
    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url)
      .then(() => console.log(`Opened WhatsApp for ${formattedPhone}`))
      .catch((error) => {
        console.error("Error opening WhatsApp:", error);
        // Alert.alert(translate("Error"), `Could not open WhatsApp for ${formattedPhone}`);
        setAlertModal(true)
        setAlertTextContent(translate("couldNotOpenWhatsApp"))
      });
  };


  const fetchDataBasedOnDate = async () => {
    setLoaderApi(true)
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.farmerId = Number.parseInt(headers.userId)
        headers.authType = "JSONREQUEST"
        const payload = {
          "id": 0,
          "referralMobileNumber": selectedContactNum,
          "status": true
        }

        const url = APIConfig.BASE_URL + APIConfig.referralsaveReferDetails
        const response = await sendData(url, payload, headers, false);
        console.log("KIRAKALKSLAKSALSK=-==-=>", response.data.message)
        console.log("headers=-==-=>", headers)
        setTimeout(() => {
          setLoaderApi(false);
        }, 500);
        if (response.data.statusCode === 200) {
          setTimeout(() => {
            SimpleToast.show((response?.data?.message != undefined && response?.data?.message != null) ? response?.data?.message : translate("success"), SimpleToast.LONG);
          }, 1000);
         setTimeout(() => {
          closeSuccesMssgModal()
         }, 1500);
        } else {
          setTimeout(() => {
            SimpleToast.show((response?.data?.message != undefined && response?.data?.message != null) ? response?.data?.message : translate("Something_went_wrong"), SimpleToast.LONG);
          }, 1000);

        }
        // // if (response?.statusCode === HTTP_OK) {
        //   setSuccesMssg(response.data.message)
        //   // setSuccessMobileNumber(response.data.MobileNumber)
        // SimpleToast.show(response.data.message,SimpleToast.LONG());

        //   // setSuccessMssgVisible(true)
        // setLoaderApi(false)
        //   closeSuccesMssgModal()

        //   // setSelectCrops(translate("select_crop"))
        // setSelectHybrid(translate("Select_Hybrid_Variety"))
        // setQuantityInput("")
        // setSelectedDate(translate("Select_Date"))

        // } else {
        //   setLoaderApi(false)

        //   Alert.alert(translate("Error"), translate("Unable_to_fetch_issue_details"));
        // }
      } catch (error) {
        setLoaderApi(false)

        // console.error("Error fetching data:", error);
        // Alert.alert(translate("Error"), translate("An_unexpected_error_occurred_Please_try_again"));
      }
    } else {
      setLoaderApi(false)
      setAlertModal(true)
      setAlertTextContent(translate("Unable_submit_again"))

    }


  };

  const closeSuccesMssgModal = () => {
    sendWhatsAppInvite()
    setSelectedContactNum("")
    setSelectId("")
    setSuccessMssgVisible(false)
  }


  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const loadContacts = (result) => {
    console.log("result", result)
    setContacts(result)
  }

  return (
    <View style={[styles.flexFull, { backgroundColor: "#F2F6F9" }]}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={dynamicStyles.primaryColor}
          barStyle={currentTheme.statusBar}
        />
      )}
      <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[Mystyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
        <View style={Mystyles.headerContentContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/Images/BackIcon.png')} style={[Mystyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
          </TouchableOpacity>
          <Text style={[Mystyles.bookSeedsText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate("referral")}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Image source={require('../../assets/Images/flowerIcon.png')} style={Mystyles.flowerImg} />
      </View>
      </SafeAreaView>

      <View style={{ width: "98%", height: '80%', margin: 10, justifyContent: "center", alignSelf: "center" }}>
        <ScrollView
          scrollEnabled={true}
          style={{ margin: 5 }}>
          <View
            style={[styles.white_bg, {
              width: "98%", alignItems: 'center',
              justifyContent: "center", alignSelf: "center"
            }]}
            borderRadius={15}
          >

            <Text
              style={[
                
                styles.textColorBlack,
                { justifyContent: "center", alignSelf: 'center',fontFamily:fonts.SemiBold},
              ]}>
              {translate('refer_and_earn_bonus_points')}
            </Text>
            <Image
              resizeMode="cover"
              style={{ height: 120, width: "90%" }}
              source={require("../../assets/Images/ReferralImg.png")}
              accessibilityLabel="Referral Icon"
            />
            <Text
              style={[
                
                { color: dynamicStyles.textColor,fontFamily:fonts.SemiBold},
              ]}
            >
              {translate("invitenow")}
            </Text>

            <Text
              style={[
                styles.textAlignCenter,
              
                {
                  color: dynamicStyles.textColor,
                  fontFamily:fonts.SemiBold,
                  fontSize:12,
                  width: "80%"
                },
              ]}
            >
              {translate("referral_text")}
            </Text>

            <TouchableOpacity
              style={[styles.height_44, styles.width_315, styles.marginBottom_10,
              {
                backgroundColor: dynamicStyles.primaryColor, justifyContent: "center", alignItems: "center",
                borderRadius: 10, marginTop: 8
              }]}>
              <Text style={[ styles.centerContent,{ color: dynamicStyles.secondaryColor, fontFamily:fonts.SemiBold,fontSize:12}]}>{translate('add_from_phonebook')}</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={[{ color: "#000", marginTop: 10 ,fontSize:16,fontFamily:fonts.SemiBold}]}>{translate("Contacts")}</Text>
            {contactsList1.length > 0 &&
              <View style={{ width: "98%",marginVertical:10 }}>
                <SearchInput
                  data={contactsList1}
                  righticonSource={require('../../assets/Images/SearchingImg.png')}
                  lefticonSource={require('../../assets/Images/crossIcon.png')}
                  placeholder={translate('search_hint')}
                  iconSource={require('../../assets/Images/SearchingImg.png')}
                  keys={['displayName']}
                  onSearchResult={(result) => { setContacts(result) }}
                />
              </View>}
            {contactsList1.length > 0 && contacts.length === 0 && (
              <Text style={{ color: '#888', fontSize: 16, marginTop: 15, alignSelf: "center",fontFamily:fonts.SemiBold }}>{translate("no_contacts_found")}</Text>
            )}

            <SectionList
              ref={sectionListRef}
              sections={contacts}
              keyExtractor={(item) => item.recordID}
              renderItem={({ item }) => {
                const firstLetter = item.displayName ? item.displayName.charAt(0).toUpperCase() : "?";
                const selectedOne = selectId === item.recordID
                return (
                  <TouchableOpacity
                    style={[
                      Mystyles.contactItem,
                      selectedOne && Mystyles.selectedContact, // Highlight selected contact
                    ]}
                    onPress={() => toggleContactSelection(item)}
                  >
                    {/* Avatar + Contact Name in the Same View */}
                    <View style={Mystyles.avatarAndNameContainer}>
                      {/* Avatar with First Letter */}
                      <View style={Mystyles.avatar}>
                        <Text style={[Mystyles.avatarText,{fontFamily:fonts.Bold}]}>{firstLetter}</Text>
                      </View>

                      {/* Contact Name */}
                      <Text style={[Mystyles.contactName,{fontFamily:fonts.Regular}]}>{item.displayName}</Text>
                    </View>

                    {/* Selection Indicator (Checkmark) */}
                    {selectedOne && <View style={Mystyles.checkmark}><Text style={{ color: "white" }}>✔</Text></View>}
                  </TouchableOpacity>
                );
              }}
              renderSectionHeader={({ section: { title } }) => (
                <View style={Mystyles.sectionHeader}>
                  <Text style={Mystyles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              stickySectionHeadersEnabled={true} // Keeps headers visible while scrolling
            />

            {/* Alphabet Sidebar */}
            <View style={Mystyles.sidebar}>
              {contacts.map((section) => (
                <TouchableOpacity key={section.title} onPress={() => scrollToSection(section.title)}>
                  {/* <Text style={Mystyles.letter}>{section.title}</Text> */}
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Contacts Display */}
            {/* <View style={Mystyles.selectedContactsContainer}> */}
            {/* {selectedContacts.map((contact) => (
          <View key={contact.recordID} style={Mystyles.selectedContactBox}>
            <Text style={Mystyles.selectedContactText}>{contact.displayName}</Text>
          </View>
        ))} */}
            {/* </View> */}

          </View>
        </ScrollView>
      <SafeAreaView>
      <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity disabled={selectedContactNum === ""} onPress={fetchDataBasedOnDate}
            style={[Mystyles.bookNowButtonContainer1, { backgroundColor: selectedContactNum === "" ? "#B6B8B7" : dynamicStyles.primaryColor }]}>
            <Text style={[Mystyles.bookNowButtonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate('send_whatsApp_invite')}</Text>
             <Image source={require('../../assets/Images/whatsAppImgIcon.png')} style={{ marginLeft: 20,height:25,width:25,resizeMode:"contain" }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
       
      </View>




      <Modal
        animationType="slide"
        transparent={true}
        visible={successMssgVisible}
      >
        <TouchableWithoutFeedback>
          <View style={Mystyles.modalMainContainer}>
            <View style={Mystyles.modalSubContainer}>
              <TouchableOpacity onPress={closeSuccesMssgModal} style={Mystyles.crossIconContainer}>
                <Image source={require('../../assets/Images/crossIcon.png')} style={Mystyles.crossIcon} />
              </TouchableOpacity>
              <Image source={require('../../assets/Images/successIconMssg.png')} style={Mystyles.successIcon} />
              <View style={Mystyles.textContainer}>
                <Text style={Mystyles.successText}>{translate("Thank_you")}</Text>
                <Text style={{ color: "#000", fontFamily:fonts.SemiBold, fontSize: RFValue(9, 680), }}>{successMssg}</Text>
              </View>

              <TouchableOpacity onPress={closeSuccesMssgModal} style={[Mystyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                <Text style={[Mystyles.bookNowButtonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate("ok")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}
      />

      {loaderApi && <PreLoginCustomLoader />}


    </View>
  );
};

export default ReferralScreen;

const Mystyles = StyleSheet.create({

  searchInputContainer: {
    paddingLeft: 20,
    width: "90%",
    fontSize: RFValue(14, height),
    fontWeight: "400",
    color: "#00000066"
  },

  searchImg: {
    height: 20,
    width: 20,
    tintColor: "#000",
    resizeMode: "contain",
  },

  searchFieldMainContainer: {
    paddingLeft: 15,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED323712",
    borderRadius: 10,
    marginVertical: 15
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
    height: 50,
    width: 50,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 20
  },

  textContainer: {
    alignItems: "center"
  },

  successText: {
    // marginVertical:10,
    color: "#000",
    fontWeight: "bold",
    fontSize: RFValue(11, 680),
    marginTop: 10,
    marginBottom: 5
  },

  successMainContainerText: {
    marginBottom: 10,
    alignItems: "center"
  },

  successSubText: {
    color: "#7A7A7A",
    fontWeight: "500",
    fontSize: RFValue(13, 680),
    marginVertical: 10
  },

  bookNowButtonContainer1: {
    width: "80%",
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    paddingLeft: "20%",
    paddingRight: 10
  },

  bookNowButtonText: {
    fontSize: 14,
    // lineHeight: 20
  },


  container: { padding: 10, margin: 5 },

  contactItem: {
    padding: 10,
  },

  selectedContact: { backgroundColor: "#e0f7fa" }, // Highlight selected contacts

  contactName: {
    fontSize: 16,
    backgroundColor: "white",
    height: 40,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    margin: 1
  },

  sectionHeader: { backgroundColor: "#f4f4f4", padding: 5 },




  sidebar: {
    position: "absolute",
    right: 10,
    top: 50,
    alignItems: "center",
  },

  letter: {
    fontSize: 14,
    fontWeight: "bold",
    paddingVertical: 4,
    //   color: "#007bff",
  },

  selectedContactsContainer: {
    position: "absolute",
    right: 20,
    bottom: 50,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  roundBox: {
    width: 30,
    height: 30,
    borderRadius: 15, // This makes it round
    backgroundColor: '#ff4d4d', // Red color for the box, change to suit your design
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedContactBox: {
    backgroundColor: "#007bff",
    padding: 5,
    marginVertical: 3,
    borderRadius: 5,
  },

  selectedContactText: {
    color: "white",
    fontSize: 14,
  },
  roundBoxText: {
    fontSize: 18,
    color: '#fff', // White text inside the box
  },
  selectedContact: {
    backgroundColor: "#e0e0e0", // Selected contact background color
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Makes it round
    backgroundColor: "#6200ea", // Purple background for avatar
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
  },
  sectionHeader: {
    padding: 10,
    backgroundColor: "#f1f1f1",
  },

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Keeps checkmark on the right
    padding: 10,
    backgroundColor: "#fff",
    // borderBottomWidth: 1,
    // borderBottomColor: "#ddd",
    margin: 10,
    borderRadius: 10

  },
  selectedContact: {
    backgroundColor: "#e0e0e0", // Highlight selected contact
  },
  avatarAndNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Makes it round
    backgroundColor: "#6200ea", // Purple background for avatar
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
  },
  contactName: {
    fontSize: 16,
    marginLeft: 10, // Space between avatar and name
    color: "#333",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50", // Green color
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    padding: 10,
    backgroundColor: "#f1f1f1",
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",

  },

  headerMainContainer: {
    paddingTop: height * 0.03,
    paddingHorizontal: 20,
    height: height * 0.105
  },

  headerContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // width: "55%",
    // paddingLeft: 10
  },

  backArrowImg: {
    height: height * 0.05,
    width: width * 0.1,
    resizeMode: "contain"
  },

  bookSeedsText: {
    fontSize: RFValue(16, height),
    alignSelf: "center",
    // lineHeight: 30
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

  bookNowButtonContainer: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 10
  },

});
