import {
    View, StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    ImageBackground,
    Dimensions,
    BackHandler,
    Modal,
    TouchableWithoutFeedback,
    StatusBar,
    SafeAreaView,
    Alert,
    Linking,
    PermissionsAndroid
} from "react-native"
import { useState, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt'
import CustomRegTextField from "../components/CustomRegTextField";
import CustomCropsDropDown from "../components/CustomCropsDropDown";
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import CustomAddressTextInput from "../components/CustomAddressTextInput";
import CustomStateDropDown from "../components/CustomStateDropDown";
import * as ImagePicker from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Styles } from '../styles/Styles';
import usePostRequestWithJwt from '../api/usePostRequestWithJwt';
import { downloadFileToLocal, GetApiHeaders } from '../utils/helpers';
import { JWTAUTHENTICATION, MOBILENUMBER, ROLDID, USER_ID, USERNAME, USER_IMG, FIRSTNAME, LASTNAME, COMPANYCODE, SCREENNAME, EMP_DASHBOARD_SCREEN, ROLENAME } from '../utils';
import { getFromAsyncStorage, storeInAsyncStorage } from '../utils/keychainUtils';
import CustomLoader from '../components/CustomLoader';
import axios from 'axios';
import { setCompanyStyle } from '../state/actions/companyStyles';
import { RNFS, stat } from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
import { RFValue } from "react-native-responsive-fontsize";
import CustomVillageTextInput from "../components/CustomVillageAddressTextInput";
import CustomPinCodeTextInput from "../components/CustomPincodeField";
import RenderHTML from 'react-native-render-html';
import SimpleToast from 'react-native-simple-toast';
import { createJwtToken } from "../utils/helpers";
import { CustomCommonModal } from "../components/CustomCommonModal";
import { useFontStyles } from "../hooks/useFontStyles";
import DeviceInfo from "react-native-device-info";
const { width, height } = Dimensions.get('window');

const RegistrationRn = ({ route }) => {
    const fonts = useFontStyles()
    const selectedCompanyData = useSelector(state => state.selectedCompnayAct.selectedCompanyAct)
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const currentTheme = useSelector(state => state.theme.theme);
    const { fetchData } = useGetRequestWithJwt();
    const { sendData, error: apiError } = usePostRequestWithJwt();
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const isConnected = useSelector(state => state.network.isConnected);
    const [apiRequestType, setApiRequestType] = useState(null);

    const [selectedLanguageId, setSelectedLanguageId] = useState(selectedCompanyData.languageId || 0);
    const [selectedCompany, setSelectedCompany] = useState(selectedCompanyData.selectedCompanyDet || {});
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [regSuccessModal, setRegSuccessModal] = useState(false)
    // const [companyLogo, setCompanyLogo] = useState(route?.params?.selectedCompany?.companyLogo)
    const [programLogo, setProgramLogo] = useState(selectedCompanyData.selectedCompanyDet.programLogo)
    const [loader, setLoader] = useState(false)
    // const [programName, setProgramName] = useState(route?.params?.selectedCompany?.programName)
    const [CompanyLoader, setCompanyLoader] = useState(selectedCompanyData.selectedCompanyDet.loaderLogo)
    const [welcomeMssg, setWelcomeMssg] = useState(selectedCompanyData.selectedCompanyDet.welcomeMessage)


    const [isSelfyScreen, setSelfyScreen] = useState(false)
    const [selfyPic, setSelfyPic] = useState("")
    const [firstName, setFirstName] = useState("")
    const [firstnameValidation, setFirstNameValidation] = useState(false)
    const [firstNameErrorMssg, setFirstNameErrorMsssg] = useState("")
    const [lastName, setLastName] = useState("")
    const [lastnameValidation, setLastNameValidation] = useState(false)
    const [lastNameErrorMssg, setLastNameErrorMsssg] = useState("")
    const [addCropsModalOpen, setAddCropModalOpen] = useState(false)
    const [cropsList, setCropsList] = useState([]);
    const [CropListValidations, setCropListValidation] = useState(false)
    const [selectedCropName, setSelectCropName] = useState("")
    const [selectedCropNameModalOpen, setSelectedCropNameModalOpen] = useState(false)
    const [acresValue, setAcrsValue] = useState("")
    const [enterAcreValidations, setEnterAcrValidation] = useState(false)
    const [cropsListItems, setCropsListItems] = useState([])
    const [enterAcrValidationContent, setEnterAcrValidationContent] = useState("")
    const [totalAcres, setTotalAcres] = useState(0)
    const [locationMap, setLocationMap] = useState(translate("Select_Location"))
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
    const [stateList2, setStateList2] = useState([])
    const [stateDropDownVisible, setSatteDropDownVisible] = useState(false)
    const [stateValidation, setStateValidation] = useState(false)
    const [stateId, setStateId] = useState(null)
    const [districtValue, setDistrictValue] = useState(translate("select_dict"))
    const [districtList, setDistictList] = useState([])
    const [districtList2, setDistictList2] = useState([])
    const [districtList3, setDistictList3] = useState([])
    const [districtId, setDistrictId] = useState(null)
    const [distictDropDownVisible, setDistrictDropDownVisible] = useState(false)
    const [districtValidation, setDistrictValidation] = useState(false)
    const [pinCodeValue, setPincodeValue] = useState("")
    const [pinCodeValidation, setPinCodeValidation] = useState(false)
    const [pinCodeValidationContent, setValidationContent] = useState("")
    const [imagModalVisible, setImgModal] = useState(false)
    const [viewImgModal, setViewModal] = useState(false)
    const [cameraPermission, setCameraPermission] = useState(null);
    const [storagePermission, setStoragePermission] = useState(null);
    const [imgName, setImgName] = useState("")
    const [imgType, setImgType] = useState("")
    const [alertModal, setAlertModal] = useState(false)
    const [searchStateValue, SetSearchStateValue] = useState("")
    const [SearchDistrictValue, setSearcDistrictValue] = useState("")
    const [coordinates, setCoordinates] = useState({});
    const [registerDisableBtn, setRegisterDisableBtn] = useState(false)
    console.log("CompanyLoader=->", CompanyLoader)
    console.log("FINALTESTING=-=-==-=>", selectedCompany)
    const alertCloseHandle = () => {
        setAlertModal(false)
    }

    useFocusEffect(
        useCallback(() => {
            fetchHybridsAndIssueTypesAndCrops()
            fetchState()
            fetchDistrict()
            checkPermissions()
            GetUserLocation()
        }, [])
    );

    // useEffect(() => {
    //     // const backAction = () => {
    //     //     navigation.goBack();
    //     //     return true;
    //     // };
    //     // BackHandler.addEventListener('hardwareBackPress', backAction);
    //     // return () => {
    //     //     BackHandler.removeEventListener('hardwareBackPress', backAction);
    //     // };
    // }, [])

    useEffect(() => {
        if (route.params?.latitude && route.params?.longitude && route.params?.address) {
            console.log("step=-=-=->1", route.params.latitude)
            console.log("step=-=-=->2", route.params.longitude)
            console.log("step=-=-=->3", route.params.address)

            setLatitude(route.params.latitude);
            setLongitude(route.params.longitude);
            SetAddressLineValue(route.params.address);
            setLocationMap(route.params.address)
            getDetailsFromLatlong(route.params.latitude, route.params.longitude)
        }
    }, [route.params?.latitude]);

    const imageModaleHandle = (value) => {
        setImgModal(value)
    }

    const viewImageHandle = (value) => {
        setImgModal(false)
        setViewModal(value)
    }

    const retakeSelfyHandle = async () => {
        const result = await ImagePicker.launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
            console.log("kiranaslpas>>>>>", result)
            if (response.assets) {
                setSelfyPic(response.assets[0].uri);
                setImgModal(false)
                setViewModal(false)
            }
        });
    };

    const removeSelfyHandle = async () => {
        setSelfyPic("");
        setImgModal(false)
        setViewModal(false)
    };


    const GetUserLocation = async () => {
        if (isConnected) {
            try {
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLatitude(latitude)
                        setLongitude(longitude)
                        setCoordinates(position.coords)
                    },
                    (error) => {
                        if (error.code === 3 || error.code === 2) {
                            Geolocation.getCurrentPosition(
                                (position) => {
                                    const { latitude, longitude } = position.coords;
                                    setLatitude(latitude)
                                    setLongitude(longitude)
                                    setCoordinates(position.coords)
                                    const formattedLocation = `${latitude},${longitude}`;
                                },
                                () => GetUserLocation(),
                                { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 },
                            );
                        }
                    },
                    { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
                );
            } catch (err) {
                console.error("Unexpected error:", err);
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
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

            if (response.data && response.data.results) {
                const { pincode, state, district, village, street, subDistrict, lat, lng, formatted_address } = response.data.results[0];
                setStateValue(state)
                setPincodeValue(pincode)
                setVillageValue(village)
                setTasilValue(subDistrict)
                setLatitude(lat)
                setLongitude(lng)
                const districtExists = districtList.some(
                    (district) => district.state.name.toLowerCase() === state.toLowerCase() && district.name.toLowerCase() === district.toLowerCase()
                );
                if (!districtExists) {
                    setDistrictValue(translate("select_dict"));
                } else {
                    setDistrictValue(district)
                }
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

    const handleSubmit2 = async () => {
        setLoader(true);
        const formData = new FormData();
        const valuesOnly = cropsListItems.map(item => item.cropsItemDetails);


        const finalFormJSON = {
            formName: "Registration Form",
            fields: {
                latitude: latitude || "",
                longitude: longitude || "",
                mobileNumber: await getFromAsyncStorage(MOBILENUMBER) || "",
                pincode: pinCodeValue,
                state: stateValue === translate("select_state") ? "" : stateValue,
                district: districtValue === translate("select_dict") ? "" : districtValue,
                languageId: selectedLanguageId,
                companyName: selectedCompany?.companyName,
                companyCode: selectedCompany?.companyCode,
                // companyLogo: selectedCompany?.companyLogo,
                // programLogo: selectedCompany?.programLogo,
                // programLogoNew:selectedCompany?.programLogoNew,
                // primaryColor: selectedCompany?.primaryColor,
                // secondaryColor: selectedCompany?.secondaryColor,
                // textColor: selectedCompany?.textColor,
                // loaderLogo: selectedCompany?.loaderLogo,
                // id: selectedCompany?.id,
                villageLocation: villageValue,
                crop: JSON.stringify(valuesOnly),
                firstName: firstName,
                lastName: lastName,
                totalAcres: totalAcres,
                stateId: stateId,
                districtId: districtId,
                location: locationMap,
                addressLine: addressLineValue,
                landMark: landMarkValue,
                tahsil: tashilValue,
            }
        };



        if (selfyPic) {
            formData.append('profilePic', {
                uri: selfyPic,
                name: imgName,
                type: imgType
            });
        }

        formData.append('data', JSON.stringify({ "data": finalFormJSON }));


        if (isConnected) {
            try {
                const headers = await GetApiHeaders();
                headers['Content-Type'] = APIConfig.MULTIPARTFORMDATA;
                headers.userCompanyCode = selectedCompany?.companyCode
                headers.authType = "JSONREQUEST"
                const url = APIConfig.BASE_URL + APIConfig.AUTH.SIGNUP;
                console.log("Request URL:", url);
                console.log("Headers:", headers);
                console.log("Form Data:", formData);

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: headers
                });

                const jsonData = await response.json();
                console.log("Raw ResponseDta:", jsonData);

                // if (!response.ok) {
                //     throw new Error(`HTTP Error: ${response.status}`);
                // }

                // const responseText = await response.text(); // Read response as text
                // console.log("Raw Response Text:", responseText);

                try {
                    // const responseData = JSON.parse(responseText); // Convert text to JSON
                    if (jsonData.statusCode === HTTP_OK) {
                        setRegisterDisableBtn(true)
                        console.log("Parsed JSON Response:", jsonData);
                        // const validateResponse = await decodeJwt(responseData.response);
                        // const data = JSON.parse(validateResponse);
                        const data = jsonData.response;
                        console.log("reigtartResone=-=-=->", data)
                        const dynamicStyles = {};
                        dynamicStyles.languageId = (data?.languageId != undefined && data?.languageId != "" && data?.languageId != null) ? data?.languageId : "1";

                        dynamicStyles.companyName = (data?.companyName != undefined && data?.companyName != "" && data?.companyName != null) ? data?.companyName : "";
                        dynamicStyles.programName = (data?.programName != undefined && data?.programName != "" && data?.programName != null) ? data?.programName : "";
                        dynamicStyles.companyCode = (data?.companyCode != undefined && data?.companyCode != "" && data?.companyCode != null) ? data?.companyCode : "";

                        dynamicStyles.companyLogo = (data?.companyLogo != undefined && data?.companyLogo != "" && data?.companyLogo != null) ? data?.companyLogo : "";

                        dynamicStyles.primaryColor = (data?.primaryColor != undefined && data?.primaryColor != "" && data?.primaryColor != null) ? data?.primaryColor : "#ed3237";

                        dynamicStyles.secondaryColor = (data?.secondaryColor != undefined && data?.secondaryColor != "" && data?.secondaryColor != null) ? data?.secondaryColor : "#ffffff";

                        dynamicStyles.textColor = (data?.textColor != undefined && data?.textColor != "" && data?.textColor != null) ? data?.textColor : "#000000";

                        dynamicStyles.id = (data?.id != undefined && data?.id != "" && data?.id != null) ? data?.id : "0";
                        if (data?.loaderLogo != undefined && data?.loaderLogo != "" && data?.loaderLogo != null) {
                            const filePath = await downloadFileToLocal(false, data?.loaderLogo, data?.loaderLogo.split('/').pop())
                            dynamicStyles.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
                            dynamicStyles.programInfo = (data?.programInfo != undefined && data?.programInfo != "" && data?.programInfo != null) ? data?.programInfo : "";

                            dynamicStyles.companyInfo = (data?.companyInfo != undefined && data?.companyInfo != "" && data?.companyInfo != null) ? data?.companyInfo : "";

                            dynamicStyles.programLogo = (data?.programLogo != undefined && data?.programLogo != "" && data?.programLogo != null) ? data?.programLogo : "";
                            dynamicStyles.programLogoNew = (data?.programLogoNew != undefined && data?.programLogoNew != "" && data?.programLogoNew != null) ? data?.programLogoNew : "";

                        } else {
                            dynamicStyles.loaderPath = "";
                        }

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
                        dynamicStyles.profilePic = (data?.profilePic != undefined && data?.profilePic != "" && data?.profilePic != null) ? data?.profilePic : "";

                        dispatch(setCompanyStyle(dynamicStyles));

                        await storeUserData(data);

                        // navigation.pop(1)
                        // showAlertWithMessage(translate('registerAlert'), true, true, translate('registrSuccessMsg'), true, false, translate('proceed'), translate('cancel'), true)
                        setRegSuccessModal(true)
                        setLoader(false)


                    } else {
                        setRegisterDisableBtn(false)
                        // Alert.alert(translate("Error"), translate("Unable_to_fetch_issue_details"));
                        // SimpleToast.show(translate("Unable_to_fetch_issue_details"))



                    }

                    // Process response here 
                } catch (jsonError) {
                    setRegisterDisableBtn(false)
                    SimpleToast.show(translate("NetworkRequestFailed"))
                }

            } catch (error) {
                setRegisterDisableBtn(false)
                console.error("Error fetching data:", error);
                SimpleToast.show(translate("NetworkRequestFailed"))
            }
        } else {
            setRegisterDisableBtn(false)
            SimpleToast.show("No internet connection.");
        }
    };

    const storeUserData = async (data) => {
        console.log("=-=-=-=-=->", data.mobileNumber)
        try {
            await storeInAsyncStorage(MOBILENUMBER, `${data.mobileNumber}`);
            console.log("DATA_FROM_SERVER=-=-=->", data);

            if (data?.id) await storeInAsyncStorage(USER_ID, `${data.id}`);

            if (data?.firstName) {
                await storeInAsyncStorage(USERNAME, `${data.firstName} ${data.lastName}`);
                await storeInAsyncStorage(FIRSTNAME, `${data.firstName}`);
                await storeInAsyncStorage(LASTNAME, `${data.lastName}`);
            }
            if (data?.roleId) await storeInAsyncStorage(ROLDID, `${data.roleId}`);
            if (data?.roleName) await storeInAsyncStorage(ROLENAME, `${data.roleName}`)
            if (data?.profilePic) await storeInAsyncStorage(USER_IMG, `${data?.profilePic}`);
            if (data?.companyCode !== undefined && data?.companyCode !== null && data?.companyCode !== "") {
                await storeInAsyncStorage(COMPANYCODE, `${data?.companyCode}`);
            } else {
                await storeInAsyncStorage(COMPANYCODE, `${""}`);
            }


            await storeInAsyncStorage("isLoggedIn", "true"); //added.....
        } catch (error) {
            console.error("Failed to store user data in keychain:", error);
        } finally {
        }
    };

    const handleApiCall = async (requestType, payload) => {
        const url = APIConfig.BASE_URL + APIConfig.AUTH[requestType];
        const headers = await GetApiHeaders();
        headers.authType = JWTAUTHENTICATION;
        setApiRequestType(requestType);
        if (isConnected) {
            try {
                await sendData(url, payload, headers, true);
            } catch (e) {
                console.log("API error:", e.message);
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    const handleNavigationGoBack = () => {
        navigation.goBack()
    }

    const firstNameOnChangeHandle = (value) => {
        setFirstName(value.replace(/^[^A-Za-z]+|[^A-Za-z ]+/g, ''))
        if (value !== "") {
            setFirstNameValidation(false)
        }
    }

    const lastNameOnChangeHandle = (value) => {
        if (value !== "") {
            setLastNameValidation(false)
        }
        setLastName(value.replace(/^[^A-Za-z]+|[^A-Za-z ]+/g, ''))
    }

    const fetchHybridsAndIssueTypesAndCrops = async () => {

        if (isConnected) {
            try {
                const headers = await GetApiHeaders();
                headers.authType = "JSONREQUEST"
                const payload = { companyCode: selectedCompany.companyCode };
                const url = APIConfig.BASE_URL + APIConfig.GETACTIVECROPS
                const response = await sendData(url, payload, headers, false);
                console.log("rea-==-=->", response)
                if (response.data.statusCode === HTTP_OK) {
                    const parseData = response?.data?.response?.cropList
                    setCropsList(parseData)
                } else {
                    SimpleToast.show(translate("Unable_to_fetch_issue_details"))
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
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
        else {
            SimpleToast.show(translate("no_internet_conneccted"))
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
        else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    };


    const cropsDropOpen = (value) => {
        if (cropsListItems.length < 3) {
            setAddCropModalOpen(value)
        } else {
            SimpleToast.show(translate("You_cannot_add_more_than_crops"))

        }
    }

    const closeCropsDropOpen = (value) => {
        setAddCropModalOpen(value)
    }

    const selectedCropNameHandle = (value) => {
        setSelectCropName(value)
        setAddCropModalOpen(false)
        setSelectedCropNameModalOpen(true)
    }

    const acresTextInputHandle = (value) => {
        setAcrsValue(value.replace(/[^0-9.]|(\..*)\./g, ''))
    }

    const closeEnterAcresHandle = () => {
        setSelectedCropNameModalOpen(false)
        setAddCropModalOpen(true)
        setAcrsValue("")
        setSelectCropName("")
        setEnterAcrValidation(false)
        setEnterAcrValidation(false)
    }

    const handleAcresAddingList = (value) => {
        if (acresValue.trim() === "") {
            setEnterAcrValidation(true)
            setEnterAcrValidationContent(translate("Please_Enter_Acres"))
        } else if (cropsListItems.length > 2) {
            setAcrsValue("")
            setEnterAcrValidationContent(translate("You_cannot_add_more_than_crops"))
            setEnterAcrValidation(true)
        }
        else {

            const newCropName = value.cropsItemDetails.split(":")[0].trim();
            const newAcres = Number(value.cropsItemDetails.split(":")[1]);

            // Remove the existing entry with the same crop name
            const updatedCropsList = cropsListItems.filter(item =>
                item.cropsItemDetails.split(":")[0].trim() !== newCropName
            );

            // Add the new crop value
            const newCropsList = [...updatedCropsList, value];

            // Recalculate total acres based on the updated crops list
            const updatedTotalAcres = newCropsList.reduce((acc, item) =>
                acc + Number(item.cropsItemDetails.split(":")[1]), 0
            );

            setCropsListItems(newCropsList);
            setTotalAcres(updatedTotalAcres);
            setAcrsValue("")
            setAddCropModalOpen(false)
            setSelectCropName("")
            setSelectedCropNameModalOpen(false)
            setCropListValidation(false)
            setEnterAcrValidationContent("")
            setEnterAcrValidation(false)
        }
    }

    const deleteCropItemHandle = (value) => {
        setTotalAcres(totalAcres - Number(value.cropsItemDetails.split(":")[1]))

        const filterItem = cropsListItems.filter((item) => item !== value)
        setCropsListItems(filterItem)
    }

    const renderCropsItems = (item) => {
        return (
            <View style={RnStyles.cropsItemContainer}>
                <Text style={[RnStyles.cropTextLabelItem, { fontFamily: fonts.Regular }]}>{item.item.cropsItemDetails}</Text>
                <TouchableOpacity onPress={() => deleteCropItemHandle(item.item)} style={[RnStyles.cancelCropIconContainer, { backgroundColor: selectedCompany.primaryColor }]}>
                    <Image style={[RnStyles.cropCancelIcon, { tintColor: selectedCompany.secondaryColor }]} source={require("../../assets/Images/crossIcon.png")} />
                </TouchableOpacity>
            </View>
        )
    }

    const addressLIneOnChangeHandle = (value) => {
        SetAddressLineValue(value.replace(/[^\x20-\x7E]/g, ''))
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
        // setPincodeValue(value.replace(/\b0[0-9]+\b/g, ''))
        setPincodeValue(value.replace(/[^0-9]/g, '').replace(/^[^1-9]+/, ''))

        setPinCodeValidation(false)
    }


    const stateDropDownModalHandle = (value) => {
        setSatteDropDownVisible(value)
    }

    const closeStateDropDownModalHandle = (value) => {
        setSatteDropDownVisible(false)
        SetSearchStateValue("")
        setStateList2(stateList)
    }

    const SelectStateHandle = (value, stateId) => {
        console.log("test=-=-=>", value)
        console.log("dis=-=->", districtList[0].state)
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
        // setStateList2(stateList2)
    }


    const districtDropDownModalHandle = (value) => {
        if (stateValue !== translate("select_state")) {
            setDistrictDropDownVisible(value)
            const filterDate = districtList.filter((item) => item.state.name.toLowerCase() === stateValue.toLowerCase())
            setDistictList2(filterDate)
        } else {
            // Alert.alert(translate("select_state"))
            SimpleToast.show(translate("select_state"))

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

    const checkPermissions = async () => {
        const cameraStatus = await check(
            Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
        );

        const storageStatus = await check(
            Platform.OS === "android"
                ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
                : PERMISSIONS.IOS.PHOTO_LIBRARY
        );

        setCameraPermission(cameraStatus);
        setStoragePermission(storageStatus);
        if (cameraStatus !== RESULTS.GRANTED || storageStatus !== RESULTS.GRANTED) {
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

        if (storagePermission !== RESULTS.GRANTED) {
            const newStorageStatus = await request(
                Platform.OS === "android" ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : PERMISSIONS.IOS.PHOTO_LIBRARY
            );
            setStoragePermission(newStorageStatus);
        }
    };


    const stateSearchHandle = (value) => {
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

    const takeSelfie = async () => {
        if (Platform.OS === 'android') {
            const androidVersion = DeviceInfo.getSystemVersion();
            const permissions = androidVersion >= 13 ? [PermissionsAndroid.PERMISSIONS.CAMERA] : [PermissionsAndroid.PERMISSIONS.CAMERA];
            const result = await PermissionsAndroid.requestMultiple(permissions);
            if (result['android.permission.CAMERA'] === 'granted') {
                const result = await ImagePicker.launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {

                    if (response.assets) {
                        setSelfyPic(response.assets[0].uri);
                        setImgName(response.assets[0].fileName)
                        setImgType(response.assets[0].type)
                        setSelfyScreen(false)
                    }
                });
            } else {
                showPermissionAlert("camera");
            }
        }
        else if (Platform.OS === 'ios') {
            const status = await check(PERMISSIONS.IOS.CAMERA);
            if (status === RESULTS.GRANTED) {
                const result = await ImagePicker.launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
                    if (response.assets) {
                        setSelfyPic(response.assets[0].uri);
                        setImgName(response.assets[0].fileName)
                        setImgType(response.assets[0].type)
                        setSelfyScreen(false)
                    }
                });
            } else {
                const requestResult = await request(PERMISSIONS.IOS.CAMERA);
                if (requestResult === RESULTS.GRANTED) {
                    const result = await ImagePicker.launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
                        if (response.assets) {
                            setSelfyPic(response.assets[0].uri);
                            setImgName(response.assets[0].fileName)
                            setImgType(response.assets[0].type)
                            setSelfyScreen(false)
                        }
                    });
                } else {
                    Alert.alert(
                        translate("permission_required"),
                        translate("camera_permission_message"),
                        [
                            { text: translate("cancel"), style: 'cancel' },
                            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
                        ]
                    );
                }
            }
        }
    };

    const takeSelfyScreen = () => {
        return (
            <View style={RnStyles.booksSeedsMainContainer}>
                <View style={[RnStyles.headerMainContainer1,
                { backgroundColor: selectedCompany.primaryColor }
                ]}
                >
                    <SafeAreaView style={{ backgroundColor: selectedCompany?.primaryColor }} edges={['top']}>
                        <View style={RnStyles.headerContentContainer1}>
                            <TouchableOpacity onPress={() => setSelfyScreen(false)}>
                                <Image source={require('../../assets/Images/BackIcon.png')}
                                    style={[RnStyles.backArrowImg,
                                    { tintColor: selectedCompany.secondaryColor }
                                    ]}
                                />
                            </TouchableOpacity>
                            <Text style={[RnStyles.bookSeedsText,
                            { color: selectedCompany.secondaryColor, fontFamily: fonts.SemiBold }
                            ]}>{translate("Take_a_Picture")}</Text>
                            <View style={{ width: 40 }} />
                        </View>
                    </SafeAreaView>
                    <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
                </View>
                <View style={RnStyles.selfiMainContainer}>
                    <ImageBackground source={require("../../assets/Images/natureBG.png")} style={RnStyles.selfiBackGroundContainer}>
                        <Image source={require("../../assets/Images/personImg.png")} style={RnStyles.personIcon} />
                    </ImageBackground>
                    <Text style={[RnStyles.takeSelfyText, { fontFamily: fonts.Regular }]}>{translate("Take_a_Selfie_with_Your_Farm_as_Background")}</Text>
                    <TouchableOpacity onPress={takeSelfie} style={[RnStyles.bookNowButtonContainer1, { backgroundColor: selectedCompany.primaryColor }]}>
                        <Image source={require("../../assets/Images/camIcon.png")} style={[RnStyles.camIcon, { tintColor: selectedCompany.secondaryColor }]} />
                        <Text style={[RnStyles.bookNowButtonText,
                        { color: selectedCompany.secondaryColor, fontFamily: fonts.SemiBold }
                        ]}>{translate("Take_Selfie")}</Text>
                    </TouchableOpacity>

                </View>
            </View>
        )
    }

    const handleOkPressNavigation = async () => {
        setRegSuccessModal(false)
        // navigation.dispatch(
        //     CommonActions.reset({
        //         index: 0,
        //         routes: [{ name: 'HomeScreenRn', params: { companyName: dynamicStyles.companyName } }],
        //     })
        // );
        const screenName = await getFromAsyncStorage(SCREENNAME);
        const isEmployee = (screenName == EMP_DASHBOARD_SCREEN);

        if (isEmployee) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'BottomTabsNavigatorEmp',
                            params: {
                                screen: 'HomeScreenEmp',
                                params: { companyName: dynamicStyles.companyName },
                            },
                        },
                    ],
                })
            );

        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'MainTabs',
                            params: {
                                screen: 'HomeScreenRn',
                                params: { companyName: dynamicStyles.companyName },
                            },
                        },
                    ],
                })
            );
        }
    }

    console.log("LATITUDE=-=-=-=->", latitude, "LONGITUDE=-=-=-=->", longitude)

    const registrationFormContent = () => {
        return (
            <View style={RnStyles.booksSeedsMainContainer}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                >
                    <View
                        style={[
                            RnStyles.headerMainContainer,
                            { backgroundColor: selectedCompany.primaryColor },
                        ]}
                    >
                        <SafeAreaView style={{ backgroundColor: selectedCompany?.primaryColor }} edges={['top']}>
                            <View style={RnStyles.headerContentContainer}>
                                <TouchableOpacity onPress={handleNavigationGoBack}>
                                    <Image
                                        source={require("../../assets/Images/BackIcon.png")}
                                        style={[RnStyles.backArrowImg, { tintColor: selectedCompany.secondaryColor }]}
                                    />
                                </TouchableOpacity>
                                <Text style={[RnStyles.bookSeedsText, { color: selectedCompany.secondaryColor, fontFamily: fonts.SemiBold }]}>
                                    {translate("register")}
                                </Text>
                                <View style={{ width: 40 }} />

                            </View>
                        </SafeAreaView>
                        <Image
                            source={require("../../assets/Images/flowerIcon.png")}
                            style={RnStyles.flowerImg}
                        />
                    </View>

                    <View style={RnStyles.formContentMainContainer}>
                        <KeyboardAwareScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >

                            <Image source={{ uri: programLogo }}
                                style={RnStyles.appLogoImg} />

                            {selfyPic ?
                                <TouchableOpacity onPress={() => imageModaleHandle(true)}>
                                    <Image source={{ uri: selfyPic }} style={RnStyles.selfyPicUser} />

                                </TouchableOpacity>
                                :
                                <View style={RnStyles.selfyMainContainer}>
                                    <TouchableOpacity onPress={() => setSelfyScreen(true)} style={[RnStyles.selfyBtnContainer, { backgroundColor: selectedCompany.secondaryColor }]}>
                                        <Image source={require("../../assets/Images/photoIconImg.png")}
                                            style={[RnStyles.photoIconImg, { tintColor: selectedCompany.primaryColor }]} />
                                        <View style={[RnStyles.plusContainer, { backgroundColor: selectedCompany.primaryColor }]}>
                                            <Image style={[RnStyles.addIcon1, { tintColor: selectedCompany.secondaryColor }]} source={require("../../assets/Images/plusIconImg.png")} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }

                            <Text style={[RnStyles.registrationText, { fontFamily: fonts.SemiBold }]}>{translate("register")}</Text>
                            <Text style={[RnStyles.registrationHeaderText, { fontFamily: fonts.Regular }]}>{translate("enter_all_the_details")}</Text>
                            <CustomRegTextField
                                label={translate("first_name")}
                                inputValue={firstName}
                                placeHolderValue={translate("enter_first_name")}
                                handleValue={firstNameOnChangeHandle}
                                validationBorder={firstnameValidation}
                                mandatory={true}
                            />

                            {firstnameValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{firstNameErrorMssg}</Text>}
                            <CustomRegTextField
                                label={translate("last_name")}
                                inputValue={lastName}
                                placeHolderValue={translate("enter_last_name")}
                                handleValue={lastNameOnChangeHandle}
                                validationBorder={lastnameValidation}
                                mandatory={false}

                            />
                            {lastnameValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{lastNameErrorMssg}</Text>}
                            <CustomCropsDropDown
                                label={translate("Crop")}
                                placeHolderValue={translate("select")}
                                openDropModalHandle={cropsDropOpen}
                                openDropModalValue={addCropsModalOpen}
                                listCropsDropDown={cropsList}
                                selectedCropNameHandlCustom={selectedCropNameHandle}
                                cropNameModalOpen={selectedCropNameModalOpen}
                                cropNameSelected={selectedCropName}
                                handleAcrValue={acresTextInputHandle}
                                acrsValue={acresValue}
                                closeIconCropAcres={closeEnterAcresHandle}
                                handleAcrAddingListItems={handleAcresAddingList}
                                validationBorder={CropListValidations}
                                validationEnterAcres={enterAcreValidations}
                                validationContentAcres={enterAcrValidationContent}
                                primaryColor={selectedCompany.primaryColor}
                                secondaryColor={selectedCompany.secondaryColor}
                                cropListValidation={cropsListItems.length}
                                closeModalHandle={closeCropsDropOpen}
                            />
                            {CropListValidations && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{translate("Please_Select_Crop")}</Text>}
                            <View style={RnStyles.cropsListMainContainer}>
                                <FlatList horizontal data={cropsListItems} renderItem={renderCropsItems} />
                            </View>

                            <View>
                                <Text style={[RnStyles.labelText, { fontFamily: fonts.SemiBold }]}>{translate("Total_Acres")}</Text>
                                <View style={RnStyles.textInputContainer}>
                                    <Text style={[RnStyles.totalAcreCountText, { fontFamily: fonts.Regular }]}>{totalAcres}</Text>
                                </View>
                            </View>
                            <CustomPinCodeTextInput
                                label={translate("Pincode")}
                                placeHolderValue={translate("Enter_Pincode")}
                                handleValue={pinCodeOnChangeHandle}
                                inputValue={pinCodeValue}
                                validationBorder={pinCodeValidation}
                            />

                            {pinCodeValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{pinCodeValidationContent}</Text>}

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
                            {stateValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{translate("Please_Select_State")}</Text>}

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
                            {districtValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{translate("Please_Select_District")}</Text>}
                            <CustomAddressTextInput
                                label={translate("Tahsil_Block")}
                                placeHolderValue={translate("Enter_Tahsil_Block")}
                                handleValue={tashilOnChangeHandle}
                                inputValue={tashilValue}
                                validationBorder={tashilValidation}
                            />

                            {tashilValidation && <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{translate("Please_Enter_Tashil")}</Text>}
                            <CustomAddressTextInput
                                label={translate("Address_Line")}
                                placeHolderValue={translate("Enter_Address_Line")}
                                handleValue={addressLIneOnChangeHandle}
                                inputValue={addressLineValue}
                                validationBorder={addressLineValidation}
                            />

                            {addressLineValidation &&
                                <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{addressValidationContent}</Text>}


                            <CustomVillageTextInput
                                label={translate("Land_mark")}
                                placeHolderValue={translate("Enter_Land_mark")}
                                handleValue={landMarkOnChangeHandle}
                                inputValue={landMarkValue}
                                validationBorder={landMarkValidation}
                            />

                            {landMarkValidation &&
                                <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{translate("Please_Enter_Landmark")}</Text>}


                            <CustomVillageTextInput
                                label={translate("new_village")}
                                placeHolderValue={translate("Enter_Village")}
                                handleValue={villageOnChangeHandle}
                                inputValue={villageValue}
                                validationBorder={villageValidation}
                            />

                            {villageValidation &&
                                <Text style={[RnStyles.firstNameValidationText, { fontFamily: fonts.SemiBold }]}>{translate("Please_Enter_Village")}</Text>}




                            <TouchableOpacity disabled={registerDisableBtn} onPress={signUpBtn} style={[RnStyles.bookNowButtonContainer, { backgroundColor: selectedCompany.primaryColor }]}>
                                <Text style={[RnStyles.bookNowButtonText,
                                { color: selectedCompany.secondaryColor, fontFamily: fonts.SemiBold }
                                ]}>{translate("sign_up")}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 200 }} />
                        </KeyboardAwareScrollView>
                    </View>
                </KeyboardAvoidingView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={regSuccessModal}
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
                                    backgroundColor: "#fff",
                                    paddingHorizontal: 10, paddingVertical: 15,
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
                                }}
                            >

                                <View style={{ alignItems: "center" }}>
                                    <Image source={require('../../assets/Images/successIconMssg.png')} style={RnStyles.successIcon} />

                                </View>
                                <View style={{ alignItems: "center", }}>

                                    {welcomeMssg &&
                                        <RenderHTML contentWidth={width} source={{ html: welcomeMssg }} />
                                    }
                                </View>
                                <TouchableOpacity onPress={() => handleOkPressNavigation()} style={{ borderRadius: 10, marginVertical: 10, backgroundColor: selectedCompany.primaryColor, height: 50, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: selectedCompany.secondaryColor, fontSize: 14, lineHeight: 22, fontFamily: fonts.SemiBold }}>{translate("ok")}</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={imagModalVisible}
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
                                    backgroundColor: "#fff",
                                    paddingVertical: 15,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    borderRadius: 5,
                                    width: "50%",
                                }}
                            >
                                <View>
                                    <TouchableOpacity onPress={() => imageModaleHandle(false)} style={{ position: "absolute", right: -6, top: -28, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "red" }}>
                                        <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => viewImageHandle(true)} style={{ borderBottomWidth: 1, padding: 10 }}>
                                        <Text style={{ color: "#000", fontSize: 15, fontFamily: fonts.SemiBold }}>{translate("View_picture")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={retakeSelfyHandle} style={{ borderBottomWidth: 1, padding: 10 }}>
                                        <Text style={{ color: "#000", fontSize: 15, fontFamily: fonts.SemiBold }}>{translate("Choose_picture")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={removeSelfyHandle} style={{ padding: 10 }}>
                                        <Text style={{ color: "#000", fontSize: 15, fontFamily: fonts.SemiBold }}>{translate("Remove_picture")}</Text>
                                    </TouchableOpacity>
                                </View>


                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={viewImgModal}
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
                                    backgroundColor: "#fff",
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
                                    height: 300,
                                    padding: 10
                                }}
                            >
                                <View>
                                    <TouchableOpacity onPress={() => viewImageHandle(false)} style={{ position: "absolute", right: -19, top: -25, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                        <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                                    </TouchableOpacity>
                                    <Image source={{ uri: selfyPic }} style={{ height: 280, width: "100%" }} />

                                </View>


                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {loader && <CustomLoader loading={loader} loaderImage={CompanyLoader} type={true} />}

            </View>

        )
    }

    const signUpBtn = () => {
        let regex = /^[A-Za-z\s]*$/
        let aplRegex = /^[A-Za-z][A-Za-z ]*$/;
        if (!firstName.trim()) {
            setFirstNameValidation(true)
            setFirstNameErrorMsssg(translate("Please_enter_first_name"));
        }

        else if (!aplRegex.test(firstName)) {
            setFirstNameValidation(true)
            setFirstNameErrorMsssg(translate("Invalid_first_name"));
        }

        else if (pinCodeValue != "" && pinCodeValue.length !== 6) {
            setValidationContent(translate("Please_Enter_valid_pincode"))
            setPinCodeValidation(true)
        }
        else {
            setRegisterDisableBtn(true)
            handleSubmit2()
        }
    }

    return (
        <>
            {Platform.OS === 'android' && (<StatusBar backgroundColor={selectedCompany.primaryColor} barStyle={currentTheme.statusBar} />)}

            {isSelfyScreen ?
                <>

                    {takeSelfyScreen()}
                </>
                :
                <>
                    {registrationFormContent()}
                </>
            }

            <CustomCommonModal
                modalVisible={alertModal}
                modalClose={alertCloseHandle}
                ErrorText={translate("Fallback_failed_Please_check_GPS_settings")}
                ButtonText={translate("ok")}
                ButtonFun={alertCloseHandle}

            />
        </>

    )
}

export default RegistrationRn

const RnStyles = StyleSheet.create({
    booksSeedsMainContainer: {
        backgroundColor: "#F2F6F9",
        flex: 1,
        width: "100%"
    },
    headerMainContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
        height: Platform.OS == "ios" ? 140 : 100,
    },

    headerMainContainer1: {
        paddingTop: 20,
        paddingHorizontal: 20,
        height: Platform.OS == "ios" ? 110 : 80,
    },

    headerContentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // width: "55%",
        // paddingLeft:20
    },

    headerContentContainer1: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // width: "65%"
    },

    backArrowImg: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    bookSeedsText: {
        fontSize: RFValue(16, height),
        alignSelf: "center",
        lineHeight: 30
    },
    flowerImg: {
        position: "absolute",
        top: Platform.OS == "ios" ? 50 : 30,
        right: 20,
        height: 50,
        width: 100,
        tintColor: "#000",
        resizeMode: "contain"
    },

    contentMainContainer: {
        backgroundColor: "#fff",
        width: "96%",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 10
    },

    programLogoImg: {
        height: 23,
        width: 70,
        // resizeMode: "contain",
        alignSelf: "flex-end",
    },

    appLogoImg: {
        // height: 110,
        // width: 80,
        resizeMode: "contain",
        alignSelf: "center",
        width: width * 0.45, height: height * 0.1,
    },

    selfyMainContainer: {
        width: 130,
        height: 100,
        backgroundColor: "#FFB7B94D",
        alignSelf: "center",
        marginTop: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },

    selfyBtnContainer: {
        height: 65,
        width: 65,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center"
    },

    photoIconImg: {
        height: 30,
        width: 30,
        resizeMode: "contain",
    },

    plusContainer: {
        right: -6,
        bottom: 1,
        position: "absolute",
        height: 20, width: 20,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40
    },

    addIcon1: {
        resizeMode: "contain",
        height: 21,
        width: 15
    },
    addIcon: {
        height: 15,
        width: 15,
        resizeMode: "contain"
    },

    registrationText: {
        fontSize: 20,
        color: "#5D5D5D",
        marginVertical: 5
    },

    registrationHeaderText: {
        fontSize: 15,
        color: "#5D5D5D",
        marginBottom: 15
    },

    bookNowButtonContainer: {
        width: "100%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 20
    },

    bookNowButtonContainer1: {
        width: "100%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 30,
        flexDirection: "row"
    },

    bookNowButtonText: {
        fontSize: 14,
    },

    firstNameValidationText: {
        color: "#ED3237",
        fontSize: RFValue(14, height),
        lineHeight: 25
    },

    formContentMainContainer: {
        position: "absolute",
        top: Platform.OS == "ios" ? 115 : 80,
        alignSelf: "center",
        backgroundColor: "#fff",
        width: "90%",
        height: 700,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingTop: 20
    },

    keyBoardAvoidingContainer: {
        flex: 1
    },

    formSubContainer: {
        height: "100%"
    },

    cropsListMainContainer: {
        flexDirection: "row",
        marginTop: 8
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

    cropTextLabelItem: {
        color: "#5D5D5D",
        fontSize: 12,
    },

    cancelCropIconContainer: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        right: -8,
        top: -8, width: 15,
        height: 15,
        borderRadius: 30,
    },

    cropCancelIcon: {
        height: 7,
        width: 7,
    },

    labelText: {
        color: "#5D5D5D",
        fontSize: RFValue(14, height),
        lineHeight: 25,
        marginTop: 10
    },

    textInputContainer: {
        backgroundColor: "#D6D6D6",
        borderWidth: 1,
        height: 55,
        marginTop: 15,
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
        fontSize: 14
    },

    textInputContainer1: {
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 55,
        marginTop: 15,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10,
        marginBottom: 3,
        paddingLeft: 15,
        borderColor: "#D6D6D6"
    },

    selfiMainContainer: {
        backgroundColor: "#fff",
        width: "90%",
        paddingBottom: 10,
        alignSelf: "center"
    },

    selfiBackGroundContainer: {
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        height: 300
    },

    personIcon: {
        width: 200,
        height: 200,
    },

    takeSelfyText: {
        alignSelf: "center",
        fontSize: 14,
        marginTop: 10,
        color: "#000"
    },

    camIcon: {
        marginRight: 10,
        width: 15,
        height: 15,
        resizeMode: "contain",
    },

    selfyPicUser: {
        marginTop: 20,
        borderRadius: 50,
        alignSelf: "center",
        height: 100,
        width: 100,
    },

    successIcon: {
        height: 50,
        width: 50,
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 10
    },

})