import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import APIConfig, { HTTP_OK, HTTP_SWITCHING_PROTOCOLS, setEnvironment } from "../../src/api/APIConfig";
import CustomLoader from "../../src/components/CustomLoader"
import { setCompanyStyle } from "../../src/state/actions/companyStyles";
import { COMPANYCODE, EMP_DASHBOARD_SCREEN, FIRSTNAME, LANGUAGECODE, LASTNAME, MOBILENUMBER, ROLDID, ROLENAME, SCREENNAME, SDK_AUTH_ID, SDK_AUTH_TOKEN, USER_ID, USER_IMG, USERNAME } from "../../src/utils";
import { downloadFileToLocal, GetApiHeaders } from "../../src/utils/helpers";
import { storeInAsyncStorage } from "../../src/utils/keychainUtils";
import { useNavigation } from '@react-navigation/native';
import { setIsEmployee } from "../../src/state/actions/employeeActions";
import { changeLanguage, translate } from '../Localization/Localisation';
import SimpleToast from 'react-native-simple-toast';
import { FCM_TOKEN } from '../assets/Utils/Utils';


const LoaderScreen = ({ route }) => {
    console.log("LoaderScreen route params:", route?.params);
    const mobileNumber = route?.params?.navigateItem?.mobileNumber
    const fcmToken = route?.params?.navigateItem?.fcmToken
    const buildEnvironment = route?.params?.navigateItem?.buildEnvironment
    const languageCode = route?.params?.navigateItem?.languageCode
    const authId = route?.params?.navigateItem?.authId
    const authToken = route?.params?.navigateItem?.authToken
    const onSDKClose = route?.params?.onSDKClose;
    console.log("jjjjjjjj", JSON.stringify(route?.params?.navigateItem?.mobileNumber))
    const navigation = useNavigation();

    const isConnected = useSelector((state) => state.network.isConnected);
    const selectedCompanyData = useSelector(state => state.selectedCompnayAct.selectedCompanyAct)
    console.log("selectedCompanyData", selectedCompanyData)
    const [loaderImage, setLoaderImage] = useState(require('../../assets/Images/SubeejLoader.gif'))
    const [loadingCount, setLoadingCount] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const dispatch = useDispatch()

    const startLoading = (msg = '') => {
        setLoadingMessage(msg);
        setLoadingCount(prev => prev + 1);
    };

    const stopLoading = () => {
        setLoadingCount(prev => Math.max(prev - 1, 0));
    };
    const loading = loadingCount > 0;

    useEffect(() => {
        initializeSDK();
    }, [route?.params]);

    const initializeSDK = async () => {
        try {
            if (!route?.params) return;

            console.log('Initializing SDK...');
            await changeLanguage(languageCode || 'en');

            setEnvironment(buildEnvironment || 'PROD');

            await storeAuthData();

            await handleVerifySDK();

        } catch (error) {
            console.log('initializeSDK error:', error);
        }
    };

    const storeAuthData = async () => {
        try {
            await storeInAsyncStorage(SDK_AUTH_TOKEN, authToken || '');
            await storeInAsyncStorage(SDK_AUTH_ID, authId || '');
            console.log("Auth data stored successfully:", { authId, authToken });
        } catch (error) {
            console.error("Error storing auth data:", error);
        }
    }


    const storeUserData = async (data) => {
        try {
            await storeInAsyncStorage(MOBILENUMBER, `${mobileNumber}`);
            await storeInAsyncStorage(FCM_TOKEN, `${fcmToken}`);
            await storeInAsyncStorage(LANGUAGECODE, `${languageCode}`);
            console.log("DATA_FROM_SERVER", data);

            if (data?.id) await storeInAsyncStorage(USER_ID, `${data.id}`);
            if (data?.firstName) {
                await storeInAsyncStorage(USERNAME, `${data.firstName} ${data.lastName}`);
                await storeInAsyncStorage(FIRSTNAME, `${data.firstName}`);
                await storeInAsyncStorage(LASTNAME, `${data.lastName}`);
            }
            if (data?.roleId) await storeInAsyncStorage(ROLDID, `${data.roleId}`)
            if (data?.roleName) await storeInAsyncStorage(ROLENAME, `${data.roleName}`)
            if (data?.screenName) await storeInAsyncStorage(SCREENNAME, `${data.screenName}`)
            if (data?.profilePic) await storeInAsyncStorage(USER_IMG, `${data?.profilePic}`);
            if (data?.companyCode !== undefined && data?.companyCode !== null && data?.companyCode !== "") {

                await storeInAsyncStorage(COMPANYCODE, `${data?.companyCode}`);
            } else {
                await storeInAsyncStorage(COMPANYCODE, `${""}`);
            }

            await storeInAsyncStorage('isLoggedIn', 'true');

            const isEmployee = (data?.screenName == EMP_DASHBOARD_SCREEN);
            dispatch(setIsEmployee(isEmployee));

            const routeConfig = isEmployee &&
            {
                name: 'BottomTabsNavigatorEmp',
                screen: 'HomeScreenEmpSDK',
            }
            navigation.replace(routeConfig.name, {
                screen: routeConfig.screen,
                params: { languageId: selectedCompanyData?.languageId || 0 },
            });
        } catch (error) {
            console.error("Failed to store user data in keychain:", error);
        } finally {
            stopLoading()
        }
    };


    const handleVerifySDK = async () => {

        const getURL = APIConfig.BASE_URL + APIConfig.AUTH.validateSDKLogin;
        console.log("getURL====", getURL)
        const getHeaders = await GetApiHeaders();
        getHeaders.authType = "JSONREQUEST";
        getHeaders["Content-Type"] = "application/json";
        const payload = {
            mobileNumber: mobileNumber,
        }
        if (isConnected) {
            startLoading(translate('loading'));
            try {
                const response = await fetch(getURL, {
                    method: "POST",
                    headers: getHeaders,
                    body: JSON.stringify(payload),
                });
                const jsonData = await response.json();
                console.log("Parsed response:", jsonData);
                if (jsonData.statusCode === HTTP_OK) {
                    const data = jsonData.response
                    const dynamicStyles = {};
                    console.log("datacheking=-=-=>", JSON.stringify(data))
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
                } else {
                    stopLoading()
                    Alert.alert(
                        "Alert",
                        jsonData.message || translate("Something_went_wrong"),
                        [
                            {
                                text: translate('ok'),
                                onPress: () => {
                                    if (onSDKClose) {
                                        onSDKClose();
                                    } else if (navigation.canGoBack()) {
                                        navigation.goBack();
                                    }
                                    else {
                                        navigation.goBack()
                                    }
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                }
            } catch (error) {
                console.error("Network or parsing error:", error);
            }
            finally {
                stopLoading()
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    return loading ? (
        <CustomLoader
            loading={loading}
            message={loadingMessage}
            loaderImage={loaderImage}
        />
    ) : null;


}

export default LoaderScreen