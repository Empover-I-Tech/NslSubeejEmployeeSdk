import { Text, View, Dimensions, TouchableOpacity, StyleSheet, Image, TextInput, FlatList } from "react-native"
import { useState } from "react"
import CustomDropDown from "../components/CustomDropDown"
import CustomTextInput from "../components/CustomInput"
import CustomDate from "../components/CustomDate"
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers'
import useGetRequestWithJwt from '../api/useGetRequestWithJwt'
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import moment from "moment";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt"
import { RFValue } from "react-native-responsive-fontsize";
import SimpleToast from "react-native-simple-toast"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFontStyles } from "../hooks/useFontStyles"

const { width, height } = Dimensions.get('window');


const SampleFeedBack = (route) => {
    const fonts = useFontStyles()
    const [selectCrops, setSelectCrops] = useState("Select Crop")
    const [selectCropDrop, setSelectCropDrop] = useState(false)
    const [selectHybrid, setSelectHybrid] = useState("Select Hybrid/Variety")
    const [selectHybridDrop, setSelectHybridDrop] = useState(false)
    const [quantityInput, setQuantityInput] = useState("")
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(translate("Select_Date"));
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [quantityValidations, setQuantityValidations] = useState(false)
    const [requiredByValidations, setRequiredByValidations] = useState(false)
    const navigation = useNavigation();
    const formattedDate = moment(route?.route?.params.requiredBy, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY");
    const { fetchData } = useGetRequestWithJwt();
    const { postData, loading, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();

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
        setQuantityInput(value.replace(/[^0-9]/g, '').replace(/^0+/, ''))
        setQuantityValidations(false)
    }

    const handleDateModal = () => {
        setCalendarVisible(true)
    }

    const closeDate = () => {
        setCalendarVisible(false)
    }

    const handleNavigationBookHistory = () => {
        navigation.navigate("BookingHistory")
    }

    const handleNavigationGoBack = () => {
        navigation.goBack()
    }

    const fetchDataBasedOnDate = async () => {
        try {
            const formattedDate = moment().format(route?.route?.params.requiredBy);
            const headers = await GetApiHeaders();
            headers.farmerId = Number.parseInt(headers.userId)
            const payload = {
                id: route?.route?.params.id,
                hybridName: route?.route?.params.hybridName,
                cropName: route?.route?.params.cropName,
                quantity: route?.route?.params.quantity,
                requiredBy: formattedDate,
                status: true,
                harvestYield: Number.parseInt(quantityInput),
                dateOfPlanting: selectedDate
            };

            const url = APIConfig.BASE_URL + APIConfig.addSeedBooking_v1
            const response = await sendData(url, payload, headers, false);
            console.log("Response Data:kiran====>", response);
            console.log("Responheadersse Data:kiran====>", headers);
            if (response?.statusCode === HTTP_OK) {
                setSelectedDate(translate("Select_Date"))
                setQuantityInput("")
                // console.log("checkingSampeFeedBack=-=->",response.data.message)
                SimpleToast.show(response?.data?.message)
                navigation.navigate("BookingHistory")
            } else {
                SimpleToast.show(translate("Unable_to_fetch_issue_details"))

                // Alert.alert(translate("Error"),translate("Unable_to_fetch_issue_details"));
            }
        } catch (error) {
            SimpleToast.show(translate("An_unexpected_error_occurred_Please_try_again"))

            console.error("Error fetching data:", error);
            // Alert.alert(translate("Error"),translate("An_unexpected_error_occurred_Please_try_again"));
        }
    };

    const submitButton = () => {
        if (selectedDate === translate("Select_Date")) {
            setRequiredByValidations(true)
        } else if (quantityInput === "") {
            setQuantityValidations(true)
        } else {
            setRequiredByValidations(false)
            setQuantityValidations(false)
            fetchDataBasedOnDate()
        }
    }



    return (
        <View style={RnStyles.booksSeedsMainContainer}>
            <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>

                <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                    <View style={RnStyles.headerContentContainer}>
                        <TouchableOpacity onPress={handleNavigationGoBack}>
                            <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
                        </TouchableOpacity>
                        <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Sample_Feedback")}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
                </View>
            </SafeAreaView>


            <View style={RnStyles.contentMainContainer}>
                <View style={RnStyles.textFieldsMainContainer}>
                    <View style={RnStyles.sampleFeedBackMainContainer}>
                        <View style={RnStyles.SampleFeedBackSubContainer}>
                            <View style={RnStyles.sampleFeedBackContentContainer}>
                                <Text style={[RnStyles.lablesTextSampleFeedBack, { fontFamily: fonts.Regular }]}>{translate("Crop_text")}</Text>
                                <Text style={[RnStyles.lablesTextSampleFeedBack1, { fontFamily: fonts.SemiBold }]}>{route?.route?.params.cropName}</Text>
                            </View>
                            <View style={RnStyles.sampleFeedBackContentContainer2}>
                                <Text style={[RnStyles.lablesTextSampleFeedBack, { fontFamily: fonts.Regular }]}>{translate("Hybrid/Variety")}</Text>
                                <Text style={[RnStyles.lablesTextSampleFeedBack1, { fontFamily: fonts.SemiBold }]}>{route?.route?.params.hybridName}</Text>
                            </View>
                            <View style={RnStyles.sampleFeedBackContentContainer}>
                                <Text style={[RnStyles.lablesTextSampleFeedBack, { fontFamily: fonts.Regular }]}>{translate("Booking_Date")}</Text>
                                <Text style={[RnStyles.lablesTextSampleFeedBack1, { fontFamily: fonts.SemiBold }]}>{formattedDate}</Text>
                            </View>
                        </View>
                        <View style={RnStyles.SampleFeedBackSubContainer2}>
                            <Text style={[RnStyles.lablesTextSampleFeedBack, { fontFamily: fonts.Regular }]}>{translate("text_Quantity")}</Text>
                            <Text style={[RnStyles.lablesTextSampleFeedBack1, { fontFamily: fonts.SemiBold }]}>{`${route?.route?.params.quantity}${route?.route?.params.cropName.toLowerCase() === "cotton" ? "Pkts" : "Kgs"}`}</Text>
                        </View>

                    </View>

                    <CustomDate
                        label={translate("Date_of_Planting")}
                        inputValue={selectedDate}
                        visible={isCalendarVisible}
                        handleModal={handleDateModal}
                        onSelectDate={(date) => {
                            setSelectedDate(date);
                            setCalendarVisible(false);
                            setRequiredByValidations(false)
                        }}
                        validationBorder={requiredByValidations}
                        closeDate={closeDate}
                    />
                    {requiredByValidations && <Text style={{ color: "#ED3237", fontSize: 15, fontFamily: fonts.Medium }}>{translate("Please_select_date")}</Text>}

                    <CustomTextInput
                        label={translate("Harvest_Yield")}
                        placeHolderValue={translate("EnterQuintals")}
                        inputValue={quantityInput}
                        handleValue={handleQuantityInput}
                        validationBorder={quantityValidations}
                    />
                    {quantityValidations && <Text style={{ color: "#ED3237", fontSize: 15, fontFamily: fonts.Medium }}>{translate("Please_enter_quintals")}</Text>}

                </View>
                <TouchableOpacity onPress={submitButton} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                    <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("submit")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SampleFeedBack

const RnStyles = StyleSheet.create({
    booksSeedsMainContainer: {
        backgroundColor: "#F2F6F9",
        height: 500,
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
        // width: "70%"
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
        top: 30,
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
        paddingBottom: 20
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
        // lineHeight: 18
    },

    labelValuesHistory: {
        fontSize: 13,
        color: "#000000",
        fontWeight: "400",
        // lineHeight: 18
    },

    bookNowButtonContainer: {
        width: "100%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },

    bookNowButtonText: {
        fontSize: 14,
        // lineHeight: 20
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
        // paddingLeft: 20,
        height: 70,
        paddingTop: 10,
        alignItems: "center"
        // paddingRight
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
        fontSize: RFValue(12, height),
    },

    lablesTextSampleFeedBack1: {
        color: "#000",
        fontSize: RFValue(12, height),
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
})