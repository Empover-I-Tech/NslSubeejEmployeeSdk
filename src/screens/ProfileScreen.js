import {
  StyleSheet, Text, TouchableOpacity, View, Image, TextInput, StatusBar,
  TouchableWithoutFeedback, Dimensions, Modal, Platform,
  ScrollView,
  Linking,
  Alert,
  PermissionsAndroid
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Styles } from "../styles/Styles";
import { translate } from "../Localization/Localisation";
import SimpleToast from 'react-native-simple-toast';
import { deleteFromAsyncStorage, getFromAsyncStorage, storeInAsyncStorage } from "../utils/keychainUtils";
import { FIRSTNAME, LASTNAME, MOBILENUMBER, USER_IMG, USERNAME, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, ROLDID, SCREENNAME, EMP_DASHBOARD_SCREEN } from "../utils";
import { RFValue } from "react-native-responsive-fontsize";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import APIConfig, { HTTP_OK } from "../api/APIConfig";
import { GetApiHeaders, getAppVersion } from "../utils/helpers";
import { CustomCommonModal } from "../components/CustomCommonModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import CustomAddressTextInput from "../components/CustomAddressTextInputEdit";
import CustomVillageTextInput from "../components/CustomVillageAddressTextInputEdit";
import CustomStateDropDown from "../components/CustomStateDropDown";
import CustomPinCodeTextInput from "../components/CustomPincodeFieldEdit";
import useGetRequestWithJwt from "../api/useGetRequestWithJwt";
import CustomRegTextField from "../components/CustomRegTextFieldEdit";
import { setCompanyStyle } from '../state/actions/companyStyles';
import { useFontStyles } from "../hooks/useFontStyles";
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';


const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ route }) => {
  const fonts = useFontStyles()
  const dispatch = useDispatch();

  const currentTheme = useSelector((state) => state.theme.theme);
  const isConnected = useSelector((state) => state.network.isConnected);
  const dynamicStyles = useSelector((state) => state.companyStyles.companyStyles);
  const locationCheck = useSelector(state => state?.selectLocationReducer?.locationStyles);
  const styles = Styles(currentTheme);
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [imageSelectionModal, setImageSelectionModal] = useState(false);
  const [imagePic, setImagePic] = useState(dynamicStyles?.profilePic);
  const [companyName, setCompanyName] = useState(dynamicStyles.companyName);
  const [loader, setLoader] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [alertTextContent, setAlertTextContent] = useState("");
  const [firstName, setFirstName] = useState(dynamicStyles.firstName)
  const [firstnameValidation, setFirstNameValidation] = useState(false)
  const [firstNameErrorMssg, setFirstNameErrorMsssg] = useState("")
  const [lastName, setLastName] = useState(dynamicStyles.lastName)
  const [totalAcres, setTotalAcres] = useState(0)
  const [lastnameValidation, setLastNameValidation] = useState(false)
  const [addressLineValue, SetAddressLineValue] = useState(dynamicStyles?.addressLine ? dynamicStyles.addressLine : "")
  const [addressLineValidation, setAddressLineValidation] = useState(false)
  const [landMarkValue, SetLandMarkValue] = useState(dynamicStyles?.landMark ? dynamicStyles.landMark : "")
  const [landMarkValidation, setLandValidation] = useState(false)
  const [villageValue, setVillageValue] = useState(dynamicStyles.villageLocation ? dynamicStyles.villageLocation : "")
  const [villageValidation, setvillageValidation] = useState(false)
  const [tashilValue, setTasilValue] = useState(dynamicStyles?.tahsil ? dynamicStyles.tahsil : "")
  const [tashilValidation, setTashilValidation] = useState(false)
  const [stateValue, setStateValue] = useState(dynamicStyles?.state ? dynamicStyles.state : translate("select_state"))
  const [stateList, setStateList] = useState([])
  const [stateList2, setStateList2] = useState([])
  const [stateDropDownVisible, setSatteDropDownVisible] = useState(false)
  const [stateValidation, setStateValidation] = useState(false)
  const [stateId, setStateId] = useState(dynamicStyles.stateId ? dynamicStyles.stateId : "")
  const [districtValue, setDistrictValue] = useState(dynamicStyles?.district ? dynamicStyles.district : translate("select_dict"))
  const [districtList, setDistictList] = useState([])
  const [districtList2, setDistictList2] = useState([])
  const [districtList3, setDistictList3] = useState([])
  const [districtId, setDistrictId] = useState(dynamicStyles.districtId)
  const [distictDropDownVisible, setDistrictDropDownVisible] = useState(false)
  const [districtValidation, setDistrictValidation] = useState(false)
  const [pinCodeValue, setPincodeValue] = useState(dynamicStyles.pincode)
  const [pinCodeValidation, setPinCodeValidation] = useState(false)
  const [pinCodeValidationContent, setValidationContent] = useState("")
  const [searchStateValue, SetSearchStateValue] = useState("")
  const [SearchDistrictValue, setSearcDistrictValue] = useState("")
  const { getData, getLoading, error, statusCode, fetchData } = useGetRequestWithJwt();
  const [editEnable, setEditEnable] = useState(true);
  const [isDirty, setIsDirty] = useState(false); // Track unsaved changes
  const existingDynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const [isAnyUpdated, setIsAnyUpdated] = useState(false)


  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const mobileNumber = await getFromAsyncStorage(MOBILENUMBER);
          const userPic = await getFromAsyncStorage(USER_IMG);
          setMobileNumber(mobileNumber || '');
          setImagePic(userPic || '');
        } catch (error) {
          console.error('Error fetching AsyncStorage:', error);
          setLoader(false);
        }
      };
      fetchUserData();
      fetchDistrict()
      fetchState()
    }, [])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        translate("Unsaved Changes"),
        translate("You have unsaved changes. Do you want to discard them?"),
        [
          {
            text: translate("Cancel"),
            style: "cancel",
            onPress: () => { },
          },
          {
            text: translate("Discard"),
            style: "destructive",
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ],
        { cancelable: false }
      );
    });

    return unsubscribe;
  }, [isDirty, navigation]);


  const firstNameOnChangeHandle = (value) => {
    setFirstName(value.replace(/^[^A-Za-z]+|[^A-Za-z ]+/g, ''));
    setIsAnyUpdated(true)

    if (value !== "") {
      setFirstNameValidation(false);
    }
  };

  const lastNameOnChangeHandle = (value) => {
    setIsAnyUpdated(true)

    if (value !== "") {
      setLastNameValidation(false);
    }
    setLastName(value.replace(/^[^A-Za-z]+|[^A-Za-z ]+/g, ''));
  };

  const pickImageFromGallery = async () => {
    await launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1 },
      (response) => {
        if (response.assets) {
          setIsAnyUpdated(true)
          setImagePic(response.assets[0].uri);
          setImageSelectionModal(false)
        }
      }
    );

  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const sdkVersion = Platform.Version;

      try {
        let granted = false;

        if (sdkVersion >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        } else if (sdkVersion >= 29) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ]);
          granted =
            result[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
            result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (!granted) {
          showPermissionAlert('gallery');
          return
        }
        pickImageFromGallery()
      } catch (error) {
        showPermissionAlert('gallery');
        return { granted: false, error };
      }
    } else if (Platform.OS === 'ios') {
      try {
        const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          pickImageFromGallery()
          // return { granted: true };
        } else if (status === RESULTS.BLOCKED) {
          showPermissionAlert('gallery');
          return
        } else {
          showPermissionAlert('gallery');
          return
        }
      } catch (error) {
        console.warn('iOS Permission error:', error);
        return
      }
    }
  };


  const showPermissionAlert = (type) => {
    const title = 'permission_required';
    const message = type === 'camera' ? 'cameraDesc' : 'galleryDesc';
    const cancelText = 'cancel';
    const settingsText = 'open_settings';

    Alert.alert(translate(title), translate(message),
      [
        {
          text: translate(cancelText),
          style: 'cancel'
        },
        {
          text: translate(settingsText),
          onPress: () => Linking.openSettings()
        }
      ],
      { cancelable: true }
    );
  };

  const takePhoto = async () => {
    await launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
      if (response.assets) {
        setIsAnyUpdated(true)
        setImagePic(response.assets[0].uri);
        setImageSelectionModal(false)
      }
    });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS == 'android') {
      const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      const result = await PermissionsAndroid.request(permission);


      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        takePhoto()
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        showPermissionAlert('camera');
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        showPermissionAlert('camera');
      }
    } else if (Platform.OS == 'ios') {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        takePhoto()
      } else if (status === RESULTS.BLOCKED) {
        showPermissionAlert('camera');
      } else {
        showPermissionAlert('camera');
      }
    }
  };


  const profileUpdateBtn = () => {
    let aplRegex = /^[A-Za-z][A-Za-z ]*$/;
    if (!firstName.trim()) {
      setFirstNameValidation(true);
      setFirstNameErrorMsssg(translate("Please_enter_first_name"));
    } else if (!aplRegex.test(firstName)) {
      setFirstNameValidation(true);
      setFirstNameErrorMsssg(translate("Invalid_first_name"));
    } else if (pinCodeValue != "" && pinCodeValue.length !== 6) {
      setValidationContent(translate("Please_Enter_valid_pincode"))
      setPinCodeValidation(true)
    }

    else {
      updateButton();
    }
  };

  const editButton = () => {
    if (isConnected) {
      setEditEnable(false)
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
    }

  };



  const fetchState = async () => {
    if (isConnected) {

      try {
        const url = APIConfig.BASE_URL + APIConfig.GETMASTERALLSTATES

        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        console.log("STATE=-=-=-=-=>", response)

        if (response.statusCode === 200) {
          setStateList(response.data.statesList)
          setStateList2(response.data.statesList)
        }
      } catch (error) {
        SimpleToast.show(translate("NetworkRequestFailed"))
      }
    }
  };

  const fetchDistrict = async () => {
    if (isConnected) {

      try {
        const url = APIConfig.BASE_URL + APIConfig.GETMASTERALLDISTRICTS

        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        if (response.statusCode === 200) {
          console.log("District=-=-=-=-=>", response.data.districtList)

          setDistictList(response.data.districtList)
        }
      } catch (error) {
        SimpleToast.show(translate("NetworkRequestFailed"))

      }
    }
  };


  const addressLIneOnChangeHandle = (value) => {
    setIsAnyUpdated(true)

    SetAddressLineValue(value)
    setAddressLineValidation(false)
  }

  const landMarkOnChangeHandle = (value) => {
    setIsAnyUpdated(true)

    SetLandMarkValue(value.replace(/[^a-zA-Z0-9 /:;-]/g, ""))
    setLandValidation(false)
  }

  const villageOnChangeHandle = (value) => {
    setIsAnyUpdated(true)

    setVillageValue(value.replace(/[^a-zA-Z0-9 ]/g, ""))
    setvillageValidation(false)
  }

  const tashilOnChangeHandle = (value) => {
    setIsAnyUpdated(true)

    setTasilValue(value)
    setTashilValidation(false)
  }

  const pinCodeOnChangeHandle = (value) => {
    setIsAnyUpdated(true)

    setPincodeValue(value.replace(/[^0-9]/g, '').replace(/^[^1-9]+/, ''))
    setPinCodeValidation(false)
  }


  const stateDropDownModalHandle = (value) => {
    if (!editEnable) {
      setSatteDropDownVisible(value)
    }
  }

  const closeStateDropDownModalHandle = (value) => {
    setSatteDropDownVisible(false)
    SetSearchStateValue("")
    setStateList2(stateList)
  }

  const SelectStateHandle = (value, stateId) => {
    console.log("test=-=-=>", value)
    console.log("dis=-=->", districtList[0].state)
    setIsAnyUpdated(true)
    setStateId(stateId)
    setStateValue(value)
    const filterDate = districtList.filter((item) => item.state.name.toLowerCase() === value.toLowerCase())
    setDistictList2(filterDate)
    setDistictList3(filterDate)
    setSatteDropDownVisible(false)
    setDistrictValue(translate("select_dict"))
    setStateValidation(false)
    setStateList2(stateList)
    SetSearchStateValue("")
  }


  const districtDropDownModalHandle = (value) => {
    if (stateValue !== translate("select_state")) {
      if (!editEnable) {
        setDistrictDropDownVisible(value)
        setIsAnyUpdated(true)

        const filterDate = districtList.filter((item) => item.state.name.toLowerCase() === stateValue.toLowerCase())
        setDistictList2(filterDate)
      }

    } else {
      SimpleToast.show(translate("select_state"))

    }
  }

  const stateSearchHandle = (value) => {
    // console.log("checaj=-=-=->",value)
    SetSearchStateValue(value)

    if (value.length > 0) {
      const filterState = stateList.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
      setStateList2(filterState)

    } else {
      setStateList2(stateList)
    }
  }

  const districtSearchHandle = (value) => {
    console.log("checaj=-=-=->", value)
    setSearcDistrictValue(value)

    if (value.length > 0) {
      const filterState = districtList2.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))

      setDistictList3(filterState)

    } else {
      setDistictList3(districtList2)
    }

  }

  const closeDistrictModal = () => {
    setDistrictDropDownVisible(false)
    setSearcDistrictValue("")
    setDistictList3(districtList2)
  }

  const SelectDistrictHandle = (value, districtId) => {
    setDistrictId(districtId)
    setDistrictValue(value)
    setDistrictDropDownVisible(false)
    setDistrictValidation(false)
    setDistictList3(districtList2)
    setSearcDistrictValue("")
  }


  const goHome = async () => {
    const screenName = await getFromAsyncStorage(SCREENNAME)
    setAlertModal(false);
    setTimeout(() => {
      screenName == EMP_DASHBOARD_SCREEN ? navigation.navigate('BottomTabsNavigatorEmp') : navigation.navigate('MainTabs');
    }, 200);
  };

  const saveLocalAsynchStorage = async (response) => {
    console.log("test-=-=->", response)
    try {
      if (response?.firstName) {
        await deleteFromAsyncStorage(USERNAME);
        await deleteFromAsyncStorage(FIRSTNAME);
        await deleteFromAsyncStorage(LASTNAME);
        await storeInAsyncStorage(USERNAME, `${response?.firstName} ${response?.lastName}`);
        await storeInAsyncStorage(FIRSTNAME, `${response?.firstName}`);
        await storeInAsyncStorage(LASTNAME, `${response?.lastName}`);
      }
      if (response?.profileImage) {
        await deleteFromAsyncStorage(USER_IMG);
        await storeInAsyncStorage(USER_IMG, response.profileImage);
        console.log('Stored Profile Image URI:', response.profileImage);
        setImagePic(response.profileImage); // Update state with server URI
      }
      if (response?.state) {
        await Promise.all([
          deleteFromAsyncStorage(STATE_ID),
          deleteFromAsyncStorage(STATE_NAME),
          storeInAsyncStorage(STATE_ID, `${response?.stateId}`),
          storeInAsyncStorage(STATE_NAME, `${response?.state}`),
        ]);
      }
      if (response?.district) {
        await Promise.all([
          deleteFromAsyncStorage(DISTRICT_ID),
          deleteFromAsyncStorage(DISTRICT_NAME),
          storeInAsyncStorage(DISTRICT_ID, `${response?.districtId}`),
          storeInAsyncStorage(DISTRICT_NAME, `${response?.district}`),
        ]);
      }
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      SimpleToast.show(translate("Storage_error"));
    }
  };

  const updateButton = async () => {
    setLoader(true);
    const formData = new FormData();
    const finalFormJSON = {
      formName: "Profile Screen",
      fields: {
        latitude: locationCheck?.latitude != null ? locationCheck.latitude.toString() : "",
        longitude: locationCheck?.longitude != null ? locationCheck.longitude.toString() : "",
        mobileNumber: await getFromAsyncStorage(MOBILENUMBER) || "",
        firstName: firstName,
        lastName: lastName,
        totalAcres: totalAcres,
        addressLine: addressLineValue,
        landMark: landMarkValue,
        villageLocation: villageValue,
        tahsil: tashilValue,
        state: stateValue === translate("select_state") ? "" : stateValue,
        district: districtValue === translate("select_dict") ? "" : districtValue,
        pincode: pinCodeValue,
        stateId: stateId,
        districtId: districtId,
        crop: ""
      }
    };
    if (imagePic && !imagePic.includes("http")) {
      formData.append('profileImage', {
        uri: imagePic,
        name: 'updateprofile.jpg',
        type: 'image/jpeg', // Use specific type for consistency
      });
    } else {
      formData.append('profileImage', "");
    }

    formData.append('data', JSON.stringify({ "data": finalFormJSON }));

    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers['Content-Type'] = APIConfig.MULTIPARTFORMDATA;
        headers.authType = "JSONREQUEST";
        const url = APIConfig.BASE_URL + APIConfig.AUTH.UPDATEPROFILE;
        console.log("Request URL:", url);
        console.log("Headers:", headers);
        console.log("Form Data:", formData);

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: headers
        });

        const jsonData = await response.json();
        console.log("Raw Response Data:=-=->", JSON.stringify(jsonData));
        if (jsonData.statusCode === HTTP_OK) {
          console.log("Parsed JSON Response:", jsonData);
          await saveLocalAsynchStorage(jsonData?.response);
          const data = jsonData.response
          const dynamicStyles = existingDynamicStyles;
          console.log("kiranRedux=-=->", dynamicStyles)
          dynamicStyles.firstName = (data?.firstName != undefined && data?.firstName != "" && data?.firstName != null) ? data?.firstName : "";
          dynamicStyles.lastName = (data?.lastName != undefined && data?.lastName != "" && data?.lastName != null) ? data?.lastName : "";
          dynamicStyles.pincode = (data?.pincode != undefined && data?.pincode != "" && data?.pincode != null) ? data?.pincode : "";
          dynamicStyles.state = (data?.state != undefined && data?.state != "" && data?.state != null) ? data?.state : "";
          dynamicStyles.district = (data?.district != undefined && data?.district != "" && data?.district != null) ? data?.district : "";
          dynamicStyles.tahsil = (data?.tahsil != undefined && data?.tahsil != "" && data?.tahsil != null) ? data?.tahsil : "";
          dynamicStyles.addressLine = (data?.addressLine != undefined && data?.addressLine != "" && data?.addressLine != null) ? data?.addressLine : "";
          dynamicStyles.landMark = (data?.landMark != undefined && data?.landMark != "" && data?.landMark != null) ? data?.landMark : "";
          dynamicStyles.villageLocation = (data?.villageLocation != undefined && data?.villageLocation != "" && data?.villageLocation != null) ? data?.villageLocation : "";
          dynamicStyles.crop = (data?.crop != undefined && data?.crop != "" && data?.crop != null) ? data?.crop : "";
          dynamicStyles.stateId = (data?.stateId != undefined && data?.stateId != "" && data?.stateId != null) ? data?.stateId : "";
          dynamicStyles.districtId = (data?.districtId != undefined && data?.districtId != "" && data?.districtId != null) ? data?.districtId : "";
          dispatch(setCompanyStyle(dynamicStyles));

          setLoader(false);
          setAlertTextContent(jsonData?.message || translate("update_success"));
          setAlertModal(true);
        } else {
          setLoader(false);
          SimpleToast.show(jsonData?.message || translate("Unable_to_fetch_issue_details"));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoader(false);
        SimpleToast.show(translate("NetworkRequestFailed"));
      }
    } else {
      setLoader(false);
      SimpleToast.show(translate("no_internet_conneccted"));
    }
  };

  console.log("imagePic=-=->", imagePic)

  handleBackBtn = () => {
    navigation.goBack()
  }

  return (
    <View style={[styles.flexFull, { backgroundColor: "#F2F6F9" }]}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={dynamicStyles.primaryColor}
          barStyle={currentTheme.statusBar}
        />
      )}

      <View>
        <View
          style={[
            // styles.height_129,
            styles.widthPct_,
            {
              backgroundColor: dynamicStyles.primaryColor,
              justifyContent: "center",
              alignItems: "center",
              height: 100
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleBackBtn}
            style={{ position: "absolute", left: 20 }}
          >
            <Image
              style={{ tintColor: dynamicStyles.secondaryColor }}
              source={require("../../assets/Images/BackIcon.png")}
              accessibilityLabel="Back Icon"
            />
          </TouchableOpacity>

          <Text
            style={[
              { color: dynamicStyles.secondaryColor, fontSize: 17, fontFamily: fonts.SemiBold },
            ]}
          >
            {translate("Profile")}
          </Text>
        </View>

        <View style={[{ position: "absolute", right: 20, top: 20, marginTop: 20 }]}>
          <Image
            source={require('../../assets/Images/flowerIcon.png')}
            style={{
              position: "absolute",
              top: 0,
              right: 10,
              height: 50,
              width: 100,
              tintColor: "#000",
              resizeMode: "contain"
            }}
          />
        </View>

        <View style={[styles.height_10]}>
          <TouchableOpacity
            disabled={editEnable}
            onPress={() => setImageSelectionModal(true)}
            style={[styles.white_bg, { borderRadius: 50, right: 35, bottom: -25, position: 'absolute' }]}
          >
            {imagePic ? (
              <Image resizeMode="" source={{ uri: imagePic }} style={{ height: 90, width: 90, borderRadius: 45 }} />
            ) : (
              <>
                <Image
                  source={require('../../assets/Images/ProfileImg.png')}
                  style={{ resizeMode: 'contain', height: 90, width: 90 }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    borderRadius: 20,
                    padding: 5
                  }}
                >
                  <Image
                    source={require("../../assets/Images/camIcon.png")}
                    style={[{ marginRight: 15, width: 20, height: 20, resizeMode: "contain" }]}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
        {editEnable &&
          <TouchableOpacity onPress={editButton} style={{ position: "absolute", right: width * 0.07, top: 60, height: 25, width: 25, borderRadius: 12, backgroundColor: dynamicStyles.secondaryColor, justifyContent: "center", alignItems: "center" }}>
            <Image style={{ height: 15, width: 15, tintColor: dynamicStyles.primaryColor }} source={require("../../assets/Images/editPic.png")} />
          </TouchableOpacity>
        }

      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          // paddingBottom: 60, // small bottom padding for smooth scroll
        }}
      >
        <CustomRegTextField
          label={translate("first_name")}
          inputValue={firstName}
          placeHolderValue={translate("enter_first_name")}
          handleValue={firstNameOnChangeHandle}
          validationBorder={firstnameValidation}
          mandatory={true}
          editable={!editEnable}
        />
        {firstnameValidation && (
          <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.Medium }]}>{firstNameErrorMssg}</Text>
        )}
        <CustomRegTextField
          label={translate("last_name")}
          inputValue={lastName}
          placeHolderValue={translate("enter_last_name")}
          handleValue={lastNameOnChangeHandle}
          validationBorder={lastnameValidation}
          mandatory={false}
          editable={!editEnable}
        />
        <View>
          <Text style={[RnStyles.labelText, { fontFamily: fonts.SemiBold }]}>
            {translate("mobile_number")}
          </Text>
          <TextInput
            style={{
              width: '100%',
              height: 50,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              backgroundColor: '#EEEEEE',
              color: '#B6B8B7',
              paddingHorizontal: 15,
              fontFamily: fonts.Regular
            }}
            placeholder={translate("Type_here")}
            editable={false}
            onChangeText={setText}
            value={`+91${mobileNumber}`}
          />
        </View>

        <View>
          <Text style={[RnStyles.labelText, { fontFamily: fonts.SemiBold }]}>
            {translate("company")}
          </Text>
          <TextInput
            style={{
              // width: '100%',
              height: 50,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              paddingHorizontal: 15,
              backgroundColor: '#EEEEEE',
              color: '#B6B8B7',
              fontFamily: fonts.Regular
            }}
            placeholder={translate("Type_here")}
            editable={false}
            onChangeText={setText}
            value={companyName}
          />
        </View>

        <CustomPinCodeTextInput
          label={translate("Pincode")}
          placeHolderValue={translate("Enter_Pincode")}
          handleValue={pinCodeOnChangeHandle}
          inputValue={pinCodeValue}
          validationBorder={pinCodeValidation}
          editable={!editEnable}
        />
        {pinCodeValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.Medium }]}>{pinCodeValidationContent}</Text>}

        <CustomStateDropDown
          label={translate("State")}
          inputValue={stateValue}
          dropDownVisible={stateDropDownVisible}
          handleDropDown={stateDropDownModalHandle}
          // data={stateList}
          data={stateList2}
          validationsBorder={stateValidation}
          valueHandle={SelectStateHandle}
          closeDropDown={closeStateDropDownModalHandle}
          searchFilterHandle={stateSearchHandle}
          searchStateValue={searchStateValue}
        />

        <CustomStateDropDown
          label={translate("District")}
          inputValue={districtValue}
          dropDownVisible={distictDropDownVisible}
          handleDropDown={districtDropDownModalHandle}
          data={districtList3}
          validationsBorder={districtValidation}
          valueHandle={SelectDistrictHandle}
          closeDropDown={closeDistrictModal}
          searchFilterHandle={districtSearchHandle}
          searchStateValue={SearchDistrictValue}
        />


        <CustomAddressTextInput
          label={translate("Tahsil_Block")}
          placeHolderValue={translate("Enter_Tahsil_Block")}
          handleValue={tashilOnChangeHandle}
          inputValue={tashilValue}
          validationBorder={tashilValidation}
          editable={!editEnable}
        />

        <CustomAddressTextInput
          label={translate("Address_Line")}
          placeHolderValue={translate("Enter_Address_Line")}
          handleValue={addressLIneOnChangeHandle}
          inputValue={addressLineValue}
          validationBorder={addressLineValidation}
          editable={!editEnable}
        />


        <CustomVillageTextInput
          label={translate("Land_mark")}
          placeHolderValue={translate("Enter_Land_mark")}
          handleValue={landMarkOnChangeHandle}
          inputValue={landMarkValue}
          validationBorder={landMarkValidation}
          editable={!editEnable}
        />

        <CustomVillageTextInput
          label={translate("new_village")}
          placeHolderValue={translate("Enter_Village")}
          handleValue={villageOnChangeHandle}
          inputValue={villageValue}
          validationBorder={villageValidation}
          editable={!editEnable}
        />
      </ScrollView>


      <TouchableOpacity
        onPress={editEnable ? editButton : profileUpdateBtn}
        style={{
          width: "90%",
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          margin: 20,
          backgroundColor: dynamicStyles.primaryColor
        }}
      >
        <Text
          style={[
            {
              color: dynamicStyles.secondaryColor,
              fontSize: 14,
              // lineHeight: 20,
              fontFamily: fonts.SemiBold
            }
          ]}
        >
          {editEnable ? translate("edit") : translate("Update")}


        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={imageSelectionModal}
      >
        <TouchableWithoutFeedback>
          <View style={RnStyles.modalMainContainer1}>
            <View style={RnStyles.modalSubContainer1}>
              <View style={RnStyles.crossIconContainer1}>
                <Text style={{ fontFamily: fonts.SemiBold, color: "#000", fontSize: 14 }}>{translate("select")}</Text>
                <TouchableOpacity onPress={() => setImageSelectionModal(false)}>
                  <Image
                    source={require('../../assets/Images/crossIcon.png')}
                    style={RnStyles.crossIcon1}
                  />
                </TouchableOpacity>
              </View>

              <View>
                <TouchableOpacity onPress={requestCameraPermission} style={RnStyles.buttons}>
                  <Image
                    source={require('../../assets/Images/camIcon.png')}
                    style={[RnStyles.crossIcon1, { tintColor: dynamicStyles.primaryColor, marginRight: 15 }]}
                  />
                  <Text style={[RnStyles.cameraText, { fontFamily: fonts.SemiBold }]}>{translate("Camera")}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={requestGalleryPermission} style={RnStyles.button1}>
                  <Image
                    source={require('../../assets/Images/photoIconImg.png')}
                    style={[RnStyles.crossIcon1, { tintColor: dynamicStyles.primaryColor, marginRight: 15 }]}
                  />
                  <Text style={[RnStyles.cameraText, { fontFamily: fonts.SemiBold }]}>{translate("Gallery")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {loader && <PreLoginCustomLoader />}
      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={() => setAlertModal(false)}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={goHome}
      />
    </View>
  );
};

export default ProfileScreen;

const RnStyles = StyleSheet.create({
  bookNowButtonContainer: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 20
  },
  labelText: {
    color: "#5D5D5D",
    fontSize: RFValue(14, height),
    lineHeight: 25,
  },
  bookNowButtonText: {
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20
  },
  crossIcon1: {
    height: 20,
    width: 20,
    resizeMode: "contain"
  },
  cameraText: {
    color: "#000",
    fontSize: RFValue(15, height),
    lineHeight: 30
  },
  modalMainContainer1: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
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
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  crossIconContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    height: 50,
    marginVertical: 15,
    paddingLeft: 20,
    borderColor: "#D6D6D6",
    borderRadius: 11
  },
  button1: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    height: 50,
    paddingLeft: 20,
    borderColor: "#D6D6D6",
    borderRadius: 11
  },
  firstNameValidationText: {
    color: 'red',
    fontSize: RFValue(13, height),
    lineHeight: 25,
  },
  cropsListMainContainer: {
    flexDirection: "row",
    marginTop: 8
  },

  textInputContainer: {
    backgroundColor: "#D6D6D6",
    borderWidth: 1,
    height: 55,
    // marginTop: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
    marginBottom: 3,
    paddingLeft: 15,
    borderColor: "#F1F1F1"
  },
  totalAcreCountText: {
    color: "#000",
    fontWeight: "400",
    fontSize: 14
  },
  cropsItemContainer: {
    width: 100,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    borderColor: "#D6D6D6",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
});