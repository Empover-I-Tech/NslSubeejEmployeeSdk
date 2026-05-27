import React, { useState, useCallback } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback, Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RFValue } from "react-native-responsive-fontsize";
import moment from "moment";

import CustomDropDown from "../components/CustomDropDown";
import CustomTextInput from "../components/CustomInput";
import CustomDate from "../components/CustomDate";
import CustomHybridDropDown from "../components/CustomHybridListDropDown";
import { CustomCommonModal } from '../components/CustomCommonModal';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import SimpleToast from 'react-native-simple-toast';

import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import { useFontStyles } from "../hooks/useFontStyles";

const { height } = Dimensions.get("window");

const BookSeeds = () => {
    const fonts = useFontStyles();
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const isConnected = useSelector(state => state.network.isConnected);
    const navigation = useNavigation();
    const { fetchData } = useGetRequestWithJwt();
    const { sendData, loading, postStatusCode } = usePostRequestWithJwt();

    const [selectCrops, setSelectCrops] = useState(translate("select_crop"));
    const [selectCropDrop, setSelectCropDrop] = useState(false);
    const [cropsList, setCropsList] = useState([]);
    const [hybridsList, setHybridsList] = useState([]);
    const [selectHybrid, setSelectHybrid] = useState(translate("Select_Hybrid_Variety"));
    const [selectHybridDrop, setSelectHybridDrop] = useState(false);
    const [quantityInput, setQuantityInput] = useState("");
    const [selectedDate, setSelectedDate] = useState(translate("Select_Date"));
    const [isCalendarVisible, setCalendarVisible] = useState(false);

    const [selectCropValidations, setSelectCropValidations] = useState(false);
    const [selectHybridValidations, setSelectHybridValidations] = useState(false);
    const [quantityValidations, setQuantityValidations] = useState(false);
    const [requiredByValidations, setRequiredByValidations] = useState(false);

    const [alertModal, setAlertModal] = useState(false);
    const [alertTextContent, setAlertTextContent] = useState("");
    const [successMssgVisible, setSuccessMssgVisible] = useState(false);
    const [successMssg, setSuccesMssg] = useState("");
    const [successMobileNumber, setSuccessMobileNumber] = useState("");
    const [apiSendDate, setApiSendDate] = useState("");
    const [loaderApi, setLoaderApi] = useState(false);
    const [buttonDisable, setButtonDisable] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchHybridsAndCrops();
            setSelectCrops(translate("select_crop"));
            setSelectHybrid(translate("Select_Hybrid_Variety"));
            setSelectedDate(translate("Select_Date"));
            setQuantityInput("");
            setSelectCropValidations(false);
            setSelectHybridValidations(false);
            setQuantityValidations(false);
            setRequiredByValidations(false);
        }, [])
    );

    const fetchHybridsAndCrops = async () => {
        if (!isConnected) {
            SimpleToast.show(translate("no_internet_conneccted"));
            return;
        }
        try {
            setLoaderApi(true);
            const headers = await GetApiHeaders();
            headers.authType = "JSONREQUEST";
            const payload = { companyCode: dynamicStyles.companyCode };
            const url = APIConfig.BASE_URL + APIConfig.GETACTIVECROPS;
            const response = await sendData(url, payload, headers, false);

            if (response.statusCode === HTTP_OK) {
                setCropsList(response?.data?.response?.cropList || []);
            } else {
                setAlertModal(true);
                setAlertTextContent(translate("Unable_to_fetch_issue_details"));
            }
        } catch (error) {
            setAlertModal(true);
            setAlertTextContent(translate("An_unexpected_error_occurred_Please_try_again"));
        } finally {
            setLoaderApi(false);
        }
    };

    const handleBookNowBtn = async () => {
        if (selectCrops === translate("select_crop")) {
            setSelectCropValidations(true);
        } else if (selectHybrid === translate("Select_Hybrid_Variety")) {
            setSelectHybridValidations(true);
        } else if (!quantityInput) {
            setQuantityValidations(true);
        } else if (selectedDate === translate("Select_Date")) {
            setRequiredByValidations(true);
        } else {
            await fetchDataBasedOnDate();
        }
    };

    const fetchDataBasedOnDate = async () => {
        if (!isConnected) {
            SimpleToast.show(translate("no_internet_conneccted"));
            return;
        }
        try {
            setLoaderApi(true);
            const headers = await GetApiHeaders();
            headers.farmerId = Number.parseInt(headers.userId);
            const payload = {
                id: 0,
                hybridName: selectHybrid,
                cropName: selectCrops,
                quantity: quantityInput,
                requiredBy: apiSendDate,
                status: true
            };
            const url = APIConfig.BASE_URL + APIConfig.addSeedBooking_v1;
            const response = await sendData(url, payload, headers, false);
            console.log("Book Seeds Response ==> ", response);
            if (response?.statusCode === HTTP_OK) {
                setSuccesMssg(response.data.message);
                setSuccessMobileNumber(response.data.MobileNumber);
                setSuccessMssgVisible(true);
                setSelectCrops(translate("select_crop"));
                setSelectHybrid(translate("Select_Hybrid_Variety"));
                setQuantityInput("");
                setSelectedDate(translate("Select_Date"));
            } else {
                setAlertModal(true);
                setAlertTextContent(translate("Unable_to_fetch_issue_details"));
            }
        } catch (error) {
            setAlertModal(true);
            setAlertTextContent(translate("An_unexpected_error_occurred_Please_try_again"));
        } finally {
            setLoaderApi(false);
        }
    };


    const closeSuccesMssgModal = () => {
       
        setSuccessMssgVisible(false)
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                        <View style={RnStyles.headerContentContainer}>
                            <TouchableOpacity disabled={buttonDisable} onPress={() => navigation.goBack()}>
                                <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
                            </TouchableOpacity>
                            <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("book_seeds")}</Text>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate("BookingHistory")}>
                                <Image source={require('../../assets/Images/timerIcon.png')} style={[RnStyles.timerImg, { tintColor: dynamicStyles.secondaryColor }]} />
                            </TouchableOpacity>
                        </View>
                        <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
                    </View>

                    {/* Content */}
                    <View style={RnStyles.contentMainContainer}>
                        <View style={RnStyles.textFieldsMainContainer}>
                            <CustomDropDown
                                label={translate("select_crop")}
                                inputValue={selectCrops}
                                handleDropDown={() => setSelectCropDrop(!selectCropDrop)}
                                dropDownVisible={selectCropDrop}
                                closeDropDown={() => setSelectCropDrop(false)}
                                data={cropsList}
                                name="cropsList"
                                valueHandle={(val, hybridList) => {
                                    setSelectCrops(val);
                                    setSelectCropValidations(false);
                                    setSelectCropDrop(false);
                                    setHybridsList(hybridList || []);
                                    setSelectHybrid(translate("Select_Hybrid_Variety"));
                                }}
                                validationsBorder={selectCropValidations}
                            />
                            {selectCropValidations && <Text style={{ color: "#ED3237", fontSize: RFValue(14, height), fontFamily: fonts.Medium }}>{translate("Please_Select_Crop")}</Text>}

                            <CustomHybridDropDown
                                label={translate("Select_Hybrid_Variety")}
                                inputValue={selectHybrid}
                                handleDropDown={() => {
                                    if (selectCrops === translate("select_crop")) {
                                        setAlertModal(true);
                                        setAlertTextContent(translate("Please_Select_Crop"));
                                    } else {
                                        setSelectHybridDrop(true);
                                    }
                                }}
                                dropDownVisible={selectHybridDrop}
                                closeDropDown={() => setSelectHybridDrop(false)}
                                data={hybridsList}
                                name="hybridName"
                                valueHandle={(val) => {
                                    setSelectHybrid(val);
                                    setSelectHybridValidations(false);
                                    setSelectHybridDrop(false);
                                }}
                                validationsBorder={selectHybridValidations}
                            />
                            {selectHybridValidations && <Text style={{ color: "#ED3237", fontSize: RFValue(14, height), fontFamily: fonts.Medium }}>{translate("Please_select_hybrid")}</Text>}

                            <CustomTextInput
                                label={translate("text_Quantity")}
                                placeHolderValue={selectCrops === "Cotton" ? translate("plc_Enter_Number_Packets") : translate("Enter_kilograms")}
                                inputValue={quantityInput}
                                handleValue={(val) => {
                                    setQuantityInput(val.replace(/[^0-9]/g, '').replace(/^0+/, ''));
                                    setQuantityValidations(false);
                                }}
                                validationBorder={quantityValidations}
                            />
                            {quantityValidations && <Text style={{ color: "#ED3237", fontSize: RFValue(14, height), fontFamily: fonts.Medium }}>{translate("Please_enter_quantity")}</Text>}

                            <CustomDate
                                label={translate("Required_By")}
                                inputValue={selectedDate}
                                visible={isCalendarVisible}
                                handleModal={() => setCalendarVisible(true)}
                                onSelectDate={(date) => {
                                    setSelectedDate(moment(date, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY"));
                                    setApiSendDate(date);
                                    setCalendarVisible(false);
                                    setRequiredByValidations(false);
                                }}
                                validationBorder={requiredByValidations}
                                closeDate={() => setCalendarVisible(false)}
                            />
                            {requiredByValidations && <Text style={{ color: "#ED3237", fontSize: RFValue(14, height), fontFamily: fonts.Medium }}>{translate("Please_select_date")}</Text>}
                        </View>

                        <TouchableOpacity onPress={handleBookNowBtn} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                            <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Book_now")}</Text>
                        </TouchableOpacity>
                    </View>

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
                                        <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("ok")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    <CustomCommonModal
                        modalVisible={alertModal}
                        modalClose={() => setAlertModal(false)}
                        ErrorText={alertTextContent}
                        ButtonText={translate("ok")}
                        ButtonFun={() => setAlertModal(false)}
                    />

                    {loaderApi && <PreLoginCustomLoader />}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default BookSeeds;

const RnStyles = StyleSheet.create({
    headerMainContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
        height: 80
    },
    headerContentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    backArrowImg: { height: 40, width: 40, resizeMode: "contain" },
    bookSeedsText: { fontSize: RFValue(16, height), alignSelf: "center" },
    timerImg: { height: 30, width: 30, resizeMode: "contain" },
    flowerImg: { position: "absolute", top: 30, right: 40, height: 50, width: 100, tintColor: "#000", resizeMode: "contain" },
    contentMainContainer: { padding: 20 },
    textFieldsMainContainer: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 20, marginBottom: 15, paddingBottom: 20 },
    bookNowButtonContainer: { width: "100%", height: 50, alignItems: "center", justifyContent: "center", borderRadius: 10, marginTop: 10 },
    bookNowButtonText: { fontSize: 14 },
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
});
