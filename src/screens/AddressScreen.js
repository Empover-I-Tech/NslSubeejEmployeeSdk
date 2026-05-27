import { StyleSheet, Text, View, TextInput, Alert, Image, TouchableOpacity,StatusBar, Dimensions } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux';
import { Styles } from '../styles/Styles';
import { translate } from '../Localization/Localisation';
import { ScrollView } from 'react-native-gesture-handler';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { GetApiHeaders } from '../utils/helpers';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CustomPinCodeTextInput from '../components/CustomPincodeFieldEdit';
import CustomAddressTextInput from '../components/CustomAddressTextInputEdit';
import CustomStateDropDown from '../components/CustomStateDropDownEdit';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import CustomVillageTextInput from '../components/CustomVillageAddressTextInputEdit';
import { RFValue } from 'react-native-responsive-fontsize';
import SimpleToast from 'react-native-simple-toast';
const {height}=Dimensions.get("window")

const AddressScreen = ({ route }) => {
  const navigation = useNavigation()
  const currentTheme = useSelector((state) => state.theme.theme);
  const isConnected = useSelector((state) => state.network.isConnected);
  const dynamicStyles = useSelector(
    (state) => state.companyStyles.companyStyles
  );
  const styles = Styles(currentTheme);
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState('');
  const [landmark, setLandMark] = useState('')
  const [village, setVillage] = useState('')
  const [block, setBlock] = useState('');
  const [pincode, setPincode] = useState('');
  const [firstName, setFirstName] = useState("");
  const [locationMap, setLocationMap] = useState("Select Location")
  const [addressLineValue, SetAddressLineValue] = useState("")
  const [addressLineValidation, setAddressLineValidation] = useState(false)
  const [addressValidationContent, setAddresValidationContent] = useState("")
  const [landMarkValue, SetLandMarkValue] = useState("")
  const [landMarkValidation, setLandValidation] = useState(false)
  const [villageValue, setVillageValue] = useState("")
  const [villageValidation, setvillageValidation] = useState(false)
  const [tashilValue, setTasilValue] = useState("")
  const [tashilValidation, setTashilValidation] = useState(false)
  const [stateValue, setStateValue] = useState(translate("select_state"))
  const [stateList, setStateList] = useState([])
  const [stateDropDownVisible, setSatteDropDownVisible] = useState(false)
  const [stateValidation, setStateValidation] = useState(false)
  const [stateId, setStateId] = useState(null)
  const [districtValue, setDistrictValue] = useState(translate("select_dict"))
  const [districtList, setDistictList] = useState([])
  const [districtList2, setDistictList2] = useState([])
  const [districtId, setDistrictId] = useState(null)
  const [distictDropDownVisible, setDistrictDropDownVisible] = useState(false)
  const [districtValidation, setDistrictValidation] = useState(false)
  const [pinCodeValue, setPincodeValue] = useState("")
  const [pinCodeValidation, setPinCodeValidation] = useState(false)
  const [pinCodeValidationContent, setValidationContent] = useState("")
  const [loaderApi,setLoaderApi]=useState(false)
  const {fetchData } = useGetRequestWithJwt();

  useEffect(() => {
    setLoaderApi(true)

    getRegisteredDetails();
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoaderApi(true)

      fetchState()
      fetchDistrict()
    }, [])
  );

  const getRegisteredDetails = async () => {
    if(isConnected){
      setLoaderApi(false)

    try {
      const url = APIConfig.BASE_URL+APIConfig.GETREGISTEREDDETAILS
      const headers = await GetApiHeaders();
      const response = await fetchData(url, headers);
      if (response && response.statusCode === HTTP_OK) {
        setLoaderApi(false)
        console.log("API Response:", response);
        const parsedData = JSON.parse(response.data);
        setFirstName(parsedData?.firstName || "");
        setLocationMap(parsedData?.location || "");
        SetAddressLineValue(parsedData?.addressLine || "");
        SetLandMarkValue(parsedData?.landMark || "");
        const villageLocation = parsedData?.villageLocation || "";
        const village = villageLocation.split(',')[1] || "";
        setVillageValue(parsedData?.villageLocation || "");
        setTasilValue(parsedData?.tahsil);
        setStateValue(parsedData?.state || "");
        setDistrictValue(parsedData?.district || "");
        setPincodeValue(parsedData?.pincode || "");
        setLoaderApi(false)
      } else {
        console.error("API Error:", response?.message || "Unexpected error occurred");
      }
    } catch (error) {
      setLoaderApi(false)
      SimpleToast.show(translate("NetworkRequestFailed"))
    }}else{
      SimpleToast.show(translate("no_internet_conneccted"))
      setLoaderApi(false)
    }
  };

  const fetchState = async () => {
    if (isConnected) {
      try {
        const url = APIConfig.BASE_URL + APIConfig.GETMASTERALLSTATES
        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        if (response.statusCode === 200) {
          setStateList(response.data.statesList)
        }
      } catch (error) {
        SimpleToast.show(translate("NetworkRequestFailed"))
      }
    }
    else {
      SimpleToast.show(translate("no_internet_conneccted"))
    }
  };

const fetchDistrict = async () => {
    if (isConnected) {
    try {
        const url =APIConfig.BASE_URL+APIConfig.GETMASTERALLDISTRICTS
        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        if (response.statusCode === 200) {
            setDistictList(response.data.districtList)
        }
    } catch (error) {
         SimpleToast.show(translate("NetworkRequestFailed"))   
    }}
    else{
        SimpleToast.show(translate("no_internet_conneccted"))
    }
};

  const SelectStateHandle = (value, stateId) => {
    setStateId(stateId)
    setStateValue(value)
    const filterDate = districtList.filter((item) => item.state.name === value)
    setDistictList2(filterDate)
    setSatteDropDownVisible(false)
    setDistrictValue(translate("select_dict"))
    setStateValidation(false)
  }

  const SelectDistrictHandle = (value, districtId) => {
    setDistrictId(districtId)
    setDistrictValue(value)
    setDistrictDropDownVisible(false)
    setDistrictValidation(false)
  }

  const districtDropDownModalHandle = (value) => {
    if (stateValue !== translate("select_state")) {
      setDistrictDropDownVisible(value)
      const filterDate = districtList.filter((item) => item.state.name === stateValue)
      setDistictList2(filterDate)
    } else {
      // Alert.alert(translate("select_state"))
      SimpleToast.show(translate("select_state"))

    }
  }

  const closeDistrictModal = () => {
    setDistrictDropDownVisible(false)
  }


  const stateDropDownModalHandle = (value) => {
    setSatteDropDownVisible(value)
  }

  const closeStateDropDownModalHandle = (value) => {
    setSatteDropDownVisible(false)
  }

  const addressLIneOnChangeHandle = (value) => {
    SetAddressLineValue(value)
    setAddressLineValidation(false)
  }

  const landMarkOnChangeHandle = (value) => {
    SetLandMarkValue(value.replace(/[^a-zA-Z0-9 /:;-]/g, ""))
    setLandValidation(false)
  }

  const villageOnChangeHandle = (value) => {
    setVillageValue(value.replace(/[^a-zA-Z0-9 ]/g, ""))
    setvillageValidation(false)
  }

  const tashilOnChangeHandle = (value) => {
    setTasilValue(value)
    setTashilValidation(false)
  }

  const pinCodeOnChangeHandle = (value) => {
    setPincodeValue(value.replace(/[^0-9]/g, ''))
    setPinCodeValidation(false)
  }


  const saveBtn = () => {
    if (addressLineValue === "") {
      setAddressLineValidation(true)
      setAddresValidationContent(translate("Please_Enter_Address"))
    } else if (addressLineValue.length < 4) {
      setAddressLineValidation(true)
      setAddresValidationContent(translate("Please_Enter_Valid_Address"))
    }
    else if (tashilValue === "") {
      setTashilValidation(true)
    }
    else if (stateValue === translate("select_state")) {
      setStateValidation(true)
    }
    else if (districtValue === translate("select_dict")) {
      setDistrictValidation(true)
    }
    else if (pinCodeValue === "") {
      setValidationContent(translate("Please_Enter_pincode"))
      setPinCodeValidation(true)
    } else if (pinCodeValue.length !== 6) {
      setValidationContent(translate("Please_Enter_valid_pincode"))
      setPinCodeValidation(true)
    }
    else {
      console.log("SUCEESSSFULLY=-=-=>")
      // handleSubmit2()
      // handleSubmit()
    }
  }

  const handleLocationClick = async () => {
    navigation.navigate('MapScreen', route.params)
}


  return (
    <View style={MyStyles.mainContainer}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={dynamicStyles.primaryColor}
          barStyle={currentTheme.statusBar}
        />
      )}
  
      <View style={[MyStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
        <View style={MyStyles.headerContentContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/Images/BackIcon.png')} style={[MyStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
          </TouchableOpacity>
          <Text style={[MyStyles.bookSeedsText, { color: dynamicStyles.secondaryColor }]}>{translate("address")}</Text>
          <View style={{width:40}}/>
        </View>
        <Image source={require('../../assets/Images/flowerIcon.png')} style={MyStyles.flowerImg} />
      </View>
      <ScrollView>
        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
          <View style={[styles.white_bg, styles.width_333, styles.marginTop_20, Styles.marginBottom_30, { borderRadius: 10, paddingHorizontal: 10,paddingVertical:10 }]}>
            {/* <View style={MyStyles.container}>
              <Text style={MyStyles.label}>{"Location"}</Text>
              <View style={[MyStyles.inputContainer, { borderColor:"#D6D6D6" }]}>
                <TextInput
                  style={MyStyles.input}
                  placeholder={"Select Location"}
                  value={locationMap}
                  onChangeText={(value) => setLocationMap(value)}
                  placeholderTextColor="gray"
                  editable={false}
                />
                <TouchableOpacity disabled={true}
                // onPress={handleLocationClick}
                >
                  <Image
                    source={require("../../assets/Images/LocationImg.png")}
                    style={MyStyles.image}
                  />
                </TouchableOpacity>
              </View>
            </View> */}
            <CustomAddressTextInput
              label={translate("Address_Line")}
              placeHolderValue={"N/A"}
              handleValue={addressLIneOnChangeHandle}
              inputValue={addressLineValue}
              validationBorder={addressLineValidation}
            />
            {addressLineValidation &&
              <Text style={MyStyles.firstNameValidationText}>{addressValidationContent}</Text>}

            <CustomVillageTextInput
              label={translate("Land_mark")}
              placeHolderValue={"N/A"}
              handleValue={landMarkOnChangeHandle}
              inputValue={landMarkValue}
              validationBorder={landMarkValidation}
            />
            <CustomVillageTextInput
              label={translate("new_village")}
              placeHolderValue={"N/A"}
              handleValue={villageOnChangeHandle}
              inputValue={villageValue}
              validationBorder={villageValidation}
            />
            <CustomAddressTextInput
              label={translate("Tahsil_Block")}
              placeHolderValue={"N/A"}
              handleValue={tashilOnChangeHandle}
              inputValue={tashilValue}
              validationBorder={tashilValidation}
            />
            {tashilValidation && <Text style={MyStyles.firstNameValidationText}>{translate("Please_Enter_Tashil")}</Text>}
            <CustomStateDropDown
              label={translate("State")}
              inputValue={stateValue}
              dropDownVisible={stateDropDownVisible}
              handleDropDown={stateDropDownModalHandle}
              data={stateList}
              validationsBorder={stateValidation}
              valueHandle={SelectStateHandle}
              closeDropDown={closeStateDropDownModalHandle}
            />
            {stateValidation && <Text style={MyStyles.firstNameValidationText}>{translate("Please_Select_State")}</Text>}

            <CustomStateDropDown
              label={translate("District")}
              inputValue={districtValue}
              dropDownVisible={distictDropDownVisible}
              handleDropDown={districtDropDownModalHandle}
              data={districtList2}
              validationsBorder={districtValidation}
              valueHandle={SelectDistrictHandle}
              closeDropDown={closeDistrictModal}
            />
            {districtValidation && <Text style={MyStyles.firstNameValidationText}>{translate("Please_Select_District")}</Text>}
            <CustomPinCodeTextInput
              label={translate("Pincode_nearby")}
              placeHolderValue={"N/A"}
              handleValue={pinCodeOnChangeHandle}
              inputValue={pinCodeValue}
              validationBorder={pinCodeValidation}
            />
            {pinCodeValidation && <Text style={MyStyles.firstNameValidationText}>{pinCodeValidationContent}</Text>}


          </View>

          <TouchableOpacity disabled={true} onPress={() => saveBtn()}
            style={[
              styles.height_44,
              styles.width_315,
              styles.marginTop_10,
              {
                // backgroundColor: dynamicStyles.primaryColor,
                backgroundColor:"#B6B8B7",

                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                flexDirection: "row",
                paddingHorizontal: 10,
              },
            ]}
          >
            <Text
              style={[
                styles.fontSize_12,
                styles.centerContent,
                { color: dynamicStyles.secondaryColor },
              ]}
            >
              {translate("save")}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      {loaderApi&&<PreLoginCustomLoader/>}

    </View>
  )
}

export default AddressScreen

const MyStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
  },
  label: {
    fontWeight: "500",
    marginVertical:10,
    fontSize:RFValue(14,680)
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFBFB",
    borderRadius: 10,
    paddingHorizontal: 10,
    width: "100%",
    borderWidth: 1,
  },
  input: {
    height: 50,
    flex: 1,
    color: "#00000080"
  },
  image: {
    width: 15,
    height: 15,
    resizeMode: "contain",
    marginLeft: 10,
  },


  mainContainer: {
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
    alignItems: "center",
    // width: "60%"
  },

  backArrowImg: {
    height: 40,
    width: 40,
    resizeMode: "contain"
  },

  bookSeedsText: {
    fontSize:RFValue(16,height),
    fontWeight: "500",
    alignSelf:"center",
    lineHeight: 30
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

  firstNameValidationText: {
    color: "#ED3237",
    fontSize: 14,
    fontWeight: "400"
  },
})