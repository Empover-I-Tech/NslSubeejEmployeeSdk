import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Platform,
    BackHandler,
    ImageBackground,
    StatusBar,
    Dimensions,
    Image,
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers';
import APIConfig, { HTTP_OK, HTTP_SWITCHING_PROTOCOLS } from '../api/APIConfig';
import { useDispatch, useSelector } from 'react-redux';
import { CustomCommonModal } from '../components/CustomCommonModal';
import { storeInAsyncStorage } from '../utils/keychainUtils';
import { ROLDID, USER_ID, USER_IMG, USERNAME, MOBILENUMBER, FIRSTNAME, LASTNAME, SCREENNAME, EMP_DASHBOARD_SCREEN } from '../utils';
import { setSelectedCompanyAct } from '../state/actions/selectedCompanyActions';
const { width, height } = Dimensions.get('window');

// Memoize the component to prevent unnecessary re-renders
const OtpNewScreen = memo(({ onBackPress, routes }) => {
    const route = useRoute();
    const dispatch = useDispatch();
    const navigation = useNavigation()

    console.log("tt=-=-=>", route)
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(120);
    const inputs = useRef([]);
    const [loader, setLoader] = useState(false)
    const [alertModal, setAlertModal] = useState(false)
    const [alertModalContent, setAlertModalContent] = useState("")


    const canResend = timeLeft <= 0;
    const isOtpComplete = otp.length === 6;
    const isConnected = useSelector((state) => state.network.isConnected);
    const selectedCompanyData = useSelector(state => state.selectedCompnayAct.selectedCompanyAct)

    console.log("ot==->", otp)

    const alertCloseHandle = () => {
        setAlertModal(false)
    }

    // Optimize back handler with useCallback to prevent re-creation
    const handleBackPress = useCallback(() => {
        if (otp.length === 0) {
            return onBackPress ? onBackPress() : false;
        }
        // Faster backspace: Update state and focus in one go
        setOtp((prev) => {
            const newOtp = prev.slice(0, -1);
            const focusIndex = Math.min(newOtp.length, 5);
            inputs.current[focusIndex]?.focus();
            return newOtp;
        });
        return true;
    }, [otp, onBackPress]);

    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => handler.remove();
    }, [handleBackPress]);

    // Fix timer: Use setInterval to decrement timeLeft once per second
    useEffect(() => {
        if (timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000); // Update every 1000ms (1 second)
        return () => clearInterval(intervalId); // Cleanup interval on unmount or timeLeft change
    }, [timeLeft]);

    // Optimize input handling with debounced state updates
    const handleChange = useCallback((text, index) => {
        if (/^[0-9]$/.test(text)) {
            setOtp((prev) => {
                const newOtp = prev.length === index ? prev + text :
                    prev.substring(0, index) + text + prev.substring(index + 1);
                if (text && index < 5) {
                    inputs.current[index + 1]?.focus();
                }
                return newOtp;
            });
        } else if (text === '') {
            setOtp((prev) => prev.substring(0, index) + prev.substring(index + 1));
        }
    }, []);

    const storeUserData = async (data) => {
        try {
            setIsStoringData(true);
            await storeInAsyncStorage(MOBILENUMBER, `${route.params.mobileNumber}`);
            console.log("DATA_FROM_SERVER", data);

            if (data?.id) await storeInAsyncStorage(USER_ID, `${data.id}`);
            // if (data?.firstName && data?.lastName) await storeInAsyncStorage(USERNAME, `${data.firstName} ${data.lastName}`);
            if (data?.firstName) {
                await storeInAsyncStorage(USERNAME, `${data.firstName} ${data.lastName}`);
                await storeInAsyncStorage(FIRSTNAME, `${data.firstName}`);
                await storeInAsyncStorage(LASTNAME, `${data.lastName}`);
            }

            if (data?.roleId) await storeInAsyncStorage(ROLDID, `${data.roleId}`)
            if (data?.roleName) await storeInAsyncStorage(ROLENAME, `${data.roleName}`)
            if (data?.screenName) await storeInAsyncStorage(SCREENNAME, `${data.screenName}`)
            // if (data?.languageId) await storeInAsyncStorage(LANGUAGEID, `${data.languageId}`)
            if (data?.profilePic) await storeInAsyncStorage(USER_IMG, `${data?.profilePic}`);


            await storeInAsyncStorage('isLoggedIn', 'true');  //added.....

            const isEmployee = (data?.screenName == EMP_DASHBOARD_SCREEN);
            const routeConfig = isEmployee
                ? {
                    name: 'BottomTabsNavigatorEmp',
                    screen: 'HomeScreenEmp',
                }
                : {
                    name: 'MainTabs',
                    screen: 'HomeScreenRn',
                };

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: routeConfig.name,
                            params: {
                                screen: routeConfig.screen,
                                params: { languageId: selectedCompanyData?.languageId || 0 },
                            },
                        },
                    ],
                })
            );
            setLoader(false);
        } catch (error) {
            console.error("Failed to store user data in keychain:", error);
        } finally {
            setIsStoringData(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const resendOTP = useCallback(() => {
        setOtp('');
        setTimeLeft(120);
        inputs.current[0]?.focus();
        console.log('OTP resent');
    }, []);

    const submitOTP = useCallback(() => {
        Keyboard.dismiss();
        console.log('OTP submitted:', otp);
    }, [otp]);

    const handleVerifyOtpCLick = async () => {

        if (otp.length == 6) {
            setLoader(true)
            // if (validate()) {
            // console.log("OTP_LENGTH", otp.length);
            const getURL = APIConfig.BASE_URL + APIConfig.AUTH.VALIDATEOTP;
            const getHeaders = await GetApiHeaders();
            getHeaders.authType = "JSONREQUEST";
            getHeaders["Content-Type"] = "application/json";
            const payload = {
                mobileNumber: "9334223882",
                otp: otp,
                optInForWhatsApp: route.params.optInForWhatsApp,
                termsAndConditionsAccepted: route.params.termsAndConditionsAccepted
            }
            if (isConnected) {
                try {
                    const response = await fetch(getURL, {
                        method: "POST",
                        headers: getHeaders,
                        body: JSON.stringify(payload),
                    });
                    const jsonData = await response.json();
                    console.log("otp response:=-=->", jsonData);
                    if (jsonData.statusCode === HTTP_SWITCHING_PROTOCOLS) {
                        setAlertModal(true)
                        setAlertModalContent(jsonData?.message)
                        setLoader(false)
                        // setOTPEnable(false);
                    } else if (jsonData.statusCode === HTTP_OK) {
                        const data = jsonData.response
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
                        dispatch(setCompanyStyle(dynamicStyles));
                        await storeUserData(data);
                    } else if (jsonData.statusCode === 500) {
                        setAlertModal(true)
                        setAlertModalContent(jsonData?.message)
                        // showAlertWithMessage(translate('alert'), true, true, jsonData?.message, true, false, translate('ok'), translate('cancel'));
                        setLoader(false)
                        // setVerifyDisable(true)
                        setOtp("")
                        console.log("VALIDATE_RESPONSE_500",);
                    } else if (jsonData.statusCode === 900) {
                        const data = jsonData.response
                        console.log("edit=-=-=->", data)
                        await storeInAsyncStorage(MOBILENUMBER, `${route.params.mobileNumber}`);
                        const selectedCompnayDetails = selectedCompanyData
                        selectedCompnayDetails.selectedCompanyDet = data
                        dispatch(setSelectedCompanyAct(selectedCompnayDetails));
                        navigation.navigate('RegistrationRn');
                        setLoader(false)
                        setOtp("")
                        // setVerifyDisable(true)
                        // setOTPEnable(false);
                        // setMobileNumber("")
                    } else {
                        setLoader(false);
                    }
                    // setLoader(false)
                    // setVerifyDisable(true)
                    // setIsOtpSent(true);
                    // console.log("otpResponse", jsonData.statusCode);
                    // if (jsonData.statusCode === SECOND_LOGIN) {
                    //   setLoader(false)
                    //   setVerifyDisable(true)
                    //   setAlertVisible(true);
                    //   showAlertWithMessage(translate('alert'), true, true, translate('already_logged_in'), true, true, translate('proceed'), translate('cancel'));
                    //   return;
                    // } else if (jsonData.statusCode === HTTP_OK) {
                    //   setLoader(false)
                    //   setVerifyDisable(true)
                    //   setTimer(120);
                    //   setOTPEnable(true);
                    //   setServerOTP(response?.otp?.otp);
                    //   setStartTimer(true);
                    //   // startSMSRead();
                    //   return;
                    // } else {
                    //   setLoader(false)
                    // }
                } catch (error) {
                    console.error("Network or parsing error:", error);
                }

            } else {
                SimpleToast.show(translate("no_internet_conneccted"))
            }
            // handleApiCall('VALIDATEOTP', payload);
            // }
            // else {
            //     setAlertVisible(true);
            //     setOTPEnable(false)
            //     showAlertWithMessage(translate('alert, true, true, translate('invalid_otp, true, true, translate('proceed, translate('cancel);
            //   }
        } else {
            setLoader(false)
        }

    }

    const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
    const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0;

    return (
        <ImageBackground source={require("../../assets/Images/backgroundImg.png")} style={{
            width: '100%',
            minHeight: '100%',
            paddingTop: statusBarHeight,
            // paddingTop:height*0.05
        }}
            resizeMode="cover">
            {Platform.OS === 'android' && (<StatusBar backgroundColor={"#845EF1"} barStyle={"dark-content"} />)}

            {/* <View style={styles.container}>
              <Text style={styles.title}>Enter Verification Code</Text>

              <View style={styles.otpContainer}>
                  {[...Array(6)].map((_, index) => (
                      <OtpInput
                          key={index}
                          index={index}
                          value={otp[index] || ''}
                          onChangeText={handleChange}
                          isActive={index === otp.length}
                          isFilled={index < otp.length}
                          inputs={inputs}
                      />
                  ))}
              </View>

              <View style={styles.footer}>
                  {!canResend ? (
                      <Text style={styles.timerText}>Resend in {formattedTime}</Text>
                  ) : (
                      <TouchableOpacity onPress={resendOTP}>
                          <Text style={styles.resendText}>Resend Code</Text>
                      </TouchableOpacity>
                  )}

                  <TouchableOpacity
                      style={[styles.submitButton, !isOtpComplete && styles.disabled]}
                      onPress={submitOTP}
                      disabled={!isOtpComplete}
                  >
                      <Text style={styles.buttonText}>Verify</Text>
                  </TouchableOpacity>
              </View>
          </View> */}
            <View style={{ marginTop: height * 0.1, paddingHorizontal: 15 }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20
                }}>
                    <Text style={{
                        fontSize: RFValue(18, height),
                        fontWeight: "bold",
                        color: "#000",
                        lineHeight: 30
                    }}>
                        {translate('verify_otp')}
                    </Text>
                    {/* <HStack> */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        {/* <REDTIME style={[]} /> */}
                        <Image style={{
                            height: width * 0.05,
                            width: width * 0.04,
                            resizeMode: "contain"
                        }} source={require("../../assets/Images/timeIcon.png")} />
                        <Text style={{
                            marginLeft: 5,
                            fontSize: RFValue(14, height),
                            fontWeight: "bold",
                            color: "#000"
                        }}>{formattedTime}</Text>
                    </View>
                    {/* </HStack> */}
                </View>
                {/* <CustomOtpPinView
                    pinLength={6}
                    onOtpComplete={(code) => {
                        onCodeChanged(code)
                    }}
                    defaultValue={otp}
                /> */}
                <View style={styles.otpContainer}>
                    {[...Array(6)].map((_, index) => (
                        <OtpInput
                            key={index}
                            index={index}
                            value={otp[index] || ''}
                            onChangeText={handleChange}
                            isActive={index === otp.length}
                            isFilled={index < otp.length}
                            inputs={inputs}
                        />
                    ))}
                </View>

                {/* <HStack space={1} alignItems="center" justifyContent="center" mt={2}> */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center"
                }}>
                    <Text style={{
                        fontSize: RFValue(14, height),
                        fontWeight: "400",
                        marginRight: 5,
                        color: "#000"
                    }}>
                        {translate('not_received_code')}
                        {/* Not received your code? */}
                    </Text>
                    <Text
                        style={[{
                            fontWeight: "700",
                            fontSize: RFValue(14, height),
                            textDecorationLine: "underline", color: timeLeft > 0 ? '#FBCEB1' : 'red',
                        }]}
                        onPress={resendOTP}
                        disabled={timeLeft > 0}
                    // backgroundColor={timer > 0 ? '#D3D3D3' : '#845EF1'}

                    >
                        {translate('resend_code')}
                    </Text>
                </View>

                {/* </HStack> */}

                <TouchableOpacity
                    style={[{
                        borderRadius: 8,
                        alignSelf: "center",
                        width: "100%",
                        // height:height*0.05,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 20,
                        height: height * 0.06,
                    },
                    {
                        backgroundColor: otp && otp.length === 6 ? "#845EF1" : "#D1C4E9",
                    },
                    ]}
                    //  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    onPress={handleVerifyOtpCLick}
                    disabled={!(otp && otp.length === 6)}
                // accessibilityLabel={translate('verify')}
                >
                    <Text
                        style={{ color: "#fff", fontSize: RFValue(15, height) }}
                    >
                        {translate('verify')}
                    </Text>
                </TouchableOpacity>
            </View>

            <CustomCommonModal
                modalVisible={alertModal}
                modalClose={alertCloseHandle}
                ErrorText={alertModalContent}
                ButtonText={translate("ok")}
                ButtonFun={alertCloseHandle}

            />
            {/* {loader && <CustomLoader loading={loader} message={loadingMessage} loaderImage={loaderImage} progress={progress} />} */}
            {loader && <View style={{ position: "absolute", alignSelf: "center", flex: 1, justifyContent: "center", top: height * 0.5 }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>}
        </ImageBackground>
    );
});

// Separate OTP input component for better performance
const OtpInput = memo(({ index, value, onChangeText, isActive, isFilled, inputs }) => {
    const inputRef = useRef(null);

    // Register input ref
    useEffect(() => {
        inputs.current[index] = inputRef.current;
    }, [index, inputs]);

    return (
        <TextInput
            ref={inputRef}
            style={[
                styles.otpInput,
                isActive && styles.otpInputActive,
                isFilled && styles.otpInputFilled,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={value}
            onChangeText={(text) => onChangeText(text, index)}
            onKeyPress={({ nativeEvent: { key } }) => {
                if (key === 'Backspace' && !value && index > 0) {
                    inputs.current[index - 1]?.focus();
                }
            }}
            selectTextOnFocus
            autoFocus={index === 0}
            underlineColorAndroid="transparent"
            // Optimize Android performance
            textContentType="none"
            autoComplete="off"
        />
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#845EF1',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    otpInput: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        alignItems: "center",
        color: '#000',
        backgroundColor: '#FAFAFA',
        marginRight: 6,
        // Optimize rendering on Android
        ...Platform.select({
            android: {
                textAlignVertical: 'center',
                elevation: 0, // Remove elevation for faster rendering
            },
        }),
    },
    otpInputActive: {
        borderColor: '#845EF1',
        backgroundColor: '#F3F0FF',
    },
    otpInputFilled: {
        borderColor: '#845EF1',
        backgroundColor: '#F3F0FF',
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    timerText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    resendText: {
        fontSize: 16,
        color: '#845EF1',
        fontWeight: '600',
        marginBottom: 16,
    },
    submitButton: {
        width: '100%',
        padding: 16,
        backgroundColor: '#845EF1',
        borderRadius: 8,
        alignItems: 'center',
        // Simplify shadow for performance
        ...Platform.select({
            ios: {
                shadowColor: '#845EF1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    disabled: {
        backgroundColor: '#D3D3D3',
        // Simplify shadow for disabled state
        ...Platform.select({
            ios: {
                shadowColor: '#000',
            },
            android: {
                elevation: 1,
            },
        }),
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default OtpNewScreen;