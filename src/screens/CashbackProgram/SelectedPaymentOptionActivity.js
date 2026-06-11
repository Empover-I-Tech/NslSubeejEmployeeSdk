//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, Platform, StatusBar, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SimpleToast from 'react-native-simple-toast'
import CustomEditText from './CustomEditText';
import { allowOnlyAlphabets, allowOnlyAlphabetsNumbers, allowOnlyNumbers, AMAZON_PAY_GIFT_CARD, BANK_DETAILS_M, BANK_TRANSFER_M, DOWNLOAD_FOLDER_PATH, isNullOrEmpty, PAYTM_M, UPI_M } from '../../assets/Utils/Utils';
import CustomButton from '../../components/CustomButton';
import { Colors } from '../../styles/colors';
import { translate } from '../../Localization/Localisation';
import { useDispatch, useSelector } from 'react-redux';
import APIConfig, { HTTP_601, HTTP_OK } from '../../api/APIConfig';
import CashbackLoader from './CashbackLoader';
import { GetApiHeaders } from '../../utils/helpers';
import { POST } from './CashbackApiComponent';

// forcelogout
import axios from 'axios';
import { deleteFromAsyncStorage } from "../../utils/keychainUtils";
import { setCompanyStyle } from '../../state/actions/companyStyles';
import realm from '../realmOffline/realmConfig';
import RNFS from 'react-native-fs';
import { MOBILENUMBER, REFERRALCODE, USER_ID, USERNAME, USER_IMG, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, LANGUAGEID, OFFLINETOTALCOUNT, FIRSTNAME, LASTNAME, COMPANYCODE } from '../../utils';


const SelectedPaymentOptionActivity = ({ route }) => {

    console.log("route?.params", route?.params)
    const selectedItemObject = route?.params?.selectedPaymentModeItem || {}
    console.log("selectedPaymentModeItem====>", selectedItemObject)
    const navigateToPayment = route?.params?.navigateToPaymentOptions || null
    console.log("navigateToPaymentOptions====>", navigateToPayment)
    const isConnected = useSelector(state => state.network.isConnected);

    const navigation = useNavigation();

    const [totalValue, setTotalValue] = useState('')
    const [claimRupeeTotal, setClaimRupeeTotal] = useState('')
    const [comingFrom, setComingFrom] = useState('')
    const [dynamicStyles, setDynamicStyles] = useState({})
    const [selectedItems, setSelectedItems] = useState({});
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
    const [ifscCode, setIfscCode] = useState('')
    const [upiVpa, setupiVpa] = useState(null)
    const [mobileNumber, setMobileNumber] = useState('')
    const [btnDisable, setBtnDisable] = useState(true)
    const [claimTransactionIds, setClaimTransactionIds] = useState(null)
    const locationCheck = useSelector(state => state.selectLocationReducer?.locationStyles)
    const [loader, setLoader] = useState(false)

        // forcelogout
    const cachedImages = realm.objects('Image');
    const Meeting = realm.objects('Meeting');
    const FABDetails = realm.objects('FABDetails')
    const helpDeskRaise = realm.objects('helpDeskRaise')
    const YieldMaster = realm.objects('YieldMaster');
    const SeedMaster = realm.objects('SeedMaster');
    const FertilizerMaster = realm.objects('FertilizerMaster');
    const FertilizerMaster2 = realm.objects('FertilizerMaster2')
    const SeedCalSubmit = realm.objects('SeedCalSubmit')
    const YieldCalSubmit = realm.objects('YieldCalSubmit')
    const cachedHybridList = realm.objects('hybridMaster');
    const cachedKnowledgeCenter = realm.objects('KnowledgeCenter');
    const GeoTaggingView = realm.objects('GeoTaggingView');
    const cachedGeoTaggingHistory = realm.objects('GEOTAGGINGHISTORY');
    const cachedSamadhanHistory = realm.objects('SAMADHANHISTORY');
    const cachedGoldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')
    const goldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')
    const dispatch = useDispatch()

    useEffect(() => {
        setSelectedItems(selectedItemObject)
        setDynamicStyles(navigateToPayment?.dynamicStyles || {})
        setTotalValue(navigateToPayment?.totalAmount || '')
        setClaimRupeeTotal(navigateToPayment?.claimRupeeTotal || '')
        setComingFrom(navigateToPayment?.fromBtn || '')
        setClaimTransactionIds(navigateToPayment?.selectedItem || null)


    }, [selectedItemObject, navigateToPayment])

    useEffect(() => {
        console.log('totalValue', totalValue)
        console.log('claimRupeeTotal', claimRupeeTotal)
        console.log("selectedItems", selectedItems)
        console.log("comingFrom====>", comingFrom)
        console.log("selectedItemObject`", selectedItemObject)
        console.log("claimTransactionIds", claimTransactionIds)
    }, [comingFrom, claimTransactionIds])

    const removeDatbaseData = async () => {
        try {
            if (realm && !realm.isClosed) {
                realm.write(() => {
                    realm.delete(cachedImages);
                    realm.delete(Meeting);
                    realm.delete(FABDetails);
                    realm.delete(helpDeskRaise);
                    realm.delete(YieldMaster);
                    realm.delete(SeedMaster);
                    realm.delete(FertilizerMaster);
                    realm.delete(FertilizerMaster2);
                    realm.delete(SeedCalSubmit);
                    realm.delete(YieldCalSubmit);
                    realm.delete(cachedHybridList);
                    realm.delete(cachedKnowledgeCenter);
                    realm.delete(GeoTaggingView);
                    realm.delete(cachedGeoTaggingHistory);
                    realm.delete(cachedSamadhanHistory);
                    realm.delete(goldClubKnowledgeCenter)
                    realm.delete(cachedGoldClubKnowledgeCenter)
                });
                console.log("Successfully deleted all Realm data");
            }
        } catch (realmError) {
            console.error('Error deleting objects from Realm:', realmError);
        }
    };

    const clearDownloadedImages = async () => {
        try {
            const exists = await RNFS.exists(DOWNLOAD_FOLDER_PATH);
            if (exists) {
                await RNFS.unlink(DOWNLOAD_FOLDER_PATH);
                console.log('Download folder deleted');
            }
        } catch (error) {
            console.error('Error deleting download folder:', error);
        }
    };

    const logoutMethod = async () => {
        if (!isConnected) {
            return;
        }

        try {
            const ForcedLougoutUrl = APIConfig.BASE_URL + APIConfig.AUTH.LOGOUT
            const headers = await GetApiHeaders();
            const apiCallLogout = await axios.get(ForcedLougoutUrl, { headers });
            // Full response
            console.log("Full Response:", apiCallLogout);
            // Access response data
            console.log("Response Data:", apiCallLogout.data);

            // Example: access specific field

            if (apiCallLogout.data.statusCode === HTTP_OK) {
                console.log("Message:", apiCallLogout.data.statusCode);

                await Promise.all([
                    deleteFromAsyncStorage(USER_ID),
                    deleteFromAsyncStorage(MOBILENUMBER),
                    deleteFromAsyncStorage(USERNAME),
                    deleteFromAsyncStorage(REFERRALCODE),
                    deleteFromAsyncStorage(USER_IMG),
                    deleteFromAsyncStorage(STATE_ID),
                    deleteFromAsyncStorage(STATE_NAME),
                    deleteFromAsyncStorage(DISTRICT_ID),
                    deleteFromAsyncStorage(DISTRICT_NAME),
                    deleteFromAsyncStorage(FIRSTNAME),
                    deleteFromAsyncStorage(LASTNAME),
                    deleteFromAsyncStorage(OFFLINETOTALCOUNT),
                    deleteFromAsyncStorage(COMPANYCODE),
                    removeDatbaseData(),
                    clearDownloadedImages()
                ]);
                dispatch(setCompanyStyle({}));
                navigation.replace('LoginScreenRn');
            } else {
                SimpleToast.show(apiCallLogout.data.message)
            }

        } catch (error) {

            console.log("Logout error:", error.response?.data || error.message);
        }
    };

    const handleForceLogout = async () => {
        try {
            logoutMethod()
        } catch (error) {
            console.error('Error during logout:', error);
            SimpleToast.show(translate('logout_error') || 'Failed to log out');
        }
    }


    const onConfirmClick = async () => {

        if (!isConnected) {
            setLoader(false)
            SimpleToast.show(translate('no_internet_conneccted'));
            return;
        }
        if (selectedItems.selectedClickItem == BANK_TRANSFER_M) {
            if (!isNullOrEmpty(accountName)) {
                SimpleToast.show(translate('acout_name_error'));
                return false;
            }
            else if (!isNullOrEmpty(accountNumber)) {
                SimpleToast.show(translate('account_number_error'));
                return false;
            }
            else if (!!isNullOrEmpty(accountNumber) && accountNumber.length < 6) {
                SimpleToast.show(translate('account_number_valid_error'));
                return false;
            }
            else if (!isNullOrEmpty(confirmAccountNumber)) {
                SimpleToast.show(translate('account_confirm_number_error'));
                return false;
            }
            else if (accountNumber !== confirmAccountNumber) {
                SimpleToast.show(translate('account_number_match_error'));
                return false;
            }
            else if (!isNullOrEmpty(ifscCode)) {
                SimpleToast.show(translate('ifsc_code_error'));
                return false;
            }
            else if (ifscCode.length < 11) {
                SimpleToast.show(translate('ifsc_code_valid_error'));
                return false;
            }
            // else if (ifscCode.length == 11) {
            //     const pattern = /^[A-Z]{4}[0-9]{7}$/;
            //     if (!pattern.test(ifscCode.toString().trim())) {
            //         SimpleToast.show(translate('ifsc_code_valid_error'));
            //         return false;
            //     }
            // }
        }
        else if (selectedItems.selectedClickItem == UPI_M) {

            if (!isNullOrEmpty(upiVpa)) {
                SimpleToast.show(translate('upi_error'));
                return false;
            }
        }
        else if ((selectedItems.selectedClickItem == PAYTM_M) ||
            (selectedItems.selectedClickItem == AMAZON_PAY_GIFT_CARD)) {
            if (!isNullOrEmpty(mobileNumber)) {
                SimpleToast.show(translate('enter_mobile_number_error'));
                return false;
            }
            else if (!isNullOrEmpty(mobileNumber) && mobileNumber.length < 10) {
                SimpleToast.show(translate('enter_mobile_number_error'));
                return false;
            }
        }
        setBtnDisable(false);
        setLoader(true)

        // call Api here

        var url = APIConfig.BASE_URL + APIConfig.CBINSTANTPAYMENTMODEREQUEST
        const headers = await GetApiHeaders()
        var body =
        {
            mobileNumber: headers?.mobileNumber, // login mobile number
            paymentMode: (selectedItems.selectedClickItem == BANK_TRANSFER_M) ? BANK_DETAILS_M.replace(" ", "") : selectedItems.selectedClickItem,
            cashRewards: totalValue,
            instantPayTransactionId: (comingFrom == translate('claim')) ? 0 : claimTransactionIds?.instantPayTransactionId,
            locationCoordinates: locationCheck
        }

        if ((comingFrom == translate('claim')) && claimTransactionIds.length > 0) {
            const claimIds = [];
            for (var i = 0; i < claimTransactionIds.length; i++) {
                const toBeClaimList = claimTransactionIds[i];

                const singleItem = {
                    serverRecordId: toBeClaimList.serverRecordId,
                };

                claimIds.push(singleItem);
            }
            body = {
                ...body,
                claimIDs: claimIds
            }
        }
        if ((selectedItems.selectedClickItem == BANK_TRANSFER_M) || (selectedItems.selectedClickItem.toLowerCase().replace(/\s/g, '') == BANK_DETAILS_M.toLowerCase().replace(/\s/g, ''))) {
            body = {
                ...body,
                accountName: accountName,
                accountNumber: accountNumber,
                ifscCode: ifscCode,
                upiVpa: ""
            }
        }
        if (selectedItems.selectedClickItem == UPI_M) {
            body = {
                ...body,
                upiVpa: upiVpa,
                accountNumber: "",
                ifscCode: "",
                accountName: ""
            }
        }
        if ((selectedItems.selectedClickItem == PAYTM_M) ||
            (selectedItems.selectedClickItem.toLowerCase().replace(/\s/g, '') == AMAZON_PAY_GIFT_CARD.toLowerCase().replace(/\s/g, ''))) {
            body = {
                ...body,
                accountName: mobileNumber,
            }
        }


        console.log("===========================================")
        console.log("URL=-=-=->", url)
        console.log("HEADERS=-=--=>", headers)
        console.log("comingFrom", comingFrom)
        console.log("claimTransactionIds?.cashFreeTransactionId", claimTransactionIds)
        console.log("body======>", JSON.stringify(body))
        console.log("===========================================")
        try {

            const data = await POST({
                url: url,
                body: body,
                headers: headers
            });

            console.log('POST DATA:', data);
            if (data?.statusCode == HTTP_OK) {
                console.log("REPONSE=-=-=-=->", data)
                setLoader(false)
                navigation.navigate('CompletedPaymentActivity', { decodeddJson: data?.response, navigateToPaymentOptions: navigateToPayment })
            } else if(data?.statusCode === HTTP_601){
                handleForceLogout()
            }
            else {
                // show Alert for 
                SimpleToast.show(data?.message ? data?.message : translate("Something_went_wrong"))
                setLoader(false)
                setBtnDisable(true)
            }

        } catch (error) {
            SimpleToast.show(translate("Unable_to_process_your_request_moment_Please_again_later"))
            setLoader(false)
            setBtnDisable(true)
            console.log('Error Message:', error.message);
        } finally {
            setLoader(false)
        }
    }


    return (
        <View style={[{ width: '100%', height: '100%', backgroundColor: Colors.white }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}


            {/* Header tool bar Section */}
            <View style={[{ flexDirection: 'row', width: '100%', height: 60, backgroundColor: dynamicStyles.primaryColor, alignItems: 'center', paddingLeft: 15 }]}>
                <TouchableOpacity
                    style={[{ flexDirection: 'row', alignItems: 'center', width: '82%' }]}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <Image style={[{ width: 20, height: 20, marginTop: 3, tintColor: Colors.white }]} source={require('../CashbackProgram/assets/previous.png')} />
                    <Text style={[{ fontSize: 21, color: Colors.white, paddingLeft: 5 }]}>{translate('transfer')}</Text>
                </TouchableOpacity>
                <View style={{ borderWidth: 0.5, borderColor: Colors.white, right:10 }}>
                    <Text
                        style={[{ fontSize: 16, color: Colors.white, padding: 5,  }]}>{claimRupeeTotal}</Text>
                </View>
            </View>



            {/* Reward Strip Section */}
            <View style={[{ flex: 1 }]}>
                <View
                    style={[{ width: '85%', alignSelf: 'center', marginTop: 20, marginBottom: 20, flexGrow: 1 }]}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                        <Image style={[{ width: 20, height: 20, marginTop: 3, tintColor: "#676767" }]} source={require('../CashbackProgram/assets/lfet_arrow_ic.png')} />
                        <Text style={[{ color: "#676767", fontSize: 17, marginLeft: 5 }]}>{selectedItems.selectedTitle}</Text>
                    </TouchableOpacity>

                    <View style={[{ width: '100%', borderWidth: 0.75, marginTop: 2, borderColor: Colors.light_orange }]} />


                    <View style={[{ marginTop: 50 }]}>
                        {(selectedItems.selectedClickItem === BANK_TRANSFER_M) &&
                            <View>
                                <CustomEditText
                                    placeholder={translate('account_name')}
                                    value={accountName}
                                    onChangeText={(text) => {
                                        setAccountName(allowOnlyAlphabets(text))
                                    }}
                                    borderColored={Colors.white}
                                    placeholderTextColor={"#676767"}
                                    width="95%"
                                    viewHeight={45}
                                    editable={true}
                                    maxLength={100}
                                    keyboardType={"default"}
                                />

                                <CustomEditText
                                    placeholder={translate('account_number')}
                                    value={accountNumber}
                                    onChangeText={(text) => {
                                        setAccountNumber(allowOnlyNumbers(text))
                                    }}
                                    borderColored={Colors.white}
                                    placeholderTextColor={"#676767"}
                                    width="95%"
                                    viewHeight={45}
                                    editable={true}
                                    maxLength={40}
                                    keyboardType={"number-pad"}
                                />

                                <CustomEditText
                                    placeholder={translate('account_number_confirm')}
                                    value={confirmAccountNumber}
                                    onChangeText={(text) => {
                                        setConfirmAccountNumber(allowOnlyNumbers(text))
                                    }}
                                    borderColored={Colors.white}
                                    placeholderTextColor={"#676767"}
                                    width="95%"
                                    viewHeight={45}
                                    editable={true}
                                    maxLength={40}
                                    keyboardType={"number-pad"}
                                />

                                <CustomEditText
                                    placeholder={translate('ifsc_code')}
                                    value={ifscCode}
                                    onChangeText={(text) => {
                                        setIfscCode(allowOnlyAlphabetsNumbers(text.toUpperCase()))
                                    }}
                                    borderColored={Colors.white}
                                    placeholderTextColor={"#676767"}
                                    width="95%"
                                    viewHeight={45}
                                    editable={true}
                                    maxLength={11}
                                    autoCapitalize={'characters'}
                                    keyboardType={'default'}
                                />
                            </View>
                        }

                        {(selectedItems.selectedClickItem == UPI_M) &&
                            <View>
                                <CustomEditText
                                    placeholder={translate('upi_vpa')}
                                    value={upiVpa}
                                    onChangeText={(text) => {
                                        setupiVpa(text.trim())
                                    }}
                                    borderColored={Colors.white}
                                    placeholderTextColor={"#676767"}
                                    width="95%"
                                    viewHeight={45}
                                    editable={true}
                                    maxLength={100}
                                    keyboardType={"default"}
                                    autoCapitalize={'none'}
                                />
                            </View>}

                        {((selectedItems.selectedClickItem == PAYTM_M) || (selectedItems.selectedClickItem == AMAZON_PAY_GIFT_CARD)) &&
                            <View>
                                <CustomEditText
                                    placeholder={translate('phone_number')}
                                    value={mobileNumber}
                                    onChangeText={(text) => {
                                        setMobileNumber(allowOnlyNumbers(text))
                                    }}
                                    borderColored={Colors.white}
                                    placeholderTextColor={"#676767"}
                                    width="95%"
                                    viewHeight={45}
                                    editable={true}
                                    maxLength={10}
                                    keyboardType={"number-pad"}
                                />
                            </View>}
                    </View>
                </View>

                <View style={{ marginBottom: 80 }}>
                    <CustomButton
                        title={translate('confirm').toUpperCase()}
                        buttonBg={dynamicStyles?.primaryColor}
                        btnWidth={'90%'}
                        titleTextColor={dynamicStyles?.secondaryColor}
                        onPress={() => (btnDisable && onConfirmClick())}
                    />
                </View>
            </View>
            {loader && <>
                {dynamicStyles?.loaderPath != undefined && dynamicStyles?.loaderPath != "" &&
                    <CashbackLoader loaderPath={dynamicStyles.loaderPath} message={""} />
                }
            </>}
        </View>
    );
}



export default SelectedPaymentOptionActivity;
