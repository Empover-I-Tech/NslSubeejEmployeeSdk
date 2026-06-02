import { Platform, Text, StatusBar, View, Alert,Dimensions ,StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { LANGUAGECODE, LANGUAGEID, LANGUAGENAME, USER_ID,SHOWONBOARDSCREENS, STATE_NAME } from '../utils';

import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { getFromAsyncStorage, storeInAsyncStorage } from '../utils/keychainUtils';
import { RFValue } from 'react-native-responsive-fontsize';
import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers'
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import { CustomCommonModal } from '../components/CustomCommonModal';
import usePostRequestWithJwt from '../api/usePostRequestWithJwt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFontStyles } from '../hooks/useFontStyles';
import { SUBEEJ_SDK_APP_NAME } from '../assets/Utils/Utils';
const { width, height } = Dimensions.get('window');

const DipstickSurveyRn = ({ route }) => {
    const dynamicStyles = useSelector((state) => state.companyStyles.companyStyles);
    const fonts=useFontStyles()
    const isConnected = useSelector(state => state.network.isConnected);
    const { fetchData } = useGetRequestWithJwt();
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    let [openSurvey, setOpenSurvey] = useState(false)
    let [saveUserID, setUserID] = useState('');
    let [saveMobileNumber, setMobileNumber] = useState('');
    let [dipstickData, setDipstickData] = useState('')
    let [selectedSurvey, setSelectedSurvey] = useState(null)
    const { postData, error: apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();

    const [langId,setLangId]=useState(null)
    const navigation = useNavigation()
      const [alertModal, setAlertModal] = useState(false)
      const [alertTextContent, setAlertTextContent] = useState("")
    function hexToRgbA(hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
        }
        throw new Error('Bad Hex');
    }

    useEffect(() => {
        getDipstickData()
        const getLanId = async () => {
            const checkingLangId = await getFromAsyncStorage(LANGUAGEID);
            setLangId(checkingLangId)
        }
        getLanId()
    }, [])

    let getDipstickData = async () => {
        if (isConnected) {
            try {
                setLoading(true)
                var url = APIConfig.BASE_URL_NVM + APIConfig.nsl_dipstick_getAllSurveys_v1;
                var getHeaders = await GetApiHeaders()
                let stateName = await getFromAsyncStorage(STATE_NAME)
                var getUserID = getHeaders.userId
                var mobNumber = getHeaders.mobileNumber
                const payload={
                    "StateName":stateName,
                    "companyCode":dynamicStyles.companyCode
                }
                setUserID(getUserID)
                setMobileNumber(mobNumber)
                getHeaders.retailerId = getUserID;
                var APIResponse = await sendData(url, payload, getHeaders, false);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse?.data.response
                        setLoading(false)
                        if (masterResp != undefined && masterResp != null) {
                            if(masterResp?.surveyList!=undefined && masterResp?.surveyList?.length == 0){
                                SimpleToast.show(APIResponse.message!=null ? APIResponse.message : translate('No_data_available'))
                            }
                            let listOfSurveys = masterResp?.surveyList
                            setDipstickData(listOfSurveys)
                        }else{
                        SimpleToast.show(translate("No_data_available"))

                        }
                    }
                    else {
                        setAlertModal(true)
                        setLoading(false)
                        setAlertTextContent(APIResponse?.message)
                    }

                } else {
                    setLoading(false)
                    setLoadingMessage()
                    SimpleToast.show(translate("No_data_available"))
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
                SimpleToast.show(error.message)
            }
        } else {
            setLoading(false)
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    const alertCloseHandle=()=>{
        setAlertModal(false)    
    }

    return (
        <View style={{  backgroundColor: dynamicStyles.primaryColor ,flex:1}} edges={['top']}>
        <View style={styles.flexFull}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View
                style={[styles.header, { backgroundColor: dynamicStyles.primaryColor }]}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={require('../../src/assets/images/weatherScreen/newBackButton.png')} style={{
                        height: 20, width: 34, tintColor: dynamicStyles.secondaryColor, marginTop: 15, marginLeft: 10
                    }} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>
                    {translate("DipstickSurvey")}
                </Text>
            </View>
                    {(dipstickData !== null && dipstickData?.length > 0) && <FlatList
                style={{ marginBottom: 10 }}
                data={dipstickData}
                initialNumToRender={3}
                nestedScrollEnable={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
ListEmptyComponent={() => <Text style={{ color: "#000", fontFamily:fonts.Bold, fontSize: RFValue(17, height), alignSelf: "center", marginTop: 15 }}>{translate("No_data_available")}</Text>}                renderItem={({ item, index }) =>{
                    const disableButton=item?.buttonName === "Coming Soon"||item?.buttonName ==="Completed";
                    return(
                    <View key={`${item?.id}-${index}`} style={styles.dabba}>
                        <View style={styles.headerContainer}>
                            {langId==="1" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{item?.surveyName}</Text>}
                            {langId==="2" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{item?.SurveyNameTelugu}</Text>}
                            {langId==="3" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{item?.SurveyNameHindi}</Text>}
                            {langId==="4" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{item?.SurveyNameMarathi}</Text>}
                            {item?.count > 0 && <View style={styles.notificationCircle}>
                                <Text style={[styles.notificationText,{fontFamily:fonts.SemiBold}]}>{item?.count}</Text>
                            </View>}
                        </View>
                        {item?.availableDates&&
                        <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.subText,{fontFamily:fonts.Regular}]}>{item?.availableDates}</Text>
                        }
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: item?.imagePath }}
                                resizeMode='contain'
                                style={styles.image}
                            />
                            <TouchableOpacity disabled={disableButton} onPress={() => {
                                setOpenSurvey(true)
                                setSelectedSurvey(item)
                            }} activeOpacity={0.5} style={[styles.surveyButton, { backgroundColor:dynamicStyles.primaryColor,opacity:disableButton?0.5:1}]}>
                                <Text style={[styles.buttonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{item?.buttonText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}}
                keyExtractor={(item, index) => `${item?.id || index}`}
                contentContainerStyle={{ paddingBottom: 10 }}
            />}
            <Modal animationType='fade'
                transparent={true}
                visible={openSurvey}
                onRequestClose={() => setOpenSurvey(false)}>
                <View style={styleSheetStyles.centeredView}>
                    <View style={styleSheetStyles.modalView}>
                        <View style={[styles.headerContainer, { width: "100%" }]}>
                             {langId==="1" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{selectedSurvey?.surveyName}</Text>}
                            {langId==="2" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{selectedSurvey?.SurveyNameTelugu}</Text>}
                            {langId==="3" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{selectedSurvey?.SurveyNameHindi}</Text>}
                            {langId==="4" &&<Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,{fontFamily:fonts.SemiBold}]}>{selectedSurvey?.SurveyNameMarathi}</Text>}
    
                            <TouchableOpacity activeOpacity={0.5} onPress={() => {
                                setOpenSurvey(false)
                                setSelectedSurvey(null)
                            }}>
                                <Image resizeMode='contain' style={styles.image2} source={require("../../assets/Images/crossIcon.png")} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, width: "100%" }}>
                            <WebView
                                source={{ uri: `${selectedSurvey?.pageLink}?retailerId=${saveUserID}&mobileNumber=${saveMobileNumber}&buttonColor=${hexToRgbA(dynamicStyles.primaryColor)}&applicationName=${SUBEEJ_SDK_APP_NAME}&companyCode=${dynamicStyles.companyCode}&productName=${selectedSurvey?.productName}&surveyId=${selectedSurvey?.id}&languageId=${langId}` }}
                                style={{ width: '100%', height: '100%', flex: 1, alignItems: "center", justifyContent: "center" }}
                                javaScriptEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => <ActivityIndicator size="large" style={{ width: '100%', flex: 15, alignItems: "center", justifyContent: "center" }} color={dynamicStyles.primaryColor} />}
                                onError={(error) => console.log('WebView error: ', error)}
                                onNavigationStateChange={(event) => {
                                    console.log(dynamicStyles.primaryColor, "dynamicStyles.iconPrimaryColor")
                                    const queryString = event.url.split('?')[1];
                                    const params = queryString.split('&').reduce((acc, param) => {
                                        const [key, value] = param.split('=');
                                        acc[key] = value;
                                        return acc;
                                    }, {});
                                    const status = params.status;
                                    let mssgSuccess
                                    if(langId==="1"){
                                        mssgSuccess=selectedSurvey?.surveyName
                                    }else if(langId==="2"){
                                        mssgSuccess=selectedSurvey?.SurveyNameTelugu
                                    }else if(langId==="3"){
                                        mssgSuccess=selectedSurvey?.SurveyNameHindi
                                    }else if(langId==="4"){
                                        mssgSuccess=selectedSurvey?.SurveyNameMarathi
                                    }else{
                                        mssgSuccess=selectedSurvey?.surveyName
                                    }
                                     

                                    if (status === "success") {
                                        SimpleToast.show(`${mssgSuccess} ${translate("submitted_successfully")}`);
                                        setOpenSurvey(false);
                                        setSelectedSurvey(null);
                                        getDipstickData();
                                    } else if (status === "error") {
                                        SimpleToast.show(`${mssgSuccess} ${translate("submission_failed")}`);
                                        setOpenSurvey(false);
                                        setSelectedSurvey(null);
                                    }
                                }}

                            />
                        </View>
                    </View>
                </View>
            </Modal >

                  <CustomCommonModal
                    modalVisible={alertModal}
                    modalClose={alertCloseHandle}
                    ErrorText={alertTextContent}
                    ButtonText={translate("ok")}
                    ButtonFun={alertCloseHandle}
            
                  />
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerText2: { fontSize: 15, color: "rgba(0, 0, 0, 1)" ,lineHeight:30},
    notificationCircle: {
        backgroundColor: "rgba(219, 113, 14, 1)",
        height: 26,
        width: 26,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    notificationText: {
        fontSize: 10,
        color: "rgba(255, 255, 255, 1)",
    },
    subText: {
        fontSize: 10,
        color: "rgba(0, 0, 0, 1)",
        marginTop: 5,
        lineHeight:30
    },
    imageContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 25,
        marginBottom: 5,
    },
    image: {
        height: 50,
        width: 50,
    },
    image2: {
        height:width*0.05,
        width:width*0.05,
    },
    surveyButton: {
        width: "40%",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 1)",
    },
    viewShot: {
        width: '100%',
        height: '100%',
    },
    flexFull: { flex: 1,backgroundColor: '#f5f5f5'  },
    gray300bg: { backgroundColor: '#f5f5f5' },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
    headerText: { fontSize: 18,lineHeight:30 },
    dabba: {
        backgroundColor: "rgba(255, 255, 255, 1)",
        width: "90%",
        alignSelf: "center",
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2
    },
});

let styleSheetStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000000d6"
    },
    modalView: {
        flex: 0.8,
        width: responsiveWidth(90),
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default DipstickSurveyRn;