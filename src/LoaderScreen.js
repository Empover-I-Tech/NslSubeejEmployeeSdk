import { useEffect, useState } from 'react';
import { View, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import APIConfig, { HTTP_OK, HTTP_SWITCHING_PROTOCOLS } from "../src/api/APIConfig";
import CustomLoader from "../src/components/CustomLoader"
import { setCompanyStyle } from "../src/state/actions/companyStyles";
import { COMPANYCODE, EMP_DASHBOARD_SCREEN, FIRSTNAME, LASTNAME, MOBILENUMBER, ROLDID, ROLENAME, SCREENNAME, USER_ID, USER_IMG, USERNAME } from "../src/utils";
import { downloadFileToLocal, GetApiHeaders } from "../src/utils/helpers";
import { storeInAsyncStorage } from "../src/utils/keychainUtils";
import { CommonActions , useNavigation} from '@react-navigation/native';
import { setIsEmployee } from "../src/state/actions/employeeActions";


const LoaderScreen = ({ route }) => {
    console.log("LoaderScreen route params:", route?.params);
    const jsonData = route?.params?.navigateItem?.mobileNumber
    console.log("jjjjjjjj", JSON.stringify(route?.params?.navigateItem?.mobileNumber))
    const navigation = useNavigation();

    const isConnected = useSelector((state) => state.network.isConnected);
    const selectedCompanyData = useSelector(state => state.selectedCompnayAct.selectedCompanyAct)
    const [loaderImage, setLoaderImage] = useState(require('../assets/Images/SubeejLoader.gif'))
    const [loader, setLoader] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const dispatch = useDispatch()


    useEffect(() => {
        if (jsonData != null) {
            handleVerifySDK()
        }
    }, [jsonData])


    const storeUserData = async (data) => {
        try {
            await storeInAsyncStorage(MOBILENUMBER, `${jsonData}`);
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
        } catch (error) {
            console.error("Failed to store user data in keychain:", error);
        } finally {
            setLoader(false);
            setLoadingMessage('')
        }
    };


    const handleVerifySDK = async () => {

        setLoader(true)
        setLoadingMessage('Loading....')
        const getURL = APIConfig.BASE_URL + APIConfig.AUTH.validateSDKLogin;
        const getHeaders = await GetApiHeaders();
        getHeaders.authType = "JSONREQUEST";
        getHeaders["Content-Type"] = "application/json";
        const payload = {
            mobileNumber: jsonData,
        }
        if (isConnected) {
            try {
                const response = await fetch(getURL, {
                    method: "POST",
                    headers: getHeaders,
                    body: JSON.stringify(payload),
                });
                const jsonData = await response.json();
                console.log("Parsed response:", jsonData);
                if (jsonData.statusCode === HTTP_SWITCHING_PROTOCOLS) {
                    setLoader(false)
                } else if (jsonData.statusCode === HTTP_OK) {
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
                } else if (jsonData.statusCode === 500) {

                } else if (jsonData.statusCode === 900) {

                } else {
                    setLoader(false);
                    setLoadingMessage('')
                }
            } catch (error) {
                console.error("Network or parsing error:", error);
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{route?.params?.navigateItem?.mobileNumber || "Hello World"}</Text>
            {loader && <CustomLoader loading={loader} message={loadingMessage} loaderImage={loaderImage} />}
        </View>
    )


}

export default LoaderScreen