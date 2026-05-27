import { TextInput, Modal, Dimensions, FlatList, Text, View, Image, StyleSheet, TouchableOpacity, Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Alert, Linking, PermissionsAndroid, Platform } from "react-native"
import CustomTextArea from "../components/CustomTextArea"
import React, { useCallback, useEffect, useState } from 'react';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { GetApiHeaders } from '../utils/helpers';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import usePostRequestWithJwt from '../api/usePostRequestWithJwt';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from "react-native-responsive-fontsize";
import { translate } from "../Localization/Localisation";
import SimpleToast from 'react-native-simple-toast';
import { CustomCommonModal } from '../components/CustomCommonModal';
import { useQuery, useRealm } from "@realm/react";
import { helpDeskRaiseCRUD } from "./realmOffline/helpDeskRaiseCRUD";
import { createHelpDeskFormData, getFormattedDateTime } from "../assets/Utils/Utils";
import { useOfflineSync } from "../utils/syncUtils";
import { useFontStyles } from "../hooks/useFontStyles";
import { PERMISSIONS, request, RESULTS, check } from 'react-native-permissions';
import { EMP_DASHBOARD_SCREEN, ROLDID, SCREENNAME } from "../utils";
import { getFromAsyncStorage } from "../utils/keychainUtils";

const { width, height } = Dimensions.get('window');
const CustomDropDown = ({ validationsBorder, valueHandle, name, data, label, inputValue, handleDropDown, dropDownVisible, closeDropDown }) => {
    const fonts = useFontStyles()
    const renderList = (item) => {
        return (
            <TouchableOpacity onPress={() => valueHandle(item.item)} style={RnStyle.labelContainer}>
                <Text style={[RnStyle.labeTextContainer, { fontFamily: fonts.SemiBold }]}>{item.item.name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View>
            <Text style={[RnStyle.labelText, { fontFamily: fonts.SemiBold }]}>{label}<Text style={{ color: "red" }}> *</Text></Text>
            <TouchableOpacity onPress={handleDropDown} style={[RnStyle.textInputContainer, { borderColor: validationsBorder ? "#ED3237" : "#D6D6D6" }]}>
                <Text style={[RnStyle.selectCropTextInput, { fontFamily: fonts.Regular }]}>{inputValue}</Text>
                <TouchableOpacity onPress={handleDropDown}>
                    <Image source={require('../../assets/Images/dropDownIcon.png')} style={RnStyle.dropDownIcon} />
                </TouchableOpacity>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={dropDownVisible}
            >
                <TouchableWithoutFeedback onPress={closeDropDown}>
                    <View style={RnStyle.modalMainContainer}>
                        <View style={RnStyle.modalSubContainer}>
                            <FlatList data={data} renderItem={renderList} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

const RaiseComplaintScreen = () => {
    const fonts = useFontStyles()

    const isConnected = useSelector(state => state.network.isConnected);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const { postData, loading, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
    const { fetchData } = useGetRequestWithJwt();
    const [catagoryList, setCatagoryList] = useState([])
    const [selectCategory, setSelectCategory] = useState(translate("Select_Category"))
    const [selectCategoryId, setSelectCategoryId] = useState(null)
    const [selectCategoryValidation, setSelectCategoryValidation] = useState(false)
    const [subCatagoryList, setSubCatagoryList] = useState([])
    const [subCategoryList1, setSubCategory1] = useState([])
    const [subSelectCategory, setSubSelectCategory] = useState(translate("Select_Sub_Category"))
    const [subSelectCategoryId, setSubSelectCategoryId] = useState(null)
    const [subSelectCategoryValidation, setSubSelectCategoryValidation] = useState(false)
    const [categoryListVisibleDropDown, setCategoryListVisible] = useState(false)
    const [subCategoryListVisibleDropDown, setSubCategoryListVisible] = useState(false)
    const [imagePic, setImagePic] = useState(null)
    const [remarksValue, setRemarksValue] = useState("")
    const [loaderIcon, setLoaderIcon] = useState(false)
    const [successModal, setSuccessModal] = useState(false)
    const [successMssg, setSuccessMssg] = useState("")
    const [imageSelectionModal, setImageSelectionModal] = useState(false)
    const [coupons, setCoupons] = useState("")
    const [couponList, setCouponList] = useState([])
    const [couponValidation, setCouponValidation] = useState(false)
    const [couponValidationContent, setCouponValidationContent] = useState("")
    const [alertModal, setAlertModal] = useState(false)
    const [alertTextContent, setAlertTextContent] = useState("")
    const cachedSamadhanHistory = useQuery('SAMADHANHISTORY');
    const navigation = useNavigation();

    const [btnEnabled, setBtnEnabled] = useState(true)

    const {
        saveHelpDesk,
        getAllHelpDesk,
        deleteHelpDeskByUniquId
    } = helpDeskRaiseCRUD();

    const { updateOfflineCount } = useOfflineSync();

    useFocusEffect(
        useCallback(() => {
            handleSubmit();
        }, [])
    );

    const handleOnchangeCoupon = (value) => {
        setCoupons(value.replace(/\s/g, "").replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)/g, '').replace(/[^A-Za-z0-9]/g, ""))
        setCouponValidation(false)
        setCouponValidationContent("")

    }

    const pickImageFromGallery = async () => {
        await launchImageLibrary(
            { mediaType: 'photo', selectionLimit: 1 },
            (response) => {
                if (response.assets) {
                    setImagePic(response.assets[0].uri);
                    setImageSelectionModal(false)
                }
            }
        );

    };

    const alertCloseHandle = () => {
        setAlertModal(false)
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


    const takePhoto = async () => {
        await launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
            if (response.assets) {
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
            console.log("checakingfixigs=-=->", status)
            if (status === RESULTS.GRANTED) {
                takePhoto()
            } else if (status === RESULTS.BLOCKED) {
                showPermissionAlert('camera');
            } else {
                showPermissionAlert('camera');
            }
        }
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

                //   console.warn('Permission error:', error);
                return { granted: false, error };
            }
        } else if (Platform.OS === 'ios') {
            try {
                const currentStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

                if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
                    // ✅ Either full or limited access is acceptable here
                    pickImageFromGallery();
                } else if (currentStatus === RESULTS.DENIED) {
                    const requestStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
                    if (requestStatus === RESULTS.GRANTED || requestStatus === RESULTS.LIMITED) {
                        pickImageFromGallery();
                    } else {
                        showPermissionAlert();
                    }
                } else if (currentStatus === RESULTS.BLOCKED) {
                    showPermissionAlert(); // Suggest open settings
                } else {
                    showPermissionAlert();
                }

            } catch (error) {
                console.warn('iOS Permission error:', error);
            }
        }

    };

    const handleSubmit = async () => {
        if (cachedSamadhanHistory && cachedSamadhanHistory.length > 0) {
            const parseCacheSamadhanHistory = JSON.parse(cachedSamadhanHistory[0].ticketsHistory)
            console.log("here=-=-=>", (parseCacheSamadhanHistory.categoryList))
            setCatagoryList(parseCacheSamadhanHistory.categoryList)
            setSubCatagoryList(parseCacheSamadhanHistory.subCategoryList)
        }
        else if (isConnected) {
            try {
                const url = APIConfig.BASE_URL_NVM + APIConfig.GETMASTERFORCUSTOMERSUPPORT

                const headers = await GetApiHeaders();
                headers.applicationName = "subeej"
                const response = await fetchData(url, headers);
                if (response && response.statusCode === HTTP_OK) {
                    setCatagoryList(response.data.categoryList)
                    setSubCatagoryList(response.data.subCategoryList)
                }
            } catch (error) {
                SimpleToast.show(error.message)
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))

        }
    };

    const backScreen = () => {
        navigation.goBack()
    }

    const categoryHandleDropDown = () => {
        setCategoryListVisible(true)
    }

    const CloseCategoryHandleDropDown = () => {
        setCategoryListVisible(false)
    }

    const categoryValueHandle = (value) => {
        const filterSubCategory = subCatagoryList.filter((item) => item.categoryId === value.id)
        setSubCategory1(filterSubCategory)
        setSelectCategory(value.name)
        setCategoryListVisible(false)
        setSelectCategoryValidation(false)
        setSelectCategoryId(value.id)
        setSubSelectCategory(translate("Select_Sub_Category"))
    }

    const subCategoryHandleDropDown = () => {
        if (selectCategory === translate("Select_Category")) {
            setAlertModal(true)
            setAlertTextContent(translate("Please_Select_Category"))
        } else {
            setSubCategoryListVisible(true)
        }
    }

    const closeSubCategoryHandleDropDown = () => {
        setSubCategoryListVisible(false)
    }

    const subCategoryValueHandle = (value) => {
        setSubSelectCategory(value.name)
        setSubCategoryListVisible(false)
        setSubSelectCategoryValidation(false)
        setSubSelectCategoryId(value.id)
    }


    const raiseComplaint = async () => {

        const headers = await GetApiHeaders();
        headers['Content-Type'] = APIConfig.MULTIPARTFORMDATA
        headers.applicationName = "subeej"
        const submissionTime = await getFormattedDateTime();
        const couponsName = {
            couponName: coupons
        }
        setCouponList([couponsName])


        var finalJson = {
            id: 0,
            userId: headers.userId,
            categoryId: selectCategoryId,
            subCategoryId: subSelectCategoryId,
            categoryName: selectCategory,
            subcategoryName: subSelectCategory,
            status: true,
            remarks: remarksValue,
            scanCouponLabel: [couponsName],
            mobileUniqueId: headers.userId + "_" + submissionTime,
            mobileSubmitionDateTime: submissionTime,
            imageURI: imagePic != null ? imagePic : ""
        }
        console.log("formData=-=->", finalJson)
        const success = saveHelpDesk(finalJson);
        if (success) {
            updateOfflineCount()
            const payloadObj = getAllHelpDesk();
            if (isConnected && payloadObj != null) {
                console.log("payloadObj===>2222", payloadObj)
                setLoaderIcon(true)
                if (payloadObj.length > 0) {
                    for (let i = 0; i < payloadObj.length; i++) {
                        const currentRecord = payloadObj[i];
                        const formData = await createHelpDeskFormData(currentRecord);
                        console.log(`FormData for record ${i + 1}:`, formData);

                        try {
                            const url = APIConfig.BASE_URL_NVM + APIConfig.RAISECOMPLAINTS;
                            const responseApi = await sendData(url, formData, headers, false);
                            console.log(`Response for record ${i + 1}:`, JSON.stringify(responseApi));

                            if (responseApi?.data && responseApi?.data?.statusCode === HTTP_OK) {
                                console.log(responseApi?.data?.message);
                                setSuccessMssg(responseApi?.data?.message);
                                if (responseApi?.data?.response != null && responseApi?.data?.response?.mobileUniqueId != "") {
                                    await deleteHelpDeskByUniquId(responseApi?.data?.response?.mobileUniqueId);
                                }
                                setSuccessModal(true);
                                // Optionally: mark record as synced in Realm here
                            } else {
                                SimpleToast.show(responseApi.data?.message || translate('Something_went_wrong'));
                            }
                        } catch (error) {
                            console.error(`Error for record ${i + 1}:`, error);
                        }
                    }

                    // Reset UI once all are done
                    setLoaderIcon(false);
                    setSelectCategory(translate("Select_Category"));
                    setSubSelectCategory(translate("Select_Sub_Category"));
                    setImagePic("");
                    setRemarksValue("");
                    setCouponValidation(false);
                    setCouponValidationContent("");
                }

            }
            else {
                const payloadObj = getAllHelpDesk();
                console.log("ddsdsdsd===>", JSON.stringify(payloadObj))
                setSuccessMssg(translate("Data_saved_offline"))
                setSuccessModal(true)
                setLoaderIcon(false)
                setSelectCategory(translate("Select_Category"))
                setSubSelectCategory(translate("Select_Sub_Category"))
                setImagePic("")
                setRemarksValue("")
                setCouponValidation(false)
                setCouponValidationContent("")
            }
        }
        setBtnEnabled(true)
    };

    const submitFormBtn = () => {
        if (selectCategory === translate("Select_Category")) {
            setSelectCategoryValidation(true)
        } else if (subSelectCategory === translate("Select_Sub_Category")) {
            setSubSelectCategoryValidation(true)
        } else if (selectCategoryId === 4 && coupons === "") {
            setCouponValidation(true)
            setCouponValidationContent(translate("pleaseEnterCoupon"))
        } else if (selectCategoryId === 4 && coupons.length < 3) {
            setCouponValidation(true)
            setCouponValidationContent(translate("pleaseEnterValidCoupon"))
        }

        else {
            setBtnEnabled(false)
            raiseComplaint()
        }
    }

    const handleRemarksValue = (value) => {
        setRemarksValue(value.replace(/^\s+/, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)/g, ''))
    }

    const navigateSamadhanScreen = async () => {
        setSuccessModal(false)
        const screenName = await getFromAsyncStorage(SCREENNAME)
        const isEmployee = (screenName == EMP_DASHBOARD_SCREEN);
        if (isEmployee) {
            navigation.navigate('BottomTabsNavigatorEmp', {
                screen: 'SamadhanScreen',
                params: { screenName: 'raiseComplaint' },
            });
        } else {
            navigation.navigate('MainTabs', { screen: 'SamadhanScreen', params: { screenName: 'raiseComplaint' } });
        }
    };

    return (
        <>
            {/* <KeyboardAvoidingView
                style={{ flex: 1, top: 30 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // adjust if header exists
            > */}

            <View style={[RnStyle.headerContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: Platform.OS === 'ios' ? 15 : 0 }}>
                    <Image source={require('../../assets/Images/BackIcon.png')}
                        style={[{
                            height: 40,
                            width: 40,
                            resizeMode: "contain", tintColor: dynamicStyles.secondaryColor
                        }]} />
                </TouchableOpacity>
                <Text style={[RnStyle.samadhanText, { fontFamily: fonts.SemiBold, color: dynamicStyles.secondaryColor }]}>{translate("Raise_Complaints")}</Text>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    // paddingHorizontal: 20,
                    paddingTop: 10,
                    paddingBottom: 60, // small bottom padding for smooth scroll
                }}
            >
                <TouchableWithoutFeedback
                    onPress={() => Keyboard.dismiss()}
                >

                    <View style={RnStyle.samadhanMainContainer}>

                        <View>
                            <Text style={[RnStyle.headerMssgText, { fontFamily: fonts.SemiBold }]}>{translate("Customer_support")}</Text>
                            <View style={RnStyle.line} />
                            <CustomDropDown
                                label={translate("Select_Category")}
                                inputValue={selectCategory}
                                dropDownVisible={categoryListVisibleDropDown}
                                handleDropDown={categoryHandleDropDown}
                                data={catagoryList}
                                valueHandle={categoryValueHandle}
                                validationsBorder={selectCategoryValidation}
                                closeDropDown={CloseCategoryHandleDropDown}
                            />
                            {selectCategoryValidation && <Text style={[RnStyle.validationText, { fontFamily: fonts.Medium }]}>{translate("Please_Select_Category")}</Text>}
                            <CustomDropDown
                                label={translate("Select_Sub_Category")}
                                inputValue={subSelectCategory}
                                dropDownVisible={subCategoryListVisibleDropDown}
                                data={subCategoryList1}
                                handleDropDown={subCategoryHandleDropDown}
                                valueHandle={subCategoryValueHandle}
                                validationsBorder={subSelectCategoryValidation}
                                closeDropDown={closeSubCategoryHandleDropDown}


                            />
                            {subSelectCategoryValidation && <Text style={[RnStyle.validationText, { fontFamily: fonts.Medium }]}>{translate("Please_Select_sub_category")}</Text>}

                            {selectCategoryId === 4 &&
                                <View>
                                    <Text style={[RnStyle.labelText, { fontFamily: fonts.SemiBold }]}>{translate("AddCoupon")}<Text style={{ color: "red" }}> *</Text></Text>
                                    <TextInput value={coupons} onChangeText={handleOnchangeCoupon} placeholderTextColor={"#00000080"} placeholder={translate("PleaseAddCoupon")} style={[RnStyle.textInputContainer1, { borderColor: couponValidation ? "#ED3237" : "#D6D6D6", fontFamily: fonts.Regular }]} />
                                    {couponValidation && <Text style={[RnStyle.validationText, { fontFamily: fonts.Medium }]}>{couponValidationContent}</Text>}
                                </View>
                            }

                            <View style={RnStyle.imageLabeContainer}>
                                <Text style={[RnStyle.imageLabel, { fontFamily: fonts.SemiBold }]}>{translate("Image_Upload")}</Text>

                                <TouchableOpacity onPress={() => setImageSelectionModal(true)} style={RnStyle.imageMainContainer}>
                                    {imagePic ?
                                        <Image source={{ uri: imagePic }} style={{ height: 130, borderRadius: 8, resizeMode: "contain" }} />
                                        :
                                        <View style={{ backgroundColor: "#E8E8E8", height: 130, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
                                            <TouchableOpacity onPress={() => setImageSelectionModal(true)} style={[RnStyle.selfyBtnContainer, { backgroundColor: dynamicStyles.secondaryColor }]}>
                                                <Image source={require("../../assets/Images/photoIconImg.png")}
                                                    style={[RnStyle.photoIconImg, { tintColor: dynamicStyles.primaryColor }]} />
                                                <View style={[RnStyle.plusContainer, { backgroundColor: "#DB710E" }]}>
                                                    <Image style={[RnStyle.addIcon1, { tintColor: "#fff" }]} source={require("../../assets/Images/plusIconImg.png")} />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    }

                                </TouchableOpacity>
                            </View>

                            <CustomTextArea
                                label={translate("Remarks")}
                                placeHolderValue={translate("enterRemarks")}
                                inputValue={remarksValue}
                                handleValue={handleRemarksValue}

                            />
                            {btnEnabled &&
                                <TouchableOpacity onPress={submitFormBtn} style={[RnStyle.supportTicketBtnContainer1, { backgroundColor: dynamicStyles.primaryColor }]}>
                                    <Text style={[RnStyle.supportTicketText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("submit")}</Text>
                                </TouchableOpacity>}
                        </View>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={successModal}
                        >
                            <TouchableWithoutFeedback onPress={() => setSuccessModal(false)}>
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
                                            <Image source={require('../../assets/Images/successIconMssg.png')} style={RnStyle.successIcon} />

                                        </View>
                                        <Text style={{ marginVertical: 10, color: "#000", fontSize: RFValue(14, height), fontFamily: fonts.SemiBold, alignSelf: "center" }}>{successMssg}</Text>

                                        <TouchableOpacity onPress={navigateSamadhanScreen} style={{ borderRadius: 7, marginVertical: 10, backgroundColor: dynamicStyles.primaryColor, height: 40, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: 14, fontFamily: fonts.SemiBold }}>{translate("ok")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={imageSelectionModal}
                        >
                            <TouchableWithoutFeedback>
                                <View style={RnStyle.modalMainContainer1}>
                                    <View style={RnStyle.modalSubContainer1}>
                                        <View style={RnStyle.crossIconContainer1}>
                                            <Text style={[RnStyle.selectTextColor, { fontFamily: fonts.SemiBold }]}>{translate("select")}</Text>
                                            <TouchableOpacity onPress={() => setImageSelectionModal(false)}>
                                                <Image source={require('../../assets/Images/crossIcon.png')} style={RnStyle.crossIcon1} />
                                            </TouchableOpacity>
                                        </View>

                                        <View>
                                            <TouchableOpacity onPress={requestCameraPermission} style={RnStyle.buttons}>
                                                <Image source={require('../../assets/Images/camIcon.png')} style={[RnStyle.crossIcon1, { tintColor: dynamicStyles.primaryColor, marginRight: 15 }]} />
                                                <Text style={[RnStyle.cameraText, { fontFamily: fonts.SemiBold }]}>{translate("Camera")}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={requestGalleryPermission} style={RnStyle.button1}>
                                                <Image source={require('../../assets/Images/photoIconImg.png')} style={[RnStyle.crossIcon1, { tintColor: dynamicStyles.primaryColor, marginRight: 15 }]} />
                                                <Text style={[RnStyle.cameraText, { fontFamily: fonts.SemiBold }]}>{translate("Gallery")}</Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>

                    </View>

                </TouchableWithoutFeedback>
            </ScrollView>
            {/* </KeyboardAvoidingView> */}
            {loaderIcon && <PreLoginCustomLoader />}
            <CustomCommonModal
                modalVisible={alertModal}
                modalClose={alertCloseHandle}
                ErrorText={alertTextContent}
                ButtonText={translate("ok")}
                ButtonFun={alertCloseHandle}

            />
        </>
    )
}

export default RaiseComplaintScreen

const RnStyle = StyleSheet.create({

    successIcon: {
        height: 50,
        width: 50,
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 20
    },
    keyboardPadding: {
        flex: 1,
        backgroundColor: "#F2F6F9"
    },
    container: {
        flex: 1,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
    },
    samadhanMainContainer: {
        padding: 20,
        backgroundColor: "#F2F6F9"
    },

    backIcon: {
        height: 40,
        width: 40,
        resizeMode: "contain",
    },

    samadhanText: {
        color: "#000",
        fontSize: RFValue(16, height),
        marginLeft: 20,
        // lineHeight: 30
    },

    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        // marginLeft:10,
        height: 50,
        paddingLeft: 10
    },

    headerMssgText: {
        color: "#000",
        fontSize: RFValue(23, height),
        textAlign: "center",
        // lineHeight: 30
    },

    line: {
        marginVertical: 10,
        height: 1,
        width: "100%",
        backgroundColor: "#0000001A",
        borderRadius: 30
    },

    supportMssgTextContainer: {
        alignItems: "center"
    },

    supportMssgText: {
        color: "#000",
        fontSize: 13,
        fontWeight: "400"
    },

    contactSamadhanContainer: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#0000001A",
        borderRadius: 8,
        marginTop: 6,
        padding: 10,
        flexDirection: "row",
        alignItems: "center"
    },

    imgContainer: {
        backgroundColor: "#F6F6F6",
        width: 80,
        height: 80,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },

    companyLogoIcon: {
        width: 50,
        height: 20,
        // resizeMode:"contain"
    },

    contactSamadhanContentContainer: {
        marginLeft: 15
    },

    samandhanContactHeader: {
        color: "#000",
        fontWeight: "500",
        fontSize: 14
    },

    phoneNumberText: {
        color: "#000",
        fontSize: 10,
        fontWeight: "400",
        width: 190,
        marginTop: 5
    },

    callIcon: {
        height: 29, width: 28
    },

    supportTicketBtnContainer: {
        backgroundColor: "#ED3237",
        height: 40,
        marginVertical: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    supportTicketBtnContainer1: {
        height: 50,
        marginVertical: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    supportTicketIcon: {
        height: 20,
        width: 20,
        resizeMode: "contain",
        marginRight: 10
    },

    supportTicketIcon1: {
        height: 15,
        width: 15,
        resizeMode: "contain",
        marginRight: 10
    },

    supportTicketText: {
        fontSize: RFValue(14, height),
        // lineHeight: 30
    },

    couponContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginTop: 10
    },

    couponIssueText: {
        color: "#000",
        fontWeight: "500",
        fontSize: 14
    },

    gotCouponsInvalidText: {
        color: "#000",
        fontWeight: "400",
        fontSize: 13,
        marginTop: 10
    },

    imageLabeContainer: {
        // marginTop:10
    },

    imageLabel: {
        color: "#5D5D5D",
        fontSize: RFValue(14, height),
        // lineHeight: 18,
        marginTop: 10
    },

    imageMainContainer: {
        height: 150,
        borderWidth: 1,
        borderColor: "#00000040",
        borderRadius: 10,
        padding: 10
    },

    selfyBtnContainer: {
        height: 50,
        width: 50,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center"
    },

    photoIconImg: {
        height: 20,
        width: 20,
        resizeMode: "contain",
    },


    plusContainer: {
        right: -1,
        bottom: 1,
        position: "absolute",
        height: 15, width: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40
    },

    addIcon1: {
        resizeMode: "contain",
        height: 10,
        width: 10
    },



    labelText: {
        color: "#5D5D5D",
        fontSize: RFValue(14, height),
        // lineHeight: 20,
        marginTop: 10
    },

    textInputContainer: {
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 45,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10,
    },

    textInputContainer1: {
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 45,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 13,
        color: "#000",
        fontSize: RFValue(13, height),
    },

    selectCropTextInput: {
        fontSize: RFValue(14, height),
        // lineHeight: 25,
        width: "90%",
        paddingLeft: 10,
        color: "#00000080"
    },

    dropDownIcon: {
        height: 15,
        width: 15,
        tintColor: "#000",
        resizeMode: "contain"
    },

    bookNowButtonContainer: {
        width: "100%",
        height: 50,
        backgroundColor: "#ED3237",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },

    bookNowButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
        // lineHeight: 20
    },

    modalMainContainer: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end"
    },

    modalSubContainer: {
        backgroundColor: "#fff",
        padding: 10,
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
        height: "70%"
    },

    labelContainer: {
        marginVertical: 15
    },

    labeTextContainer: {
        color: "#000",
        fontSize: 16,
    },

    validationText: {
        color: "red",
        fontSize: RFValue(14, height),
        // lineHeight: 20
    },

    modalMainContainer1: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        // paddingHorizontal: 20
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
        // borderRadius: 5,
        width: "100%",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },

    crossIconContainer1: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
        //  alignItems: "flex-end"
    },

    crossIcon1: {
        height: 20,
        width: 20,
        resizeMode: "contain"
    },

    selectTextColor: {
        color: "#000",
        fontSize: RFValue(16, height),
        marginLeft: 1
    },

    cameraText: {
        color: "#000",
        fontSize: RFValue(15, height),
        // lineHeight: 30
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
    }


})