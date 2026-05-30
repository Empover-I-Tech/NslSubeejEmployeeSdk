import { Text, View, TextInput, PermissionsAndroid, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback, Alert, Dimensions, SectionList, StatusBar, Linking, ScrollView, Platform ,SafeAreaView} from "react-native"
import { useEffect, useState, useCallback, useRef } from "react"
import CustomInviteFarmerMeetingInput from "../components/CustomInviteFarmerMeetingInput"
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers';
import Geolocation from "react-native-geolocation-service";
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import usePostRequestWithJwt from "../api/usePostRequestWithJwt"
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from "react-native-responsive-fontsize"
import moment from "moment";
import CustomDateFarmerMeet from "../components/CustomDateFarmerMeet"
import DatePicker from 'react-native-date-picker';
import Contacts from 'react-native-contacts';
import { Styles } from "../styles/Styles";
import { CustomCommonModal } from '../components/CustomCommonModal';
import SearchInput from "../components/CustomSearchTextInput";
import SimpleToast from 'react-native-simple-toast';
import realm from "./realmOffline/realmConfig";
import { v4 as uuidv4 } from 'uuid';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import { check, request, RESULTS, PERMISSIONS,openSettings } from 'react-native-permissions';
import axios from "axios";
import { useFontStyles } from "../hooks/useFontStyles";
const { width, height } = Dimensions.get("window")


const InviteFarmerMeeting = ({ route }) => {
    const fonts=useFontStyles()
    const [selectCrops, setSelectCrops] = useState(translate("Crop/Product(Brand Name)"))
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [selectCropDrop, setSelectCropDrop] = useState(false)
    const [cropsList, setCropsList] = useState([]);
    const [locationMap, setLocationMap] = useState("")
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(translate("Select_Date"));
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const navigation = useNavigation();
    const {error: apiError,sendData } = usePostRequestWithJwt();
    const [successMssgVisible, setSuccessMssgVisible] = useState(false)
    const [selectCropValidations, setSelectCropValidations] = useState(false)
    const [requiredByValidations, setRequiredByValidations] = useState(false)
    const [successMssg, setSuccesMssg] = useState("")
    const [loaderApi, setLoaderApi] = useState(false)
    const [nameOfMeeting, setNameOfMeeting] = useState("")
    const [nameOfMeetingValidation, setNameOfMeetingValidation] = useState(false)
    const [nameOfMeetingValidationContent, setNameOfMeetingValidationContent] = useState("")
    const [selectTimeValidation, setSelectTimeValidation] = useState(false)
    const [selectedTime, setSelectedTime] = useState(null);
    const [tempTime, setTempTime] = useState(new Date());
    const [selctedDateTime, setSelectDateTime] = useState("")
    const [isTimeVisible, setTimeVisible] = useState(false);
    const [meetingDateTimeValidationContent, setMeetingDateTimeValidationContent] = useState("")
    const [meetingVenuValidation, setMeetingVenuLocationValidation] = useState(false)
    const [contacts, setContacts] = useState([]);
    const [contactsList1, setContactsList1] = useState([]);
    const [selectId, setSelectId] = useState("")
    const [selectedContactNum, setSelectedContactNum] = useState("")
    const sectionListRef = useRef(null);
    const currentTheme = useSelector((state) => state.theme.theme);
    const [selectedContactsScreen, SetSelectedContactScreen] = useState(false)
    const styles = Styles(currentTheme);
    const [alertModal, setAlertModal] = useState(false)
    const [alertTextContent, setAlertTextContent] = useState("")
    const isConnected = useSelector(state => state.network.isConnected);
    const cachedHybridList = realm.objects('hybridMaster');
    const [coordinates, setCoordinates] = useState({});
    const [mapZoomingLevel, setMapZoomingLevel] = useState(20)
    const [coordinatesCopy,setCoordinatesCopy]=useState({})

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]); 
        const fine = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
        const coarse = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
 
        if (
          fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          Alert.alert(
            translate("permission_required"),
            translate("permission_permantely_den"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
          return 'never_ask_again';
        }
 
        if (
          fine === PermissionsAndroid.RESULTS.DENIED ||
          coarse === PermissionsAndroid.RESULTS.DENIED
        ) {
          Alert.alert(
            translate("permission_required"),
            translate("permission_permantely_den"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
          return 'denied';
        }
 
        if (
          fine === PermissionsAndroid.RESULTS.GRANTED &&
          coarse === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return 'granted';
        }
 
        return 'unknown';
      } catch (error) {
        console.warn('Android location permission error:', error);
        return 'error';
      }
    } else if (Platform.OS === 'ios') {
      try {
        const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
 
        if (status === RESULTS.GRANTED) {
          return 'granted';
        }
 
        if (status === RESULTS.DENIED) {
          const requestStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (requestStatus === RESULTS.GRANTED) {
            return 'granted';
          } else if (requestStatus === RESULTS.BLOCKED) {
             Alert.alert(
            translate("permission_required"),
            translate("permission_permantely_den"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
            return 'blocked';
          } else {
           Alert.alert(
            translate("permission_required"),
            translate("permission_permantely_den"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
            return 'denied';
          }
        }
 
        if (status === RESULTS.BLOCKED) {
          Alert.alert(
            translate("permission_required"),
            translate("permissionBlocked"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => openSettings() },
            ]
          );
          return 'blocked';
        }
 
        if (status === RESULTS.UNAVAILABLE) {
          Alert.alert(
            translate("Not_Available"),
            translate("permissionNotAvailable"),
            [{ text: translate("ok") }]
          );
          return 'unavailable';
        }
 
        return 'unknown';
      } catch (error) {
        console.warn('iOS location permission error:', error);
        return 'error';
      }
    }
  };

    const checkIfGpsEnabled = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 20000,
          fastInterval: 6000,
        });
        return true;
      } catch (err) {
        Alert.alert(
          translate("GPS_Required"),
          translate("Please_enable_GPS_for_location_properly"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    } else {
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          (position) => resolve(true),
          (error) => {
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    }
    }, []);

    // useEffect(() => {
    //     GetUserLocation()
    // }, [])

    const GetUserLocation = async () => {
        try {
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("GETTINGCURRENTLOCATIO==-=->",latitude,longitude)
                    // setLatitude(latitude)
                    // setLongitude(longitude)
                    setCoordinatesCopy(position.coords)
                },
                (error) => {
                    if (error.code === 3 || error.code === 2) {
                        Geolocation.getCurrentPosition(
                            async (position) => {
                                const { latitude, longitude } = position.coords;
                                console.log("GETTINGCURRENTLOCATIO==-=->",latitude,longitude)
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
                    { text:translate("cancel"), style: 'cancel' },
                    {
                      text:translate("open_settings"),
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
                    { text:translate("cancel"), style: 'cancel' },
                    {
                      text:translate("open_settings"),
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
        
      }, []);

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

    const toggleContactSelection = (contact) => {
        console.log("apsopao=-=->", contact.phoneNumbers)
        if (contact?.phoneNumbers) {
            setSelectId(contact.recordID)
            setSelectedContactNum(contact.phoneNumbers[0]?.number)
        } else {
            setAlertModal(true)
            setAlertTextContent(translate("No_Number_fetching"))
        }
    };

    const alertCloseHandle = () => {
        setAlertModal(false)
    }

    const sendWhatsAppInvite = () => {
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `
${translate("Meeting_Name")} :  ${nameOfMeeting}
${translate("Crop_Product")} : ${selectCrops}
${translate("Date")}       : ${selectedDate}
${translate("Time")}    : ${formatTime(selectedTime)}
${translate("Address")}  : ${locationMap}
${translate("Location_Link")}: ${mapsUrl}
`;
        const formattedPhone = selectedContactNum.replace(/[^+\d]/g, ''); // Keep digits only
        const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
        Linking.openURL(url)
            .then(() => console.log(`Opened WhatsApp for ${formattedPhone}`))
            .catch((error) => {
                setAlertModal(true)
                setAlertTextContent(translate("couldNotOpenWhatsApp"))
            });
    };

    const handleTimeModal = () => {
        setTimeVisible(true)
    }

    const closeTimeModal = () => {
        setTimeVisible(false)
    }


    const onChangeNameOfMeeting = (value) => {
        setNameOfMeetingValidation(false)
        setNameOfMeetingValidationContent("")
        // setNameOfMeeting(value.replace(/\s/g, "").replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)/g, '').replace(/[^A-Za-z0-9]/g, ""))
        setNameOfMeeting(value.replace(/^[^A-Za-z]+|[^A-Za-z ]+/g, ''))
    }

    const handleBookNowBtn = () => {
        if (nameOfMeeting === "") {
            setNameOfMeetingValidation(true)
            setNameOfMeetingValidationContent(translate("Please_Enter_Name_Meeting"))
        } else if (nameOfMeeting.length <= 2) {
            setNameOfMeetingValidation(true)
            setNameOfMeetingValidationContent(translate("Please_Enter_Valid_Meeting_Name"))
        } else if (selectCrops === translate("Crop/Product(Brand Name)")) {
            setSelectCropValidations(true)
        } else if (selectedDate === translate("Select_Date")) {
            setRequiredByValidations(true)
            setMeetingDateTimeValidationContent(translate("Please_select_date"))
        } else if (selectedTime === null) {
            setSelectTimeValidation(true)
            setMeetingDateTimeValidationContent(translate("Please_select_time"))
        } else if (locationMap === translate("Enter_Address_Line") || locationMap==="" || locationMap===null) {
            setMeetingVenuLocationValidation(true)
        } else {
            SetSelectedContactScreen(true)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchHybridsAndIssueTypesAndCrops();
            setSelectCropValidations(false)
            setRequiredByValidations(false)
            GetUserLocation()
        }, [])
    );

    useEffect(() => {
        if(route?.params?.backScreen){
            console.log("step=-=-=->1", route?.params?.backScreen?.latitude)
            console.log("step=-=-=->2", route?.params?.backScreen?.longitude)
            console.log("step=-=-=->3", route?.params?.backScreen?.address)
            const geo = `${route?.params?.backScreen?.latitude},${route?.params?.backScreen?.longitude}`
            setLatitude(route?.params?.backScreen?.latitude);
            setLongitude(route?.params?.backScreen?.longitude);
            setCoordinates({latitude:route?.params?.backScreen?.latitude,longitude:route?.params?.backScreen?.longitude})
            setMeetingVenuLocationValidation(false)
            getDetailsFromLatlong(route?.params?.backScreen?.latitude, route?.params?.backScreen?.longitude)
            setMapZoomingLevel(route?.params?.backScreen?.zoom)
        }
    }, [route?.params?.backScreen]);

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
            if (response.data && response.data.results) {
                const { pincode, state, district, village, street, subDistrict, lat, lng, formatted_address } = response.data.results[0];
                setLatitude(lat)
                setLongitude(lng)
                setCoordinates({latitude:lat,longitude:lng})
                setLocationMap(formatted_address)
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

    const handleSelectCrop = () => {
        setSelectCropDrop(!selectCropDrop)
    }

    const handleSelectCropsValue = (value, hybridList) => {
        setSelectCrops(value)
        setSelectCropValidations(false)
        setSelectCropDrop(false)
    }

    const handleSelectClose = () => {
        setSelectCropDrop(false)
    }

    // const handleLocationClick = async () => {
    //     const hasPermission = await requestLocationPermission();
    //     if (!hasPermission) {
    //         Alert.alert(
    //             "Permission Denied",
    //             "Location permission is required to use this feature. Please allow it in settings.",
    //             [
    //                 {
    //                     text: "Go to Settings",
    //                     onPress: () => {
    //                         openSettings().catch(() => {
    //                             Alert.alert("Unable to open settings");
    //                         });
    //                     },
    //                 },
    //                 {
    //                     text: "Cancel",
    //                     style: "cancel",
    //                 }
    //             ]
    //         );
    //         return;
    //     }

    //     if (hasPermission) {
    //         if (Platform.OS == "android") {
    //             const isGpsEnabled = await checkIfGpsEnabled();
    //             if (isGpsEnabled) {
    //                 GetUserLocation();
    //                 if (isConnected) {
    //                     if (coordinates && typeof coordinates === 'object' && Object.keys(coordinates).length > 0) {
    //                         navigation.navigate('Location', { screeName: "InviteFarmerMeeting", address: locationMap, coordinates: coordinates })
    //                         // navigation.navigate('Location',{coordinates:{latitude:coordinates?.latitude,longitude:coordinates?.longitude,address:locationMap,screenName:"InviteFarmerMeeting",zoom:mapZoomingLevel}})
    //                     }
    //                     else {
    //                         GetUserLocation()
    //                     }

    //                 } else {
    //                     SimpleToast.show(translate('no_internet_conneccted'));
    //                 }
    //             }
    //             else {
    //                 GetUserLocation();
    //             }
    //         }
    //         else {
    //             if (isConnected) {
    //                 if (coordinates && typeof coordinates === 'object' && Object.keys(coordinates).length > 0) {
    //                     navigation.navigate('Location', { screeName: "InviteFarmerMeeting", address: locationMap, coordinates: coordinates })
    //                 }
    //                 else {
    //                     GetUserLocation()
    //                 }

    //             } else {
    //                 SimpleToast.show(translate('no_internet_conneccted'));
    //             }
    //         }
    //     }
    // }

    const handleLocationClick = async () => {

        if (isConnected) {
            console.log("coordinates", coordinates)
            if (coordinates && typeof coordinates === 'object' && Object.keys(coordinates).length > 0) {
                console.log("coordinates===>", coordinates)
                navigation.navigate('Location', { coordinates: { latitude: parseFloat(coordinates?.latitude), longitude: parseFloat(coordinates?.longitude), address: locationMap, screenName: "InviteFarmerMeeting", zoom: mapZoomingLevel } })
            }
            else {
                GetUserLocation()
                CopyGetUserLocationCopy()
                console.log("checkiing2222-=-=->")
            }

        } else {
            SimpleToast.show(translate('no_internet_conneccted'));
        }
    }

    const CopyGetUserLocationCopy = async () => {
        GetUserLocation()
        if (coordinatesCopy && typeof coordinatesCopy === 'object' && Object.keys(coordinatesCopy).length > 0) {
            navigation.navigate('Location', { coordinates: { latitude: coordinatesCopy?.latitude, longitude: coordinatesCopy?.longitude, address: locationMap, screenName: "InviteFarmerMeeting", zoom: mapZoomingLevel } })
        } else {
            SimpleToast.show(translate("location_error"))
        }
        // // if (isConnected) {
        // try {
        //     Geolocation.getCurrentPosition(
        //         async (position) => {
        //             const { latitude, longitude } = position.coords;
        //             console.log("COPLATITUDELONGITUDE=-=-=->", latitude, longitude)
        //             navigation.navigate('Location', { coordinates: { latitude: latitude, longitude: longitude, address: locationMap, screenName: "InviteFarmerMeeting", zoom: mapZoomingLevel } })
        //             setCoordinates(position.coords)
        //         },
        //         (error) => {
        //             if (error.code === 3 || error.code === 2) {
        //                 Geolocation.getCurrentPosition(
        //                     async (position) => {
        //                         const { latitude, longitude } = position.coords;
        //                         console.log("COPLATITUDELONGITUDE=-=-=->", latitude, longitude)
        //                         navigation.navigate('Location', { coordinates: { latitude: latitude, longitude: longitude, address: locationMap, screenName: "InviteFarmerMeeting", zoom: mapZoomingLevel } })

        //                         // setLatitude(latitude)
        //                         // setLongitude(longitude)
        //                         setCoordinates(position.coords)
        //                     },
        //                     () => setAlertModal(false),
        //                     { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 },
        //                 );
        //             }
        //         },
        //         { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
        //     );
        // } catch (err) {
        //     console.error("Unexpected error:", err);
        //     Alert.alert(translate("Error"), translate("An_unexpected_error_occurred_Please_try_again"));
        // }
        // // } else {
        // //   SimpleToast.show(translate("no_internet_conneccted"))
        // // }
    }

    // const fieldHandle = async () => {
    //         // setFieldsValue(value1)
    //         // setFieldsValueField(value2)
    //     const hasPermission = await requestLocationPermission();
    //     if (hasPermission) {
    //         if (isConnected) {
    //         } else {
    //             SimpleToast.show(translate('no_internet_conneccted'))

    //         }
    //         if (Platform.OS == "android") {
    //             const isGpsEnabled = await checkIfGpsEnabled();
    //             if (isGpsEnabled) {
    //                 if (!locationMap) {
    //                     // GetUserLocation();
    //                     await CopyGetUserLocationCopy()
    //                     // setFieldsValue(value1)
    //                     // setFieldsValueField(value2)
    //                 } else {
    //                     handleLocationClick()
    //                     // setFieldsValue(value1)
    //                     // setFieldsValueField(value2)
    //                 }

    //             }
    //             else {
    //                 if (!locationMap) {
    //                     GetUserLocation();
    //                     CopyGetUserLocationCopy()
    //                 } else {
    //                     handleLocationClick()
    //                 }
    //             }
    //         }
    //         else {
    //             if (!locationMap) {
    //                 CopyGetUserLocationCopy()
    //             } else {
    //                 handleLocationClick()

    //             }
    //         }
    //     }

    // }
    const fieldHandle = async () => {
        // setFieldsValue(value1)
        // setFieldsValueField(value2)
    const hasPermission = await requestLocationPermission();
    const isGpsEnabled = await checkIfGpsEnabled();
    if(isGpsEnabled){
        if (hasPermission === "granted") {
            if (isConnected) {
                if (!locationMap) {
                    GetUserLocation();
                    await CopyGetUserLocationCopy()
                } else {
                    handleLocationClick()
                }
            } else {
                SimpleToast.show(translate('no_internet_conneccted'))
            }
        }
    }

    // if (hasPermission) {
    //     if (isConnected) {
    //     } else {
    //         SimpleToast.show(translate('no_internet_conneccted'))

    //     }
    //     if (Platform.OS == "android") {
    //         const isGpsEnabled = await checkIfGpsEnabled();
    //         if (isGpsEnabled) {
    //             if (!locationMap) {
    //                 // GetUserLocation();
    //                 await CopyGetUserLocationCopy()
    //                 // setFieldsValue(value1)
    //                 // setFieldsValueField(value2)
    //             } else {
    //                 handleLocationClick()
    //                 // setFieldsValue(value1)
    //                 // setFieldsValueField(value2)
    //             }

    //         }
    //         else {
    //             if (!locationMap) {
    //                 GetUserLocation();
    //                 CopyGetUserLocationCopy()
    //             } else {
    //                 handleLocationClick()
    //             }
    //         }
    //     }
    //     else {
    //         if (!locationMap) {
    //             CopyGetUserLocationCopy()
    //         } else {
    //             handleLocationClick()

    //         }
    //     }
    // }

}




    const handleDateModal = () => {
        setCalendarVisible(true)
    }

    const closeSuccesMssgModal = () => {
        sendWhatsAppInvite()
        SetSelectedContactScreen(false)
        setNameOfMeeting("")
        setSelectCrops(translate("Select_Hybrid_Variety"))
        setSelectedDate(translate("Select_Date"))
        setSelectedTime(null)
        setLocationMap(translate("Enter_Address_Line"))
        setLatitude(null)
        setLongitude(null)
        setSelectedContactNum("")
        setSelectId("")
        setSuccessMssgVisible(false)
    }

    const fetchHybridsAndIssueTypesAndCrops = async () => {
        if (!isConnected && cachedHybridList.length > 0) {
            const cachedData = cachedHybridList
            setCropsList(JSON.parse(cachedData[0].hybridsList));
            setLoaderApi(false);
            return;
        }
        if (isConnected) {
            try {
                const headers = await GetApiHeaders();
                headers.authType = ""
                const payload = { companyCode: dynamicStyles.companyCode };
                const url = APIConfig.BASE_URL + APIConfig.mastersgetHybridsDropdownList;
                const response = await sendData(url, payload, {}, false);
                if (response.statusCode === HTTP_OK) {
                    const parseData = response.data.response.hybridList
                    setCropsList(parseData)
                    setLoaderApi(false)
                    let hybridListId;
                    const maxAttempts = 3;
                    let attempts = 0;
                    while (attempts < maxAttempts) {
                        try {
                            hybridListId = uuidv4();
                            console.log('Generated hybridListId:', hybridListId);
                            const existinghybridMaster = realm.objects('hybridMaster').filtered('_id == $0', hybridListId);
                            if (existinghybridMaster.length === 0) {
                                break;
                            }
                            console.warn(`UUID collision detected for ${hybridListId}, attempt ${attempts + 1}`);
                            attempts++;
                        } catch (uuidError) {
                            console.error('Error generating UUID for hybridMaster:', uuidError);
                            // SimpleToast.show(translate('Failed_to_generate_unique_ID'));
                            setLoaderApi(false);
                            return;
                        }
                        if (attempts >= maxAttempts) {
                            console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
                            // SimpleToast.show(translate('Failed_to_generate_unique_ID'));
                            setLoaderApi(false);
                            return;
                        }
                    }
                    try {
                        realm.write(() => {
                            realm.delete(cachedHybridList);
                            realm.create('hybridMaster', {
                                _id: hybridListId,
                                hybridsList: JSON.stringify(parseData || []),
                                timestamp: new Date(),
                            });
                        });
                    } catch (realmError) {
                        console.error('Error creating hybridList object in Realm:', realmError);
                        setLoaderApi(false);
                        return;
                    }
                } else {
                    setLoaderApi(false)
                }
            } catch (error) {
                console.log("erroe=-=->", error)
                setLoaderApi(false)
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'));

        }
    };

    const formatISOToLocal = () => {
        const date = new Date(selectedTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const fetchDataBasedOnDate = async () => {
        if (isConnected) {
            setLoaderApi(true)
            try {
                const headers = await GetApiHeaders();
                headers.farmerId = Number.parseInt(headers.userId)
                const payload = {
                    "id": 0,
                    "meetingName": nameOfMeeting,
                    "productName": selectCrops,
                    "referralMobileNumber": selectedContactNum,
                    "meetingDateandTime": formatISOToLocal(),
                    "meetingVenue": {
                        "latitude": latitude,
                        "longitude": longitude
                    }
                };
                const url = APIConfig.BASE_URL + APIConfig.saveInviteFarmerMeeting
                const response = await sendData(url, payload, headers, false);
                if (response?.statusCode === HTTP_OK) {
                    setSuccesMssg(response.data.message)
                    closeSuccesMssgModal()
                    setLoaderApi(false)
                } else {
                    setLoaderApi(false)
                }
            } catch (error) {
                setLoaderApi(false)
            }
        } else {
            setAlertModal(true)
            setAlertTextContent(translate("Unable_submit_again"))
        }
    };

    const formatTime = (date) => {
        if (!date) return translate("Select_Time");
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;
        let formattedHours = String(hours).padStart(2, '0');
        let formattedMinutes = String(minutes).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const closeDate = () => {
        setCalendarVisible(false)
    }

    return (
        <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor, flex: 1 }} edges={['top']}>
            <View style={RnStyles.booksSeedsMainContainer}>
                <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                        <View style={RnStyles.headerContentContainer}>
                            <TouchableOpacity onPress={() => selectedContactsScreen ? SetSelectedContactScreen(false) : navigation.goBack()}>
                                <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
                            </TouchableOpacity>
                            <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate("Invite_Farmer_Meeting")}</Text>
                            <View style={{ width: 40 }} />
                        </View>
                    <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
                </View>
                {selectedContactsScreen ?
                    <View style={[{ flex: 1, backgroundColor: "#F2F6F9" }]}>
                        {Platform.OS === "android" && (
                            <StatusBar
                                backgroundColor={dynamicStyles.primaryColor}
                            //   barStyle={currentTheme.statusBar}
                            />
                        )}
                        <View style={RnStyles.container}>

                            {contactsList1.length > 0 &&
                                <View style={{ width: "98%" }}>
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

                            <Text style={[{color:"#000",marginVertical:10,fontSize:16,fontFamily:fonts.SemiBold}]}>{translate("Contacts")}</Text>
                            {/* Contacts List */}
                            <SectionList
                                ref={sectionListRef}
                                sections={contacts}
                                keyExtractor={(item) => item.recordID}
                                renderItem={({ item }) => {
                                    const firstLetter = item.displayName ? item.displayName.charAt(0).toUpperCase() : "?";
                                    // const isSelected = selectedContacts.some((c) => c.recordID === item.recordID);
                                    const selectedOne = selectId === item.recordID

                                    return (
                                        <TouchableOpacity
                                            style={[
                                                RnStyles.contactItem,
                                                selectedOne && RnStyles.selectedContact, // Highlight selected contact
                                            ]}
                                            onPress={() => toggleContactSelection(item)}
                                        >
                                            {/* Avatar + Contact Name in the Same View */}
                                            <View style={RnStyles.avatarAndNameContainer}>
                                                {/* Avatar with First Letter */}
                                                <View style={RnStyles.avatar}>
                                                    <Text style={[RnStyles.avatarText,{fontFamily:fonts.Bold}]}>{firstLetter}</Text>
                                                </View>

                                                {/* Contact Name */}
                                                <Text style={[RnStyles.contactName,{fontFamily:fonts.SemiBold}]}>{item.displayName}</Text>
                                            </View>

                                            {/* Selection Indicator (Checkmark) */}
                                            {selectedOne && <View style={RnStyles.checkmark}><Text style={{ color: "white" }}>✔</Text></View>}
                                        </TouchableOpacity>
                                    );
                                }}
                                renderSectionHeader={({ section: { title } }) => (
                                    <View style={RnStyles.sectionHeader}>
                                        <Text style={[RnStyles.sectionHeaderText,{fontFamily:fonts.Bold}]}>{title}</Text>
                                    </View>
                                )}
                                stickySectionHeadersEnabled={true} // Keeps headers visible while scrolling
                            />



                            {/* Alphabet Sidebar */}
                            <View style={RnStyles.sidebar}>
                                {contacts.map((section) => (
                                    <TouchableOpacity key={section.title} onPress={() => scrollToSection(section.title)}>
                                        {/* <Text style={RnStyles.letter}>{section.title}</Text> */}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Selected Contacts Display */}



                        </View>
                        <SafeAreaView>
                        <View style={{ justifyContent: "center", alignItems: "center", bottom: 20 }}>
                            <TouchableOpacity disabled={selectedContactNum === ""} onPress={fetchDataBasedOnDate}
                                style={[RnStyles.bookNowButtonContainer1, { backgroundColor: selectedContactNum === "" ? "#B6B8B7" : dynamicStyles.primaryColor }]}>
                                <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate('send_whatsApp_invite')}</Text>
                                <Image source={require('../../assets/Images/whatsAppImgIcon.png')} style={{ marginLeft: 20,height:25,width:25,resizeMode:"contain" }} />
                            </TouchableOpacity>
                        </View>
                        </SafeAreaView>
                    </View>
                    :
                    <View style={RnStyles.contentMainContainer}>
                        <View style={RnStyles.textFieldsMainContainer}>
                            <View>
                                <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{translate("Name_of_Meeting")}<Text style={{ color: "red" }}> *</Text></Text>
                                <TextInput onChangeText={onChangeNameOfMeeting} value={nameOfMeeting}
                                    placeholderTextColor={"#8F8F8F"} placeholder={translate("Name_of_Meeting")}
                                    style={[RnStyles.textInputContainer1, { borderColor: nameOfMeetingValidation ? "red" : "#D6D6D6", color: "#000" ,fontFamily:fonts.Regular}]} />
                                {nameOfMeetingValidationContent &&
                                    <Text style={[RnStyles.validationText,{fontFamily:fonts.Medium}]}>{nameOfMeetingValidationContent}</Text>
                                }
                            </View>

                            <CustomInviteFarmerMeetingInput
                                label={translate("Crop/Product(Brand Name)")}
                                inputValue={selectCrops}
                                handleDropDown={handleSelectCrop}
                                dropDownVisible={selectCropDrop}
                                closeDropDown={handleSelectClose}
                                data={cropsList}
                                name={"cropsList"}
                                valueHandle={handleSelectCropsValue}
                                validationsBorder={selectCropValidations}
                            />
                            {selectCropValidations && <Text style={{ color: "#ED3237", fontSize: 15,fontFamily:fonts.Medium }}>{translate("Please_Select_Crop")}</Text>}

                            <CustomDateFarmerMeet
                                label={translate("Meeting_Date_Time")}
                                inputValue={selectedDate}
                                visible={isCalendarVisible}
                                handleModal={handleDateModal}
                                onSelectDate={(date) => {
                                    setSelectedDate(moment(date, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY"));
                                    // setApiSendDate(date)
                                    setCalendarVisible(false);
                                    setRequiredByValidations(false)
                                }}
                                validationBorder={requiredByValidations}
                                closeDate={closeDate}

                                labelTime={translate("Meeting_Time")}
                                validationBorderTime={selectTimeValidation}
                                inputValueTime={formatTime(selectedTime)}
                                visibleTime={isTimeVisible}
                                handleModalTime={handleTimeModal}
                                onSelectDatTimee={selctedDateTime}
                                closeDateTime={closeTimeModal}
                            />
                            {requiredByValidations && <Text style={{ color: "#ED3237", fontSize: 15,fontFamily:fonts.Medium }}>{meetingDateTimeValidationContent}</Text>}
                            {selectTimeValidation && <Text style={{ color: "#ED3237", fontSize: 15, textAlign: 'right', marginRight: 25 ,fontFamily:fonts.Medium}}>{meetingDateTimeValidationContent}</Text>}

                            <View >
                                <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{translate("Meeting_Venue")}<Text style={{ color: "red" }}> *</Text></Text>
                                <TouchableOpacity onPress={() => fieldHandle()} style={[RnStyles.textInputContainer1, { borderColor: meetingVenuValidation ? "#ED3237" : "#D6D6D6", }]}>
                                    <Text style={{ color: "#8F8F8F", margin: 5, flex: 1 ,fontSize:14,fontFamily:fonts.Regular}}>{locationMap?locationMap:translate("Enter_Address_Line")}</Text>
                                    <Image style={[RnStyles.addIcon,]} source={require("../../assets/Images/LocationImg.png")} />
                                </TouchableOpacity>
                            </View>
                            {meetingVenuValidation && <Text style={{ color: "#ED3237", fontSize: 15,fontFamily:fonts.Medium }}>{translate("Please_Enter_Address")}</Text>}

                        </View>
                        <TouchableOpacity onPress={handleBookNowBtn} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                            <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate("Invite")}</Text>
                        </TouchableOpacity>
                        <Modal visible={isTimeVisible} transparent animationType="slide">
                            <TouchableWithoutFeedback>
                                <View style={RnStyles.modalMainContainer}>
                                    <View style={RnStyles.modalSubContainer1}>
                                        <TouchableOpacity onPress={closeTimeModal} style={{ position: "absolute", right: -8, top: -10, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                            <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                                        </TouchableOpacity>
                                        <View style={{ alignItems: "center" }}>
                                            <DatePicker
                                                date={tempTime || new Date()}
                                                mode="time"
                                                androidVariant="iosClone"
                                                minimumDate={new Date()}
                                                is24Hour={true}
                                                onDateChange={setTempTime}
                                                textColor="#000"
                                            />
                                        </View>

                                        <TouchableOpacity style={{
                                            marginTop: 20, backgroundColor: dynamicStyles.primaryColor, justifyContent: "center", alignItems: "center",
                                            height: height * 0.07, borderRadius: 10
                                        }} onPress={() => {
                                            setSelectedTime(tempTime);
                                            setTimeVisible(false);
                                            setSelectTimeValidation(false)
                                        }}>
                                            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(16, height), fontFamily:fonts.SemiBold}}>{translate("Set_Time")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                    </View>
                }
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={successMssgVisible}
                >
                    <TouchableWithoutFeedback>
                        <View style={RnStyles.modalMainContainer}>
                            <View style={RnStyles.modalSubContainer}>
                                <TouchableOpacity onPress={closeSuccesMssgModal} style={RnStyles.crossIconContainer}>
                                    <Image source={require('../../assets/Images/crossIcon.png')} style={RnStyles.crossIcon} />
                                </TouchableOpacity>
                                <Image source={require('../../assets/Images/successIconMssg.png')} style={RnStyles.successIcon} />
                                <View style={RnStyles.textContainer}>
                                    <Text style={RnStyles.successText}>{translate("Thank_you")}</Text>
                                    <Text style={{ color: "#000", fontWeight: "500", fontSize: RFValue(9, 680), }}>{successMssg}</Text>
                                </View>

                                <TouchableOpacity onPress={closeSuccesMssgModal} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                                    <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor ,fontFamily:fonts.SemiBold}]}>{translate("ok")}</Text>
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
        </SafeAreaView>
    )
}

export default InviteFarmerMeeting



const RnStyles = StyleSheet.create({
    booksSeedsMainContainer: {
        backgroundColor: "#F2F6F9",
        flex: 1,
        width: "100%"
    },
    headerMainContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
        height:Platform.OS == "ios" ? 80 : 80
    },
    headerContentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // width: "75%"
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
        top: height * 0.035,
        right: 20,
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
        paddingBottom: 20,
        paddingTop: 10
    },

    labelText: {
        color: "#5D5D5D",
        fontSize: RFValue(14, height),
        marginVertical: 8
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
        // lineHeight: 16,
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
        borderRadius: 10,
        marginTop: 10
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
    addIcon: {
        resizeMode: "contain",
        height: 15,
        width: 15
    },

    textInputContainer1: {
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        minHeight: 55,
        // marginTop: 15,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 20,
        // marginBottom: 3,
        paddingLeft: 15,

    },

    validationText: {
        color: "red",
        fontSize: RFValue(12, height)
    },

    modalSubContainer1: {
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
        minHeight: height * 0.35
    },

    sectionHeaderText: {
        fontSize: 18,
        color: "#333",
    },

    sectionHeader: {
        padding: 10,
        backgroundColor: "#f1f1f1",
    },

    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#4CAF50", // Green color
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "white",
        fontSize: 18,
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20, // Makes it round
        backgroundColor: "#6200ea", // Purple background for avatar
        justifyContent: "center",
        alignItems: "center",
    },

    selectedContact: {
        backgroundColor: "#e0e0e0", // Selected contact background color
    },

    avatarAndNameContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    container: { flex: 1, padding: 10, margin: 5 },

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
    contactName: {
        fontSize: 16,
        marginLeft: 10, // Space between avatar and name
        color: "#333",
    },
})

