import React, { useEffect, useState, useCallback } from "react";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { useSelector } from "react-redux";
import { Styles } from "../styles/Styles";
import { Alert, Dimensions, Image, Platform, Pressable, PermissionsAndroid, TouchableOpacity, StatusBar, View, StyleSheet, TouchableWithoutFeedback, Modal, Text as RnText, FlatList, Linking } from "react-native";
import { RNHoleView } from "react-native-hole-view";
import { getWindowHeight, getWindowWidth } from "../components/Upgrade/helpers";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import APIConfig, { HTTP_OK } from "../api/APIConfig";
import { decodeJwt, GetApiHeaders } from "../utils/helpers";
import { translate } from '../Localization/Localisation';
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import Geolocation from "react-native-geolocation-service";
import { getUserLocation } from "../utils/keychainUtils";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { CommonActions, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { RFValue } from "react-native-responsive-fontsize";
// import CustomCommonModal from "../components/CustomCommonModal";
import { CustomCommonModal } from '../components/CustomCommonModal';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFontStyles } from "../hooks/useFontStyles";

const { height, width } = Dimensions.get("window")


var camDevice;

function QRScanner({ route }) {
    const navigation = useNavigation();
    const fonts = useFontStyles()
    camDevice = useCameraDevice('back');
    const currentTheme = useSelector(state => state.theme.theme);
    const isConnected = useSelector(state => state.network.isConnected);
    const styles = Styles(currentTheme);
    const [qrActivate, setQRActivate] = useState(true)
    const [flashOn, setFlashOn] = useState(false)
    const [apiRequestType, setApiRequestType] = useState(null);
    const { width, height } = Dimensions.get('window');
    const { postData, loading, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
    const [productDetails, setProductDetails] = useState({});
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [loader, setLoader] = useState(false)
    const [lotNumber, setLotNumber] = useState('');
    const [successMssgVisible, setSuccessMssgVisible] = useState(false)
    const [navigationData, setNavigationData] = useState(null);
    const [cameraPermission, setCameraPermission] = useState(null);

    const [alertModal, setAlertModal] = useState(false)
    const [alertTextContent, setAlertTextContent] = useState("")
    const locationCheck = useSelector(state => state.selectLocationReducer?.locationStyles)
    const from = route?.params?.from;

    const qrUrl = APIConfig.BASE_URL + APIConfig.AUTH.QRCODE
    console.log("cskks=-", translate("ok"))

    const alertCloseHandle = () => {
        if (alertTextContent == translate("coupon_scanned_successfully")) {
            navigation.navigate("GeoTaggingScreen", { screen: "QrScan" });
        }
        setAlertModal(false)
        setQRActivate(true);

    }


    useEffect(() => {
        const getGeoLocation = () => {
            return new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve(`${latitude},${longitude}`);
                    },
                    (error) => {
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            });
        };
        // qrData();
    }, [qrUrl])
    useEffect(() => {
        requestPermissions()
    }, [])

    // useFocusEffect(
    //     useCallback(() => {
    //         // checkPermissions()
    //     }, [])
    // );

    const requestPermissions = async () => {
        if (Platform.OS == 'android') {
            const androidVersion = DeviceInfo.getSystemVersion();
            if (androidVersion >= 13) {
                var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
                if (result['android.permission.CAMERA'] === 'granted') {
                    // navigation.navigate('QRScannerRn')
                } else {
                    showPermissionAlert();
                }
            } else {
                var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
                if (result['android.permission.CAMERA'] === 'granted') {
                    // navigation.navigate('QRScannerRn')
                    // navigation.navigate('GeoTaggingScreen')

                } else {
                    showPermissionAlert();
                }
            }
        }

        else if (Platform.OS == 'ios') {
            const status = await request(PERMISSIONS.IOS.CAMERA);
            if (status === RESULTS.GRANTED) {
                return { granted: true };
            } else if (status === RESULTS.BLOCKED) {
                showPermissionAlert();

                //   return { granted: false, blocked: true };
            } else {
                showPermissionAlert();

                //   return { granted: false, blocked: false };
            }
        }
    }

    const showPermissionAlert = () => {
        Alert.alert(
            translate('permission_required'),
            translate('camera_permission_message'),
            [
                { text: translate('cancel'), style: 'cancel' },
                { text: translate('open_settings'), onPress: () => Linking.openSettings() }
            ],
            { cancelable: true }
        );
    };

    const fetchData = async (qrData) => {
        setLoader(true)
        try {
            const headers = await GetApiHeaders();
            const payload = {
                farmerMobileNumber: headers.mobileNumber,
                qrCodeData: qrData,
                farmerId: headers.userId,
                deviceType: Platform.OS == "android" ? "Android" : "iOS",
                type: "Mobile",
                // geoLocations: "Madhapur,hyderabad",
                geoLocations: locationCheck

                // lableNumber: "LBL1234562E",
                // lotNumber: "R8P6Y9M3X2",
            };


            const response = await sendData(qrUrl, payload, headers, false);
            //   console.log("uytredfghjkl",payload)
            //   console.log("popopt=-=-=->",response)

            if (response?.data.statusCode === HTTP_OK) {
                // console.log("123456",response)
                setLoader(false)

                // Successful scan
                const qrResult = response?.response;

                const data = {
                    cropName: qrResult?.cropName || "Unknown",
                    // lotNumber: qrResult?.lotNumber || "N/A",
                    message: qrResult?.message || "No message",
                    totalPoints: qrResult?.totalPoints || 0,
                };
                setNavigationData(data);

                // navigation.navigate("GeoTaggingScreen", {screen:"QrScan"});
                //setSuccessMssgVisible(true)

                setAlertModal(true)
                setAlertTextContent(translate("coupon_scanned_successfully"))
            } else if (response?.data.statusCode === 201) {
                // QR code already scanned
                const qrResult = response?.response;
                setLoader(false)
                // setQRActivate(true);
                setAlertModal(true)
                setAlertTextContent(translate("This_QR_code_has_already_been_scanned"))

                // Alert.alert(translate("Already_Scanned"), response.message || translate("This_QR_code_has_already_been_scanned"));
            } else if (response?.statusCode === 202) {
                setLoader(false)
                // setQRActivate(true);

                setAlertModal(true)
                setAlertTextContent(translate("Unable_to_process_the_QR_code"))


                // Alert.alert(translate("Error"), response?.message || translate("Unable_to_process_the_QR_code"));

            }

            else {
                // Other errors
                setLoader(false)
                // setQRActivate(true);
                setAlertModal(true)
                setAlertTextContent(response?.message ? response.message : translate("Unable_to_process_the_QR_code"))

                // Alert.alert(translate("Error"), response?.message || translate("Unable_to_process_the_QR_code"));
            }
        } catch (error) {
            setLoader(false)
            // setQRActivate(true);
            console.error("Error fetching data:", error);
            setAlertModal(true)
            setAlertTextContent(translate("An_unexpected_error_occurred_Please_try_again"))

            //   Alert.alert(translate("Error"),translate("An_unexpected_error_occurred_Please_try_again"));
        }
    };

    const onSuccess = (response) => {
        setQRActivate(false);

        const scannedCode = response; // This will be the QR code value
        fetchData(scannedCode); // Pass the scanned QR code to the API call



    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
            if (codes.length > 0) {
                if (codes[0].value) {
                    //   console.log("codeeeeeee",codes[0])
                    setQRActivate(false);
                    setTimeout(() => onSuccess(codes[0]?.value), 500);
                }
            }
            return;
        },
    });

    const switchFalsh = () => {
        setFlashOn(!flashOn)
    }

    const onError = (error) => {
        // Alert.alert('Error!', error.message);
        setAlertModal(true)
        setAlertTextContent(error.message)


    };


    return (
        <>
            <View style={RnStyles.mainContainer}>
                {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}
                {/* Header */}
                {/* <Box style={[styles.width, styles.paddingBottom_10, { backgroundColor: dynamicStyles.primaryColor }]}> */}
                <View style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
                    <View style={{ backgroundColor: dynamicStyles.primaryColor, width: "100%", height: height * 0.08 }}>
                        <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />


                        {/* <HStack> */}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 20, paddingTop: 10 }}>


                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "60%" }}>
                                <TouchableOpacity onPress={() => {
                                    if (from === "geo") {
                                        navigation.pop(1); // normal back
                                    } else if (from === "view") {
                                        navigation.navigate("GeoTaggingScreen", { screen: "QrScan" });
                                    } else {
                                        Alert.alert("3");
                                        navigation.goBack(); // fallback
                                    }
                                }}>
                                    <Image style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.07, width: width * 0.15, resizeMode: "contain" }} source={require('../../assets/Images/BackIcon.png')} />
                                </TouchableOpacity>
                                <RnText style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(20, height), fontFamily: fonts.SemiBold }}>
                                    {translate('scan')}
                                </RnText>
                            </View>

                            <TouchableOpacity onPress={() => { switchFalsh() }}>
                                <Image source={flashOn ? require('../../assets/Images/FlashIcon.png') : require('../../assets/Images/ic_flash.png')} style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.05, width: width * 0.05, resizeMode: "contain" }} />
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>

                <View style={[{ marginTop: 25, alignItems: 'center', backgroundColor: '#fff' }]}>
                    {qrActivate &&
                        <View style={[{ backgroundColor: 'transparent', height: Dimensions.get('window').height * 2, width: Dimensions.get('window').width / 0.9, alignItems: 'center' }]}>
                            {
                                camDevice != null && (
                                    <View style={[{ height: Dimensions.get('window').height * 2, width: Dimensions.get('window').width, overflow: 'hidden', alignSelf: 'center', backgroundColor: 'black' }]}>

                                        <Camera
                                            torch={flashOn ? 'on' : 'off'}
                                            device={camDevice}
                                            style={[{ height: Dimensions.get('window').height, width: Dimensions.get('window').width, position: 'absolute' }]}
                                            photo={false}
                                            enableZoomGesture
                                            onError={onError}
                                            codeScanner={codeScanner}
                                            isActive={qrActivate} />



                                        <RNHoleView
                                            holes={[
                                                {
                                                    x: getWindowWidth() * 0.2,
                                                    y: getWindowHeight() * 0.25,
                                                    width: getWindowWidth() * 0.6,
                                                    height: getWindowHeight() * 0.3,
                                                    borderRadius: 10,
                                                },
                                            ]}
                                            style={[{
                                                alignSelf: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                position: 'absolute',
                                                width: '100%',
                                                height: '66.7%',
                                                flex: 1,
                                                zIndex: 100,
                                            }]}
                                        />
                                        {/* redText....................... */}
                                        <SafeAreaView>
                                            <View style={[{ flexDirection: "row", backgroundColor: dynamicStyles.primaryColor, width: '100%', padding: 10, borderRadius: 5, marginBottom: 15, bottom: 0, top: Dimensions.get('window').height / 1.4, position: 'absolute', alignSelf: 'center', height: 100, }]}>
                                                {/* <HStack style={[]}> */}
                                                <View style={[{ width: '80%' }]}>
                                                    <RnText style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(15, height), fontFamily: fonts.Regular }}>
                                                        {translate('please_make_qr_code_infocus')}
                                                    </RnText>
                                                    <Image style={{ height: 15, width: 15, tintColor: dynamicStyles.secondaryColor }} source={require('../../assets/Images/ic_warning.png')} />
                                                </View>
                                                <Image style={{ height: 45, width: 45, resizeMode: "contain" }} source={require('../../assets/Images/ic_qr.png')} />
                                                {/* </HStack> */}
                                            </View>
                                        </SafeAreaView>

                                    </View>
                                )
                            }
                        </View>
                    }
                </View>




            </View>

            <CustomCommonModal
                modalVisible={alertModal}
                modalClose={alertCloseHandle}
                ErrorText={alertTextContent}
                ButtonText={translate("ok")}
                ButtonFun={alertCloseHandle}

            />

            {loader && <PreLoginCustomLoader />}

        </>
    )

}

export default QRScanner;
const RnStyles = StyleSheet.create({
    booksSeedsMainContainer: {
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
        alignItems: "center"
    },
    backArrowImg: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    bookSeedsText: {
        fontSize: 18,
        fontWeight: "500",
        lineHeight: 20
    },
    timerImg: {
        height: 30,
        width: 30,
        resizeMode: "contain"
    },
    flowerImg: {
        position: "absolute",
        top: 30,
        right: 40,
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
    labelText: {
        color: "#5D5D5D",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 18
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
        lineHeight: 16,
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
        borderRadius: 10
    },
    bookNowButtonText: {
        fontWeight: "600",
        fontSize: 14,
        lineHeight: 20
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
        marginVertical: 10,
        color: "#000",
        fontWeight: "500",
        fontSize: 14
    },

    successMainContainerText: {
        marginBottom: 10,
        alignItems: "center"
    },

    successSubText: {
        color: "#7A7A7A",
        fontWeight: "500",
        fontSize: 13
    },

    mainContainer: {
        flex: 1,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)"
    },

    flowerImg: {
        position: "absolute",
        bottom: height * 0.001,
        right: width * 0.05,
        height: 50,
        width: 100,
        tintColor: "#000",
        resizeMode: "contain"
    },



})