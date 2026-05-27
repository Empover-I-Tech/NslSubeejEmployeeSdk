//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { translate } from '../../Localization/Localisation';
import CustomLabelValue from './CustomLabelValue';
import { CASH_FREE_TRANSACTION_LIST, DOWNLOAD_FOLDER_PATH, FAILED_st, isDigitOnly, isEmptyValueObject, isNullOrEmptyNOTTrim, PENDING_st, strYMMDhmsSToDMMMYhms, SUCCESS_st } from '../../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import APIConfig, { HTTP_601, HTTP_OK } from '../../api/APIConfig';
import { GetApiHeaders } from '../../utils/helpers';
import { GET, POST } from './CashbackApiComponent';
import SimpleToast from 'react-native-simple-toast';

// forcelogout
import axios from 'axios';
import { deleteFromAsyncStorage } from "../../utils/keychainUtils";
import { setCompanyStyle } from '../../state/actions/companyStyles';
import { useRealm, useQuery } from '@realm/react';
import RNFS from 'react-native-fs';
import { MOBILENUMBER, REFERRALCODE, USER_ID, USERNAME, USER_IMG, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, LANGUAGEID, OFFLINETOTALCOUNT, FIRSTNAME, LASTNAME, COMPANYCODE } from '../../utils';

const CashFreeTransactions = (props) => {

    console.log("transactionList===>", JSON.stringify(props))
    const [dynamicStyles, setDynamicStyles] = useState(props?.dynamicStyles || {});
    const [comingFromTransaction, setComingFromTransaction] = useState(props?.comingFromTransaction || '');
    const [transactionList, setTransactionList] = useState(props?.transactionList || {});
    const isConnected = useSelector(state => state.network.isConnected);
    const navigation = useNavigation();
    const [programTitle, setProgramTitle] = useState('');
    const [totalClaimAmount, setTotalClaimAmount] = useState('');
    const [claimRupeeTotal, setClaimRupeeTotal] = useState('');
    const [isNoDataAvailable, setIsNoDataAvailable] = useState(true);
    const [claimBtnVisible, setClaimBtnVisible] = useState(false)

    // forcelogout
    const realm = useRealm();
    const cachedImages = useQuery('Image');
    const Meeting = useQuery('Meeting');
    const FABDetails = useQuery('FABDetails')
    const helpDeskRaise = useQuery('helpDeskRaise')
    const YieldMaster = useQuery('YieldMaster');
    const SeedMaster = useQuery('SeedMaster');
    const FertilizerMaster = useQuery('FertilizerMaster');
    const FertilizerMaster2 = useQuery('FertilizerMaster2')
    const SeedCalSubmit = useQuery('SeedCalSubmit')
    const YieldCalSubmit = useQuery('YieldCalSubmit')
    const cachedHybridList = useQuery('hybridMaster');
    const cachedKnowledgeCenter = useQuery('KnowledgeCenter');
    const GeoTaggingView = useQuery('GeoTaggingView');
    const cachedGeoTaggingHistory = useQuery('GEOTAGGINGHISTORY');
    const cachedSamadhanHistory = useQuery('SAMADHANHISTORY');
    const cachedGoldClubKnowledgeCenter = useQuery('GoldCludKnowledgeCenter')
    const goldClubKnowledgeCenter = useQuery('GoldCludKnowledgeCenter')
    const dispatch = useDispatch()


    // Define images inside the component
    const images = {
        dropdown_down: require('../CashbackProgram/assets/dropdown_down.png'),
        dropdown_up: require('../CashbackProgram/assets/dropdown_up.png'),
        arow_down_white: require('../CashbackProgram/assets/arow_down_white.png'),
        arow_up_white: require('../CashbackProgram/assets/arow_up_white.png'),
    };

    // Define state inside the component
    const [rewardStripOpen, setRewardStripOpen] = useState(true);
    const [rewardStripImage, setRewardStripImage] = useState(images.dropdown_down);

    // claim List
    const [claimListStripOpen, setClaimListStripOpen] = useState(true);
    const [claimListStripImage, setClaimListStripImage] = useState(images.arow_down_white);

    // Re claim List
    const [reClaimListStripOpen, setReClaimListStripOpen] = useState(false);
    const [reClaimListStripImage, setReClaimListStripImage] = useState(images.arow_down_white);

    // Success List
    const [successListStripOpen, setSuccessListStripOpen] = useState(false);
    const [successListStripImage, setSuccessListStripImage] = useState(images.arow_down_white);

    const [paymentOptions, setPaymentOptions] = useState([])
    const [claimList, setClaimList] = useState([])
    const [reClaimList, setReClaimList] = useState([])
    const [successList, setSuccessList] = useState([])

    useEffect(() => {
        setTransactionList(props?.transactionList)
    }, [props?.transactionList])


    useEffect(() => {
        console.log("transactionList///", transactionList)

        if (!isNullOrEmptyNOTTrim(comingFromTransaction)) {
            setIsNoDataAvailable(false)
            if (comingFromTransaction == CASH_FREE_TRANSACTION_LIST) {
                if (!isEmptyValueObject(transactionList)) {

                    if ((!isNullOrEmptyNOTTrim(transactionList.claimList) && transactionList.claimList.length > 0) ||
                        (!isNullOrEmptyNOTTrim(transactionList.reClaimList) && transactionList.reClaimList.length > 0) ||
                        (!isNullOrEmptyNOTTrim(transactionList.successList) && transactionList.successList.length > 0)) {

                        setPaymentOptions(transactionList.paymentOptions)
                        setClaimList(transactionList.claimList)
                        setReClaimList(transactionList.reClaimList)
                        setSuccessList(transactionList.successList)

                    }
                    setProgramTitle(transactionList.programTitle)
                    setTotalClaimAmount(transactionList.totalClaimAmount)
                    setClaimRupeeTotal(transactionList.claimRupeeTotal)
                    setClaimBtnVisible(transactionList.claimBtnVisible)
                    setIsNoDataAvailable(false)
                }
            }
        }

    }, [comingFromTransaction, transactionList, props?.transactionList])

    useEffect(() => {
        if (!isNullOrEmptyNOTTrim(claimList) && claimList.length == 0 &&
            !isNullOrEmptyNOTTrim(reClaimList) && reClaimList.length == 0 &&
            !isNullOrEmptyNOTTrim(successList) && successList.length == 0) {
            setIsNoDataAvailable(true)
        }
        else {
            setIsNoDataAvailable(false)
        }

        if (claimList.length > 0) {
            setClaimListStripOpen(true)
            setReClaimListStripOpen(false)
            setSuccessListStripOpen(false)
        }
        else if (reClaimList.length > 0) {
            setClaimListStripOpen(false)
            setReClaimListStripOpen(true)
            setSuccessListStripOpen(false)
        }
        else if (successList.length > 0) {
            setClaimListStripOpen(false)
            setReClaimListStripOpen(false)
            setSuccessListStripOpen(true)
        }

    }, [claimList, reClaimList, successList])


    const rewardStripClickAction = () => {
        setRewardStripOpen((prevState) => !prevState);
        setRewardStripImage((prevState) => (prevState === images.dropdown_down ? images.dropdown_up : images.dropdown_down));
    };

    const claimListStripClickAction = () => {
        setClaimListStripOpen((prevState) => !prevState);
        setReClaimListStripOpen(false);
        setSuccessListStripOpen(false);
        setClaimListStripImage((prevState) => (prevState === images.arow_down_white ? images.arow_up_white : images.arow_down_white));
    };

    const reClaimListStripClickAction = () => {
        setReClaimListStripOpen((prevState) => !prevState);
        setClaimListStripOpen(false);
        setSuccessListStripOpen(false);
        setReClaimListStripImage((prevState) => (prevState === images.arow_down_white ? images.arow_up_white : images.arow_down_white));
    };


    const successListStripClickAction = () => {
        setSuccessListStripOpen((prevState) => !prevState);
        setReClaimListStripOpen(false);
        setClaimListStripOpen(false);
        setSuccessListStripImage((prevState) => (prevState === images.arow_down_white ? images.arow_up_white : images.arow_down_white));
    };

    const renderClaimListItem = (item, index) => {
        return (
            <View
                style={[{ borderWidth: 0.5, borderRadius: 5, borderColor: 'grey', margin: 5, padding: 8 }]}>
                {!isNullOrEmptyNOTTrim(item.productName) &&
                    <CustomLabelValue
                        lblName={translate('product_name_label')}
                        lblValue={item.productName}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.amount) &&
                    <CustomLabelValue
                        lblName={`${translate('amount')} (₹)`}
                        lblValue={item.amount}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.createdOn) &&
                    <CustomLabelValue
                        lblName={translate('date')}
                        lblValue={strYMMDhmsSToDMMMYhms(item.createdOn)}
                    />
                }
                {/* {!isNullOrEmptyNOTTrim(item.prodSerialNumber) &&
                    <CustomLabelValue
                        lblName={translate('product_uid')}
                        lblValue={item.prodSerialNumber}
                    />
                } */}
                {!isNullOrEmptyNOTTrim(item.status) &&
                    <CustomLabelValue
                        lblName={translate('status_')}
                        lblValue={item.status == SUCCESS_st && translate('success') ||
                            item.status == FAILED_st && translate('failed') ||
                            item.status == PENDING_st && translate('pending')}
                    />
                }
            </View>
        )
    };

    const renderReClaimListItem = (item, index) => {
        console.log("reclaimItem=-=-=->", item)
        return (
            <View
                style={[{ borderTopWidth: 0.5, borderRightWidth: 0.5, borderLeftWidth: 0.5, borderRadius: 5, borderColor: 'grey', marginTop: 10 }]}>
                <View style={{ padding: 8 }}>
                    {!isNullOrEmptyNOTTrim(item.productName) &&
                        <CustomLabelValue
                            lblName={translate('product_name_label')}
                            lblValue={item.productName}
                        />
                    }
                    {!isNullOrEmptyNOTTrim(item.amount) &&
                        <CustomLabelValue
                            lblName={`${translate('amount')} (₹)`}
                            lblValue={item.amount}
                        />
                    }


                    {!isNullOrEmptyNOTTrim(item.createdOn) &&
                        <CustomLabelValue
                            lblName={translate('date')}
                            lblValue={strYMMDhmsSToDMMMYhms(item.createdOn)}
                        />
                    }
                    {!isNullOrEmptyNOTTrim(item.prodSerialNumber) &&
                        <CustomLabelValue
                            lblName={translate('product_uid')}
                            lblValue={item.prodSerialNumber}
                        />
                    }
                    {!isNullOrEmptyNOTTrim(item.orderId) &&
                        <CustomLabelValue
                            lblName={translate('Order_Id')}
                            lblValue={item.orderId}
                        />
                    }
                    {!isNullOrEmptyNOTTrim(item.referenceId) &&
                        <CustomLabelValue
                            lblName={translate('reference_id')}
                            lblValue={item.referenceId}
                        />
                    }
                    {!isNullOrEmptyNOTTrim(item.status) &&
                        <CustomLabelValue
                            lblName={translate('status_')}
                            lblValue={item.status == SUCCESS_st && translate('success') ||
                                item.status == FAILED_st && translate('failed') ||
                                item.status == PENDING_st && translate('pending')}
                        />
                    }
                </View>


                {!isNullOrEmptyNOTTrim(item.buttonText) &&
                    <>
                        {item.reClaimBtnVisible &&
                            <TouchableOpacity
                                onPress={() => {
                                    isConnected ? navigateTOPaymentActivity(item, translate('reclaim'), item.amount, item.totalReClaimAmount) : SimpleToast.show(translate("no_internet_conneccted"))
                                }}
                                style={[{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'center', marginTop: 5, backgroundColor: dynamicStyles.primaryColor, borderWidth: 0.5, borderColor: dynamicStyles.primaryColor }]}>
                                <Text style={[{ color: 'white' }]}>{translate('reclaim')}</Text>
                            </TouchableOpacity>

                        }
                    </>
                }
            </View>
        )
    };

    const renderSuccessListItem = (item, index) => {
        return (
            <View
                style={[{ borderWidth: 0.5, borderRadius: 5, borderColor: 'grey', margin: 5, paddingLeft: 8, paddingBottom: 8 }]}>

                {!isNullOrEmptyNOTTrim(item.showView) && item.showView &&
                    <TouchableOpacity
                        onPress={() => {
                            callApiSuccessListDetails(item)
                        }}
                        style={{ alignSelf: "flex-end" }}
                    // style={[
                    //     { width:40, height:40,
                    //     //  position: 'absolute',
                    //  alignSelf: 'flex-end',
                    // //   right:0,
                    // backgroundColor:"red",

                    //  justifyContent:"flex-start",alignItems:"flex-start" }

                    //  ]}
                    >
                        <Image style={[{ width: 50, height: 43, marginEnd: 8 }]}
                            resizeMode='contain'
                            source={require('../CashbackProgram/assets/ic_info_hand_icon.png')} />
                    </TouchableOpacity>
                }

                {!isNullOrEmptyNOTTrim(item.amount) &&
                    <CustomLabelValue
                        lblName={`${translate('amount')} (₹)`}
                        lblValue={isDigitOnly(item.amount) ? item.amount : item.amount}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.productName) &&
                    <CustomLabelValue
                        lblName={translate('product_name_label')}
                        lblValue={item.productName}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.transferId) &&
                    <CustomLabelValue
                        lblName={translate('transaction_id')}
                        lblValue={item.transferId}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.createdOn) &&
                    <CustomLabelValue
                        lblName={translate('date')}
                        lblValue={strYMMDhmsSToDMMMYhms(item.createdOn)}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.orderId) &&
                    <CustomLabelValue
                        lblName={translate('Order_Id')}
                        lblValue={item.orderId}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.referenceId) &&
                    <CustomLabelValue
                        lblName={translate('reference_id')}
                        lblValue={item.referenceId}
                    />
                }



                {!isNullOrEmptyNOTTrim(item.prodSerialNumber) &&
                    <CustomLabelValue
                        lblName={translate('product_uid')}
                        lblValue={item.prodSerialNumber}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.status) &&
                    <CustomLabelValue
                        lblName={translate('status_')}
                        lblValue={item.status == SUCCESS_st && translate('success') ||
                            item.status == FAILED_st && translate('failed') ||
                            item.status == PENDING_st && translate('pending')}
                    />
                }
            </View>
        )
    };

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

    const callApiSuccessListDetails = async (selectedItem) => {


        if (!isConnected) {
            SimpleToast.show(translate('no_internet_conneccted'));
            return;
        }
        else {

            const url = APIConfig.BASE_URL + APIConfig.CBGETALLTRANSACTIONSWITHREFERRENCEID;
            const headers = await GetApiHeaders()

            var body = {
                referenceId: !isNullOrEmptyNOTTrim(selectedItem.referenceId) ? selectedItem.referenceId : "",
            }

            console.log("url=-=-=->", url)
            console.log("headers=-=-=->", headers)
            console.log("body=-=-=->", body)
            try {
                const data = await POST({
                    url: url,
                    body: body,
                    headers: headers
                });
                console.log("asaaspo-==->", data)


                if (data?.statusCode == HTTP_OK) {
                    // const decodeddJson = JSON.parse(responseObj?.response);
                    // console.log("decodeddJson", JSON.stringify(decodeddJson))
                    if (!isNullOrEmptyNOTTrim(data?.response?.instantPayTransactionList) && data?.response?.instantPayTransactionList.length > 0) {
                        navigation.navigate('TransactionDetailsActivity',
                            { detailsList: data?.response?.instantPayTransactionList, onSelectedItem: selectedItem, dynamicStyles: dynamicStyles })
                    }

                } else if (data?.statusCode === HTTP_601) {
                    handleForceLogout()
                }

                else {
                    SimpleToast.show(!isNullOrEmptyNOTTrim(data?.message) ? data?.message : translate('something_went_wrong'));
                }
            } catch (error) {
                console.log('POST ERROR:', error);
            }

        }

    }

    const navigateTOPaymentActivity = (selectedItem, fromBtn, claimRupeeTotal, totalAmount) => {
        console.log(selectedItem + "=====" + fromBtn + "===" + claimRupeeTotal + "===" + totalAmount)

        var navigateToPaymentOptions = {
            paymentOptionsList: paymentOptions,
            selectedItem: selectedItem,
            fromBtn: fromBtn,
            claimRupeeTotal: claimRupeeTotal,
            totalAmount: totalAmount,
            dynamicStyles: dynamicStyles
        };

        navigation.navigate('PaymentOptionsActivity', { navigateToPaymentOptions })
    }

    return (

        <View style={[{ width: '100%', backgroundColor: 'white' }]}>

            {!isNoDataAvailable &&
                !isEmptyValueObject(transactionList) &&

                <View>
                    <TouchableOpacity
                        onPress={rewardStripClickAction}
                        style={[
                            { width: '100%', backgroundColor: dynamicStyles.primaryColor, height: 50, marginTop: 2, flexDirection: 'row', alignItems: 'center', padding: 5 }]}>
                        <Image style={[
                            { width: 25, height: 25, tintColor: 'white' }]} source={rewardStripImage} />
                        <Text style={[{ fontSize: 18, color: 'white', paddingLeft: 5 }]}>
                            {programTitle}
                        </Text>
                    </TouchableOpacity>

                    {rewardStripOpen && (
                        <View style={[{ padding: 5 }]}>

                            {isNoDataAvailable &&
                                <View style={[{ width: '100%', alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text style={[{ fontSize: 20, fontWeight: 'bold', color: 'red' }]}>{translate('no_data_available')}</Text>
                                </View>}

                            <ScrollView scrollEnabled={true}>

                                {/* claim List Section */}
                                {!isEmptyValueObject(claimList) && claimList.length > 0 &&
                                    <View>
                                        <TouchableOpacity
                                            onPress={claimListStripClickAction}
                                            style={[{ width: '100%', backgroundColor: dynamicStyles.primaryColor, height: 40, marginTop: 2, flexDirection: 'row', alignItems: 'center', padding: 5 },
                                            { borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                                            <Text
                                                style={[{ fontSize: 16, color: 'white', paddingLeft: 5, width: '50%' }]}>{translate('claim_list')}</Text>
                                            <View style={[{ width: '50%', flexDirection: 'row', justifyContent: 'flex-end' }]}>
                                                <Text style={[{ fontSize: 16, color: 'white', marginEnd: 10 }]}>{claimRupeeTotal}</Text>
                                                <Image style={[{ width: 25, height: 25, tintColor: 'white', marginEnd: 10 }]} source={claimListStripImage} />
                                            </View>

                                        </TouchableOpacity>

                                        {claimListStripOpen &&
                                            <View
                                                style={[{ borderRightWidth: 0.5, borderLeftWidth: 0.5, borderColor: 'grey', marginBottom: 5 }]}>

                                                <View
                                                    style={[{
                                                        width: '100%', alignSelf: 'center',
                                                        // height:claimBtnVisible?400:"90%"
                                                        minHeight: 50,
                                                        maxHeight: 400
                                                    }]}>

                                                    <FlatList
                                                        data={claimList}
                                                        keyExtractor={(item, index) => index.toString()}
                                                        renderItem={({ item, index }) => renderClaimListItem(item, index)}
                                                        nestedScrollEnabled={true}
                                                        contentContainerStyle={{ flexGrow: 1 }}
                                                    // ListFooterComponent={()=><View style={{height:150}}/>}
                                                    />

                                                </View>

                                                {claimBtnVisible &&
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            isConnected ? navigateTOPaymentActivity(claimList, translate('claim'), claimRupeeTotal, totalClaimAmount) : SimpleToast.show(translate("no_internet_conneccted"))
                                                        }}
                                                        style={[{
                                                            width: '100%', height: 40, alignItems: 'center',
                                                            justifyContent: 'center', alignSelf: 'center',
                                                            backgroundColor: dynamicStyles.primaryColor,
                                                            borderWidth: 0.5, borderColor: dynamicStyles.primaryColor,
                                                            marginTop: 5
                                                        }]}>
                                                        <Text style={[{ color: 'white' }]}>{translate('claim') + " - " + claimRupeeTotal}</Text>
                                                    </TouchableOpacity>
                                                }

                                            </View>
                                        }

                                    </View>}

                                {/* Re claim List Section */}
                                {!isEmptyValueObject(reClaimList) && reClaimList.length > 0 &&
                                    <View style={{ marginTop: 5 }}>
                                        <TouchableOpacity
                                            onPress={reClaimListStripClickAction}
                                            style={[{
                                                width: '100%', backgroundColor: dynamicStyles.primaryColor, height: 40, marginTop: 2,
                                                flexDirection: 'row', alignItems: 'center', padding: 5,
                                                borderTopLeftRadius: 10, borderTopRightRadius: 10
                                            }]}>
                                            <Text
                                                style={[{
                                                    fontSize: 16, color: 'white',
                                                    paddingLeft: 5, width: '50%'
                                                }]}>{translate('reclaim_list')}</Text>
                                            <View style={[{ width: '50%', flexDirection: 'row', justifyContent: 'flex-end' }]}>
                                                <Image style={[{ width: 25, height: 25, tintColor: 'white', marginEnd: 10 }]} source={reClaimListStripImage} />
                                            </View>

                                        </TouchableOpacity>

                                        {reClaimListStripOpen &&
                                            <View
                                                style={[{ padding: 8, borderWidth: 0.5, borderColor: 'grey', marginBottom: 5, borderBottomLeftRadius: 0.5, borderBottomRightRadius: 0.5 }]}>
                                                <View
                                                    style={[{
                                                        width: '100%', alignSelf: 'center',
                                                        // height:claimBtnVisible?400:"90%"
                                                        minHeight: 50,
                                                        maxHeight: 300
                                                    }]}>
                                                    <FlatList
                                                        data={reClaimList}
                                                        keyExtractor={(item, index) => index.toString()}
                                                        renderItem={({ item, index }) => renderReClaimListItem(item, index)}
                                                        nestedScrollEnabled={true}
                                                        contentContainerStyle={{ flexGrow: 1 }}
                                                    />
                                                </View>
                                            </View>}
                                    </View>}

                                {/* successList List Section */}
                                {!isEmptyValueObject(successList) && successList.length > 0 &&
                                    <View>
                                        <TouchableOpacity
                                            onPress={successListStripClickAction}
                                            style={[{
                                                width: '100%', backgroundColor: dynamicStyles.primaryColor, height: 40, marginTop: 2,
                                                flexDirection: 'row', alignItems: 'center', padding: 5,
                                                borderTopLeftRadius: 10, borderTopRightRadius: 10
                                            }]}>
                                            <Text
                                                style={[{
                                                    fontSize: 16, color: 'white',
                                                    paddingLeft: 5, width: '50%'
                                                }]}>{translate('success_list')}</Text>
                                            <View style={[{ width: '50%', flexDirection: 'row', justifyContent: 'flex-end' }]}>
                                                <Image style={[{ width: 25, height: 25, tintColor: 'white', marginEnd: 10 }]} source={successListStripImage} />
                                            </View>

                                        </TouchableOpacity>

                                        {successListStripOpen &&
                                            <View
                                                style={[{ width: '100%', alignSelf: 'center' }]}>
                                                <View
                                                    style={[{
                                                        width: '100%', alignSelf: 'center',
                                                        // height:claimBtnVisible?400:"90%"
                                                        minHeight: 50,
                                                        maxHeight: 400
                                                    }]}>
                                                    <FlatList
                                                        data={successList}
                                                        keyExtractor={(item, index) => index.toString()}
                                                        renderItem={({ item, index }) => renderSuccessListItem(item, index)}
                                                        nestedScrollEnabled={true}
                                                        contentContainerStyle={{ flexGrow: 1 }}
                                                    />
                                                </View>
                                            </View>}
                                    </View>}
                            </ScrollView>

                        </View>
                    )}

                </View>
            }
        </View>
    );
}



export default CashFreeTransactions;
