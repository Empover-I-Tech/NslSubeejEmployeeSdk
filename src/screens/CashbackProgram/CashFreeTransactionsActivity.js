//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Platform, StatusBar, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import CashFreeTransactions from './CashFreeTransactions';
import { CASH_FREE_TRANSACTION_LIST, DOWNLOAD_FOLDER_PATH, isEmptyValueObject } from '../../assets/Utils/Utils';
import { Colors } from '../../styles/colors';
import { translate } from '../../Localization/Localisation';
import CashbackLoader from './CashbackLoader';
import { GET,POST } from './CashbackApiComponent';
import { RFValue } from "react-native-responsive-fontsize";
import { useFontStyles } from "../../hooks/useFontStyles";
import SimpleToast from 'react-native-simple-toast';
import APIConfig, { HTTP_601, HTTP_OK } from '../../api/APIConfig';
import { GetApiHeaders } from '../../utils/helpers';

// forcelogout
import axios from 'axios';
import { deleteFromAsyncStorage} from "../../utils/keychainUtils";
import { setCompanyStyle } from '../../state/actions/companyStyles';
import { useRealm, useQuery } from '@realm/react';
import RNFS from 'react-native-fs';
import { MOBILENUMBER, REFERRALCODE, USER_ID, USERNAME, USER_IMG, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, LANGUAGEID, OFFLINETOTALCOUNT, FIRSTNAME, LASTNAME, COMPANYCODE } from '../../utils';

const { height, width } = Dimensions.get("window")

const CashFreeTransactionsActivity = () => {
    const fonts = useFontStyles()
    const navigation = useNavigation();
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const isConnected = useSelector(state => state.network.isConnected);
    const [trigger, setTrigger] = useState(true);
    const [showView, setShowView] = useState(false);
    const [cashFreeTransactionList, setCashFreeTransactionList] = useState({});
    const [loading,setLoading]=useState(false)
    const [networkRequestFailed,setNetworkRequestFailed]=useState(false)

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
    const dispatch=useDispatch()

    useEffect(() => {
        setShowView(true)
        console.log("showView", showView)
    }, [cashFreeTransactionList])


    // useEffect(() => {
    //     if (trigger) {
    //         var decodeddJson = require('./response.json')
    //         setCashFreeTransactionList(decodeddJson.cashFreeTransactionList)

    //         callApiTransactionList();
    //         setTrigger(false)
    //     }

    // }, [trigger])
    useFocusEffect(
        useCallback(() => {
            
            if (trigger) {
                setLoading(true)
                // const decodeddJson = require('./response.json');

                // setCashFreeTransactionList(decodeddJson.cashFreeTransactionList);

                callApiTransactionList();

                setTrigger(false);
            }else{
                // setLoading(false)
            }
        }, [trigger,cashFreeTransactionList])
    );

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
      setLoading(false)
      return;
    }

    try {
      setLoading(true);
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
        setLoading(false)
      } else {
        setLoading(false)
        SimpleToast.show(apiCallLogout.data.message)
      }

    } catch (error) {
      setLoading(false)

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

    const callApiTransactionList = async () => {
        try {
            if (isConnected) {
                // setFill(10)
                setLoading(true)
                // setLoadingMessage("Loading...")
                const url = APIConfig.BASE_URL + APIConfig.CASHBACKHISTORY;
                const headers = await GetApiHeaders();
                console.log("url", url)
                console.log("headers", headers)
                const response = await GET({
                    url: url,
                    headers: headers
                });
                console.log("GET DATA:=--=-=-=>", JSON.stringify(response));
                if (response?.statusCode === HTTP_OK) {
                    setCashFreeTransactionList(response?.response?.cashFreeTransactionList ? response?.response?.cashFreeTransactionList : {})
                    setTimeout(()=>{setLoading(false)},1000)
                } 
                else if (response?.statusCode === HTTP_601) {
                    handleForceLogout()
                    return
                } 
                
                else {
                    setLoading(false)
                    SimpleToast.show(response?.message ? response?.message : translate("Something_went_wrong"))
                }

            } else {
                SimpleToast.show(translate('no_internet_conneccted'))
                setLoading(false)
            }
            setNetworkRequestFailed(false)
        } catch (error) {
            setNetworkRequestFailed(true)
            console.log("ERROR=-->",error)
        } finally {
            setLoading(false)
        }

    }

    return (
        <View style={[{ width: '100%', height: '100%', backgroundColor: Colors.white }]}>
            {Platform.OS === 'android' && (
                <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle="dark-content" />
            )}

            <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
                <View style={{ backgroundColor: dynamicStyles.primaryColor, width: "100%", height: height * 0.08 }}>
                    <Image source={require('../CashbackProgram/assets/flowerIcon.png')} style={{
                        position: "absolute",
                        bottom: height * 0.001,
                        right: width * 0.05,
                        height: 50,
                        width: 100,
                        tintColor: "#000",
                        resizeMode: "contain"
                    }} />
                    <View style={{
                        paddingTop: 20,
                        paddingHorizontal: 20,
                        height: 80
                    }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Image style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.07, width: width * 0.15, resizeMode: "contain" }} source={require('../CashbackProgram/assets/BackIcon.png')} />
                            </TouchableOpacity>
                            <Text style={{
                                color: dynamicStyles.secondaryColor,
                                fontSize: RFValue(16, height),
                                fontFamily: fonts.SemiBold,
                                alignSelf: "center",
                                lineHeight: 30
                            }}>
                                {translate('Cashback_History')}
                            </Text>
                            <TouchableOpacity onPress={() => setTrigger(true)}>
                                <Image source={require('../CashbackProgram/assets/refresh_icon.png')} style={{ tintColor: dynamicStyles.secondaryColor, height: width * 0.05, width: 40, resizeMode: "contain" }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* Reward Strip Section */}
            {showView &&
                <View>
                    {!isEmptyValueObject(cashFreeTransactionList) && (
                        <View>
                            <CashFreeTransactions
                                transactionList={cashFreeTransactionList}
                                comingFromTransaction={CASH_FREE_TRANSACTION_LIST}
                                dynamicStyles={dynamicStyles}
                            />
                        </View>
                    )}
                </View>}

            {isEmptyValueObject(cashFreeTransactionList)&&!loading&&
                <Text style={{color: "red", marginTop: 20, alignSelf: "center", fontSize: 16, fontFamily: fonts.SemiBold, textAlign: "center" }}>{networkRequestFailed ? translate("Unable_to_process_your_request_moment_Please_again_later") : translate("No_Cashback_Yet")}</Text>
            } 

            {loading && <>
                {dynamicStyles?.loaderPath != undefined && dynamicStyles?.loaderPath != "" &&
                    <CashbackLoader loaderPath={dynamicStyles.loaderPath} message={""}/>
                }
            </>}
        </View>
    );
}



export default CashFreeTransactionsActivity;
