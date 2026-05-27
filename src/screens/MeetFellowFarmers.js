import { Dimensions, Text, View, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet, Image, TextInput, FlatList, ScrollView, Keyboard, Pressable, Alert, ToastAndroid, PermissionsAndroid, Linking } from "react-native"
import { useState, useRef, useEffect, useCallback } from "react"
import CustomMeetFellowFarmersDate from "../components/CustomMeetFellowFarmersDate"
import CustomImagePicker from "../components/CustomImagePicker"
import CustomMeetingDropDown from "../components/CustomMeetingDropDown"
import CustomTextArea from "../components/CustomTextArea"
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import { launchCamera } from 'react-native-image-picker';
import { RFValue } from "react-native-responsive-fontsize";
import moment from "moment";
import useGetRequestWithJwt from '../api/useGetRequestWithJwt'
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import usePostRequestWithJwt from "../api/usePostRequestWithJwt"
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import SimpleToast from 'react-native-simple-toast';
import CustomTime from "../components/CustomTime"
import DatePicker from 'react-native-date-picker';
import { Calendar } from "react-native-calendars";
import { useFontStyles } from "../hooks/useFontStyles"
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { GetApiHeaders } from "../utils/helpers"
import { CustomCommonModal } from "../components/CustomCommonModal"

const { width, height } = Dimensions.get('window');


const MeetFellowFarmer = () => {
    const isConnected = useSelector(state => state.network.isConnected);
    const fonts = useFontStyles()
    const { fetchData } = useGetRequestWithJwt();
    // const [selectCrops, setSelectCrops] = useState("Select Crop")
    const [selectCropDrop, setSelectCropDrop] = useState(false)
    // const [selectHybrid, setSelectHybrid] = useState("Select Hybrid/Variety")
    const [selectHybridDrop, setSelectHybridDrop] = useState(false)
    const [quantityInput, setQuantityInput] = useState("")
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [isTimeVisible, setTimeVisible] = useState(false);

    const [selectedDate, setSelectedDate] = useState(translate("Select_Date"));
    const [selctedDateTime, setSelectDateTime] = useState("")
    // console.log("a;ls;as=-=-=>", selctedDateTime, selectedDate)
    // const [selectedTime, setSelectedTime] = useState("Select Time");

    const [alertModal, setAlertModal] = useState(false);
    const [alertTextContent, setAlertTextContent] = useState("");
    const [selfyImg, setSelfyImg] = useState("")
    const [meetingTypeVisible, setMeetingTypeVisble] = useState(false)
    const [loaderApi, setLoaderApi] = useState(false)
    const { postData, loading, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();

    const [meetingTypeList, setMeetingTypeList] = [
        {
            name: "Pre-Season meeting"
        },
        {
            name: "Harvest/Field Day"

        }
    ]

    const [meetingTypeValue, setMeetingTypeValue] = useState(translate("select"))
    const [hybridVarietyValue, setHybridVarietyValue] = useState("")

    const [selectDateValidation, setSelectDateValidation] = useState(false)
    const [selectTimeValidation, setSelectTimeValidation] = useState(false)

    const [selfyValidations, setSelfyValidations] = useState(false)

    const [meetingTypeValidations, setMeetingTypeValidations] = useState(false)

    const [succesMssg, setSuccessMssg] = useState("")
    const [successVisible, setSuccessVisible] = useState(false)

    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [meetingList, setMeetingList] = useState([])

    const [selectedTime, setSelectedTime] = useState(null);
    const [tempTime, setTempTime] = useState(new Date());
    const navigation = useNavigation();
    console.log("psoapoasp=-=-=>", tempTime)

    useEffect(() => {
        getMeetingsDrops()
    }, [])

    const handleSelectCrop = () => {
        setSelectCropDrop(!selectCropDrop)
    }

    const handleSelectClose = () => {
        setSelectCropDrop(false)
    }

    const handleSelectHybrid = () => {
        setSelectHybridDrop(!selectHybridDrop)
    }

    const handleSelectCloseHybrid = () => {
        setSelectHybridDrop(false)
    }

    const handleQuantityInput = (value) => {
        setQuantityInput(value)
    }

    const handleDateModal = () => {
        setMeetingTypeVisble(false)
        setCalendarVisible(!isCalendarVisible)
    }

    const handleTimeModal = () => {
        setMeetingTypeVisble(false)
        setTimeVisible(true)
    }

    const handleNavigationBookHistory = () => {
        navigation.navigate("BookingHistory")
    }

    const handleNavigationGoBack = () => {
        navigation.goBack()
    }

    const openFrontCamera = () => {
        const options = {
            mediaType: 'photo',
            // cameraType: 'front', // 👈 important for selfie
            saveToPhotos: true,
            quality: 0.8,
            includeBase64: false,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
            } else if (response?.assets?.length > 0) {
                setSelfyImg(response.assets[0].uri);
                setSelfyValidations(false);
            }
        });
    };

    // const openFrontCamera = () => {
    //     const options = {
    //         mediaType: 'photo',
    //         // cameraType: 'front',
    //         saveToPhotos: true,
    //         // includeExtra: true,
    //     };

    //     setMeetingTypeVisble(false)


    //     launchCamera(options, (response) => {

    //         if (response.didCancel) {
    //             console.log('User cancelled camera');
    //         } else if (response.errorMessage) {
    //             console.log('Camera Error: ', response.errorMessage);
    //         } else if (response?.assets) {
    //             setSelfyImg(response?.assets[0]?.uri)
    //             setSelfyValidations(false)
    //             console.log('Image URI:', response?.assets[0]?.uri);
    //         }
    //     });
    // };

    const handleButtonPress = () => {
        Keyboard.dismiss();
    };

    const handleMeetingDropDown = () => {
        if (isConnected) {
            setMeetingTypeVisble(!meetingTypeVisible)
            setMeetingTypeValidations(false)
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }

    }

    const handleMeetingTypeValue = useCallback((value) => {
        setMeetingTypeValue(value)
        setMeetingTypeVisble(false)
        setMeetingTypeValidations(false)
    }, [])

    const closeDateModal = () => {
        setCalendarVisible(false)
    }


    const closeTimeModal = () => {
        setTimeVisible(false)
    }

    const handleHybridOnChange = (value) => {
        setMeetingTypeVisble(false)

        setHybridVarietyValue(value)
    }

    const handleUpload = () => {
        setMeetingTypeVisble(false)

        if (isConnected) {
            if (selectedDate === translate("Select_Date")) {
                setSelectDateValidation(true)
            } else if (selectedTime === null) {
                setSelectTimeValidation(true)
            }

            else if (selfyImg === "") {
                setSelfyValidations(true)
            } else if (meetingTypeValue == translate("select")) {
                setMeetingTypeValidations(true)
            } else {
                setLoaderApi(true)
                uploadMeetFarmer()
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))

        }

    }

    const getMeetingsDrops = async () => {
        if (isConnected) {
            try {
                var getFertilizerCalcURL = APIConfig.BASE_URL + APIConfig.MASTERSGETALLMEETINGS
                console.log("URLPOP-==-=->", getFertilizerCalcURL)
                var getHeaders = await GetApiHeaders()

                var APIResponse = await fetchData(getFertilizerCalcURL, getHeaders);
                // console.log("SAIKIRASTEP_2=-=-=->", APIResponse.data.data)
                if (APIResponse.statusCode === HTTP_OK) {
                    setMeetingList(APIResponse.data.data)
                } else {
                    Alert.alert(APIResponse?.message)
                }


            }
            catch (error) {
                console.error("Error fetching meeting types:", error);
                SimpleToast.show(error.message || translate("NetworkRequestFailed"))
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    const uploadMeetFarmer = async () => {
        if (isConnected) {

            try {
                const url = APIConfig.BASE_URL + APIConfig.saveMeetingDetails_v1
                const formData = new FormData();
                // const userId = await GetApiHeaders();
                const headers = await GetApiHeaders();
                headers['Content-Type'] = APIConfig.MULTIPARTFORMDATA
                headers.farmerId = Number.parseInt(headers.userId)
                const now = new Date()
                // const formattedDate = `${selctedDateTime} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                const formattedDate = `${selctedDateTime} ${formatTimeForBackend(selectedTime)}`;
                // console.log("LKSLASKLAKS=-=-=->", formattedDate)

                formData.append("id", 0)
                formData.append("meetingDateTime", formattedDate)
                formData.append("meetingType", meetingTypeValue)
                formData.append("hybrid", hybridVarietyValue)
                // console.log("LKSLASKLAKSasas=-=-=->", formData)

                // formData.append('jsonData', JSON.stringify({
                //     id: 0,
                //     userId: userID.userId,
                //     categoryId: selectCategoryId,
                //     subCategoryId: subSelectCategoryId,
                //     categoryName: selectCategory,
                //     subcategoryName: subSelectCategory,
                //     status: true,
                //     remarks: remarksValue,
                //     scanCouponLabel: []
                // }));
                if (selfyImg) {
                    formData.append('imageFile', {
                        uri: selfyImg,
                        name: 'complaint.jpg', // Change if necessary
                        type: 'image/jpeg' // Adjust based on image type
                    });
                } else {
                    formData.append('imageFile', "");
                }
                console.log("URL-=-=->", url)
                console.log("FORMDATA=-=-=->", formData)
                console.log("HEADERS=-=-==->", headers)

                const responseApi = await sendData(url, formData, headers, false);
                console.log("meetiiisoppso=-=-=->", responseApi)
                if (responseApi?.data?.statusCode === 200) {
                    setSuccessMssg(responseApi?.data?.message)
                    setSelectedDate(translate("Select_Date"))
                    setSelfyImg("")
                    setMeetingTypeValue(translate("select"))
                    setHybridVarietyValue("")
                    setSelectDateTime("")
                    setSelectDateValidation(false)
                    setSelfyValidations(false)
                    setMeetingTypeValidations(false)
                    setSuccessVisible(true)
                    setLoaderApi(false)
                    setSelectedTime(null)

                }
                else if (responseApi?.data?.statusCode === 201) {
                    console.log("trasytas=-=-=->", responseApi)
                    // setSuccessMssg(responseApi.data.message)
                    setSelectedDate(translate("Select_Date"))
                    setSelfyImg("")
                    setMeetingTypeValue(translate("select"))
                    setHybridVarietyValue("")
                    setSelectDateTime("")
                    setSelectDateValidation(false)
                    setSelfyValidations(false)
                    setMeetingTypeValidations(false)
                    setSelectedTime(null)
                    // setSuccessVisible(true)
                    setLoaderApi(false)
                    // setSelectedTime(null);
                    setTempTime(null)
                    SimpleToast.show(responseApi?.data?.message)

                    // Alert.alert(responseApi.data.statusCode)
                }
                else if (responseApi?.data?.statusCode === 101) {
                    console.log("trasytas=-=-=->", responseApi)
                    // setSuccessMssg(responseApi.data.message)
                    setSelectedDate(translate("Select_Date"))
                    setSelfyImg("")
                    setMeetingTypeValue(translate("select"))
                    setHybridVarietyValue("")
                    setSelectDateTime("")
                    setSelectDateValidation(false)
                    setSelfyValidations(false)
                    setMeetingTypeValidations(false)
                    setSelectedTime(null)
                    // setSuccessVisible(true)
                    setLoaderApi(false)
                    // setSelectedTime(null);
                    setTempTime(null)
                    SimpleToast.show(responseApi.data.message)

                    // Alert.alert(responseApi.data.statusCode)
                }
                else {
                    setLoaderApi(false)
                    setAlertModal(true);
                    setAlertTextContent(responseApi.data.message ? responseApi.data.message : translate("Something_went_wrong"));

                }

            } catch (error) {
                console.error('Error:', error);
                setLoaderApi(false)
                SimpleToast.show(translate("NetworkRequestFailed"))

                return null;
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    };

    const formatTime = (date) => {
        if (!date) return translate("Select_Time"); // Default text

        let hours = date.getHours();
        let minutes = date.getMinutes();

        let formattedHours = String(hours).padStart(2, '0'); // Ensure two-digit hours
        let formattedMinutes = String(minutes).padStart(2, '0'); // Ensure two-digit minutes

        return `${formattedHours}:${formattedMinutes}`; // 24-hour format (HH:MM)
    };

    const formatTimeForBackend = (date) => {
        let hours = String(date.getHours()).padStart(2, '0'); // 24-hour format
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let seconds = String(date.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    };

    // const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD
    const currentTime = new Date(); // Get current time in local timezone (Asia/Kolkata will be applied in formatting)

    const onSelectDate = (date) => {
        setSelectedDate(date);
        // setSelectedDate(moment(date, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY"));
        setCalendarVisible(false);
        setSelectDateValidation(false)
        setSelectDateTime(date)
        setSelectedTime(null);
        setTempTime(new Date())
        // if (date === today) {
        //     setTempTime(new Date()); // Reset time to current time if today is selected
        // }
    };

    const handleGoBack = () => {
        setMeetingTypeVisble(false)

        navigation.goBack()
        setSuccessVisible(false)
    }

    const showPermissionAlert = () => {
        Alert.alert(
            translate('permission_required'),
            translate('cameraDesc'),
            [
                { text: translate('cancel'), style: 'cancel' },
                { text: translate('open_settings'), onPress: () => Linking.openSettings() }
            ],
            { cancelable: true }
        );
    };


    const requestCameraPermission = async (translate) => {
        if (Platform.OS == 'android') {
            const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
            const result = await PermissionsAndroid.request(permission);

            if (result === PermissionsAndroid.RESULTS.GRANTED) {
                openFrontCamera()
            } else if (result === PermissionsAndroid.RESULTS.DENIED) {
                return { granted: false, blocked: false };
            } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                showPermissionAlert('camera');
                //   if (translate) showPermissionAlert('camera', translate);
                //   return { granted: false, blocked: true };
            }
        } else {
            const status = await request(PERMISSIONS.IOS.CAMERA);

            if (status === RESULTS.GRANTED) {
                openFrontCamera();
            } else if (status === RESULTS.DENIED) {
                // ask again
                const retry = await request(PERMISSIONS.IOS.CAMERA);
                if (retry === RESULTS.GRANTED) {
                    openFrontCamera();
                } else {
                    showPermissionAlert('camera');
                }
            } else if (status === RESULTS.BLOCKED) {
                showPermissionAlert('camera');
            }
        }
    };


    return (
        <View style={{ backgroundColor: dynamicStyles.primaryColor, flex: 1 }} edges={['top']}>
            <Pressable style={{ flex: 1 }} onPress={handleButtonPress}>
                <View style={RnStyles.booksSeedsMainContainer}>
                    <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                        <View style={RnStyles.headerContentContainer}>
                            <TouchableOpacity onPress={handleNavigationGoBack}>
                                <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
                            </TouchableOpacity>
                            <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Meet_Fellow_Farmers")}</Text>
                            <View style={{ width: 40 }} />
                        </View>
                        <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
                    </View>

                    <View style={RnStyles.contentMainContainer}>
                        <Pressable
                            //  onPress={()=> setMeetingTypeVisble(false)}
                            style={RnStyles.textFieldsMainContainer}>
                            <ScrollView showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}>
                                <View>
                                    <CustomMeetFellowFarmersDate
                                        // label={"Meeting Date and Time"}
                                        label={translate("Meeting_Date")}

                                        validationBorder={selectDateValidation}
                                        inputValue={selectedDate}
                                        visible={isCalendarVisible}
                                        handleModal={handleDateModal}
                                        onSelectDate={(date) => {
                                            setSelectedDate(moment(date, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY"));
                                            setCalendarVisible(false);
                                            setSelectDateValidation(false)
                                            setSelectDateTime(date)
                                        }}
                                        closeDate={closeDateModal}
                                    />
                                    {selectDateValidation && <Text style={{ color: "#ED3237", fontSize: 15, fontFamily: fonts.Medium }}>{translate("Please_select_date")}</Text>}

                                    <CustomTime
                                        label={translate("Meeting_Time")}
                                        validationBorder={selectTimeValidation}
                                        // inputValue={`${selectedTime ? selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Select Time'}`}
                                        inputValue={formatTime(selectedTime)}
                                        visible={isTimeVisible}
                                        handleModal={handleTimeModal}
                                        onSelectDate={selctedDateTime}
                                        closeDate={closeTimeModal}
                                    />

                                    {selectTimeValidation && <Text style={{ color: "#ED3237", fontSize: 15, fontFamily: fonts.Medium }}>{translate("Please_select_time")}</Text>}



                                    <CustomImagePicker
                                        label={translate("Upload_Selfie_and_win_bonus_points")}
                                        inputValue={translate("Upload_Selfie_of_the_meeting")}
                                        handleModal={requestCameraPermission}
                                        validation={selfyValidations}

                                    />
                                    {selfyValidations && <Text style={{ color: "#ED3237", fontSize: 15, fontFamily: fonts.Medium }}>{translate('Please_take_a_selfie')}</Text>}
                                    {selfyImg !== "" &&
                                        <View style={RnStyles.picMainContainer}>
                                            <TouchableOpacity onPress={() => setSelfyImg("")} style={[RnStyles.cancelIconContainer, { backgroundColor: dynamicStyles.primaryColor, }]}>
                                                <Image source={require("../../assets/Images/crossIcon.png")} style={[RnStyles.cancelIcon, { tintColor: dynamicStyles.secondaryColor }]} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: selfyImg }} style={RnStyles.selfyImg} />
                                        </View>
                                    }


                                    <CustomMeetingDropDown
                                        inputValue={meetingTypeValue}
                                        label={translate("Meeting_type")}
                                        listLabels={meetingTypeList}
                                        handleDropDown={handleMeetingDropDown}
                                        dropVisibleValue={meetingTypeVisible}
                                        validations={meetingTypeValidations}

                                    />
                                    {meetingTypeVisible &&

                                        <View style={RnStyles.textInputContainer1}>
                                            {meetingList.map((item, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => handleMeetingTypeValue(item.meetingName)}
                                                    style={{ marginBottom: 5 }}
                                                >
                                                    <Text style={[RnStyles.preSeasonMeetingText, { fontFamily: fonts.Regular }]}>
                                                        {item.meetingName}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                            {/* <FlatList showsVerticalScrollIndicator={true} nestedScrollEnabled={true} data={meetingList} renderItem={(item) => {
                                                return (
                                                    <TouchableOpacity onPress={() => handleMeetingTypeValue(item.item.meetingName)} style={{ marginBottom: 5 }}>
                                                        <Text style={[RnStyles.preSeasonMeetingText, { fontFamily: fonts.Regular }]}>{item.item.meetingName}</Text>
                                                    </TouchableOpacity>
                                                )
                                            }} /> */}

                                        </View>
                                    }
                                    {meetingTypeValidations && <Text style={{ color: "#ED3237", fontSize: 15, fontFamily: fonts.Medium }}>{translate("Please_Select_Meeting_Type")}</Text>}
                                    <CustomTextArea
                                        label={translate("Hybrid/Variety")}
                                        placeHolderValue={translate("Type_here")}
                                        inputValue={hybridVarietyValue}
                                        handleValue={handleHybridOnChange}
                                    />
                                </View>
                                {/* <View style={{ height:100 }} /> */}
                            </ScrollView>
                        </Pressable>
                        <TouchableOpacity onPress={handleUpload} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                            <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Upload")}</Text>
                        </TouchableOpacity>

                    </View>

                    {successVisible &&
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={successVisible}
                        >
                            <TouchableWithoutFeedback>
                                <View style={RnStyles.modalMainContainer}>
                                    <View style={RnStyles.modalSubContainer}>
                                        <TouchableOpacity onPress={() => handleGoBack()} style={[RnStyles.crossIconContainer, { borderColor: dynamicStyles.primaryColor, marginRight: 6 }]}>
                                            <Image source={require('../../assets/Images/crossIcon.png')} style={[RnStyles.crossIcon, { tintColor: dynamicStyles.primaryColor }]} />
                                        </TouchableOpacity>
                                        {/* <Image source={require('../../assets/Images/successIconMssg.png')} style={RnStyles.successIcon} /> */}
                                        <View style={RnStyles.textContainer}>
                                            <Text style={[RnStyles.successText, { fontFamily: fonts.SemiBold }]}>{translate("Thank_you")}</Text>
                                            <Text style={[RnStyles.successSubText, { fontFamily: fonts.SemiBold }]}>{succesMssg}</Text>

                                            {/* <View style={RnStyles.successMainContainerText}>
                                                        <Text style={RnStyles.successSubText}>{successMobileNumber}</Text>
                                                        <Text style={RnStyles.successSubText}>Our<Text style={{fontWeight:"bold",marginLeft:2}}> Samadhan</Text> team will call you shortly</Text>
                                                    </View> */}
                                        </View>
                                        <TouchableOpacity onPress={() => handleGoBack()} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                                            <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("ok")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>}
                    {isTimeVisible &&
                        <Modal visible={isTimeVisible} transparent animationType="slide">
                            <TouchableWithoutFeedback>

                                <View style={RnStyles.modalMainContainer}>
                                    <View style={RnStyles.modalSubContainer1}>
                                        <TouchableOpacity onPress={closeTimeModal} style={{ position: "absolute", right: -8, top: -10, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                            <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                                        </TouchableOpacity>
                                        <View style={{ alignItems: "center" }}>
                                            <DatePicker
                                                // date={tempTime}

                                                date={tempTime || new Date()}
                                                mode="time"
                                                is24Hour={true}
                                                // minimumDate={new Date()}
                                                onDateChange={setTempTime}
                                                maximumDate={selectedDate === today ? currentTime : undefined}
                                                textColor="#000"

                                            // date={tempTime}
                                            // mode="time"
                                            // is24Hour={false}
                                            // maximumDate={selectedDate === today ? new Date() : undefined} // Disable future time if today is selected
                                            // onDateChange={setTempTime}

                                            />

                                        </View>

                                        <TouchableOpacity style={{
                                            marginTop: 20, backgroundColor: dynamicStyles.primaryColor, justifyContent: "center", alignItems: "center",
                                            height: height * 0.08, borderRadius: 10
                                        }} onPress={() => {
                                            setSelectedTime(tempTime);
                                            setTimeVisible(false);
                                            setSelectTimeValidation(false)
                                        }}>
                                            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(16, height), fontWeight: "600" }}>{translate("Set_Time")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>}

                    {isCalendarVisible &&
                        <Modal visible={isCalendarVisible} transparent animationType="slide">
                            <TouchableWithoutFeedback>

                                <View style={RnStyles.modalMainContainer}>
                                    <View style={RnStyles.modalSubContainer}>
                                        <TouchableOpacity onPress={closeDateModal} style={{ position: "absolute", right: -8, top: -10, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                            <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                                        </TouchableOpacity>
                                        <Calendar

                                            theme={{
                                                selectedDayBackgroundColor: "#4CAF50", // Background color for selected date
                                                selectedDayTextColor: dynamicStyles.secondaryColor, // Text color for selected date
                                                todayTextColor: "pink", // Color for today's date
                                                arrowColor: "#4CAF50", // Arrow color
                                                dayTextColor: "#000000", // Default text color for all dates
                                                textDisabledColor: "#D3D3D3", // Disabled date color
                                                textDayFontFamily: fonts.Regular,     // Font for days
                                                textMonthFontFamily: fonts.Bold,      // Font for month title
                                                textDayHeaderFontFamily: fonts.Regular, // Font for week day labels (e.g., Mon, Tue)

                                            }}
                                            //  minDate={"2000-01-01"} // Set an appropriate minimum past date
                                            maxDate={today} // Disable future dates
                                            // minDate={today}
                                            onDayPress={(day) => onSelectDate(day.dateString)}
                                            markedDates={
                                                selectedDate ? { [selectedDate]: { selected: true, marked: true, selectedColor: dynamicStyles.primaryColor } } : {}
                                            }

                                            // onDayPress={handleDateSelect}
                                            minDate={"2000-01-01"} // Allow past dates
                                        // maxDate={today} // Disable future dates
                                        // markedDates={{
                                        //   [selectedDate]: { selected: true, selectedColor: "blue" },
                                        // }}

                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>}

                    <CustomCommonModal
                        modalVisible={alertModal}
                        modalClose={() => setAlertModal(false)}
                        ErrorText={alertTextContent}
                        ButtonText={translate("ok")}
                        ButtonFun={() => setAlertModal(false)}
                    />
                    {loaderApi && <PreLoginCustomLoader />}
                </View>
            </Pressable>
        </View>
    )
}

export default MeetFellowFarmer

const RnStyles = StyleSheet.create({
    booksSeedsMainContainer: {
        backgroundColor: "#F2F6F9",
        flex: 1,
        width: "100%",
        paddingBottom: height * 0.02
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
        // width: "70%",
        // paddingLeft:20
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
        flex: 1,
        justifyContent: "space-between",
        padding: 10,
    },

    // contentMainContainer: {
    //     // padding: 20,
    //     // flex: 1,
    //     justifyContent: "space-between",
    //     padding: 10,
    //     // paddingHorizontal:20,
    //     backgroundColor: "red",
    //     // paddingBottom:height*0.04
    // },

    // textFieldsMainContainer: {
    //     backgroundColor: "#fff",
    //     borderRadius: 10,
    //     paddingHorizontal: 20,
    //     // minHeight: height * 0.1,
    //     // maxHeight: height * 0.9,
    //     height:height*0.75,
    //     marginBottom : 10
    // },

    textFieldsMainContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 20,
        flex: 1,   // IMPORTANT
        marginBottom: 10
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

    searchInputContainer: {
        paddingLeft: 20,
        width: "90%",
        fontSize: 13,
        fontWeight: "400",
        color: "#00000066"
    },

    contentHistoryMainContainer: {
        borderWidth: 1,
        paddingLeft: 20,
        borderColor: "#D6D6D6",
        borderRadius: 10,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: "#FBFBFB",
        marginBottom: 10
    },

    labelsHistoryContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 3
    },

    labelHistoryText: {
        width: 130,
        fontSize: 13,
        color: "#000000",
        fontWeight: "500",
        lineHeight: 18
    },

    labelValuesHistory: {
        fontSize: 13,
        color: "#000000",
        fontWeight: "400",
        lineHeight: 18
    },

    bookNowButtonContainer: {
        width: "100%",
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 10
    },

    bookNowButtonText: {
        fontSize: 14,
        lineHeight: 20
    },

    sampleFeedBackMainContainer: {
        backgroundColor: "#F2F6F9",
        borderRadius: 10,
        marginTop: 20,
        paddingVertical: 5
    },

    SampleFeedBackSubContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#E8E8E8",
        paddingBottom: 10,
        marginBottom: 10
    },

    sampleFeedBackContentContainer: {
        width: "30%",
        paddingLeft: 20,
        height: 70,
        paddingTop: 10
    },

    sampleFeedBackContentContainer2: {
        height: 70,
        paddingTop: 10,
        width: "40%",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#E8E8E8",
        alignItems: "center"
    },

    lablesTextSampleFeedBack: {
        color: "#000",
        fontSize: 13,
        fontWeight: "400"
    },

    lablesTextSampleFeedBack1: {
        color: "#000",
        fontSize: 15,
        fontWeight: "500"
    },

    SampleFeedBackSubContainer2: {
        height: 70,
        paddingTop: 10,
        alignItems: "center",
        width: "40%",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#E8E8E8",
        alignSelf: "center"
    },

    picMainContainer: {
        backgroundColor: "#F2F6F9",
        width: width * 0.2,
        height: height * 0.10,
        marginTop: 15,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center"
    },

    cancelIconContainer: {
        position: "absolute",
        marginVertical: 10,
        alignSelf: "flex-end",
        padding: 4,
        borderRadius: 30,
        bottom: height * 0.075,
        right: -width * 0.02
    },

    cancelIcon: {
        resizeMode: "contain",
        height: 8,
        width: 8,
    },

    selfyImg: {
        height: width * 0.15,
        width: width * 0.15,
        borderRadius: 8
    },

    textInputContainer1: {
        borderColor: "#D6D6D6",
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        // height: height * 0.08,
        borderRadius: 8,
        paddingLeft: 10,
        paddingTop: 5
    },

    preSeasonMeetingText: {
        color: "#8F8F8F",
        fontSize: RFValue(12, 680),
        marginVertical: 2
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

    crossIconContainer: {
        alignSelf: "flex-end",
        borderWidth: 1,
        height: 35, width: 35,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18
    },

    crossIcon: {
        height: 15,
        width: 15,
        resizeMode: "contain"
    },

    successIcon: {
        height: 60,
        width: 60,
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
        fontSize: RFValue(14, 680),
        marginTop: 10,
        lineHeight: 30
    },

    successMainContainerText: {
        marginBottom: 10,
        alignItems: "center"
    },

    successSubText: {
        color: "#7A7A7A",
        fontSize: RFValue(15, height),
        marginVertical: 10,
        textAlign: "center"
    }



})