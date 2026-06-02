import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TextInput,
  StatusBar,
  Dimensions,
  View,
  TouchableWithoutFeedback,
  Linking,
  Platform,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Modal,
  ScrollView,
  PermissionsAndroid,
  Alert
} from 'react-native';
import { useDispatch, useSelector, } from 'react-redux';
import axios from 'axios';
import { strings } from '../Localization/StringsCopy';
import {
  deleteFromAsyncStorage,
  getFromAsyncStorage,
  storeInAsyncStorage,
} from '../utils/keychainUtils';
import { MOBILENUMBER, REFERRALCODE, USER_ID, USERNAME, USER_IMG, STATE_ID, DISTRICT_ID, STATE_NAME, DISTRICT_NAME, LANGUAGEID, OFFLINETOTALCOUNT, FIRSTNAME, LASTNAME, COMPANYCODE } from '../utils';
import { GetApiHeaders, getGreetingMessage, normalizeText, getBuildNumber, getAppVersion, downloadFileToLocal } from '../utils/helpers';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import APIConfig, { HTTP_601, HTTP_OK, FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, APP_ENV_PROD } from '../api/APIConfig';
import CustomAlert from '../components/CustomAlert';
import DeviceInfo from 'react-native-device-info';
import { RefreshControl } from 'react-native-gesture-handler';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { setCompanyStyle } from '../state/actions/companyStyles';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import SimpleToast from 'react-native-simple-toast';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import { setLocationActions } from '../state/actions/locationActions';
import realm from './realmOffline/realmConfig';
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';

import { useGeoTaggingCRUD } from './realmOffline/useGeoTaggingCRUD';
import useGetRequestWithJwt from "../api/useGetRequestWithJwt";
import { CASHBACK, CASHBACKSCAN, CASHBACKSCAN2, DOWNLOAD_FOLDER_PATH, FIELDACTIVITYQR, REWARDS, USERMENUCONTROL, compareVersions, processComplaintImages, retrieveData, storeData } from '../assets/Utils/Utils';
import { useOfflineSync } from '../utils/syncUtils';
import { useOfflineCalculatorsCRUD } from './realmOffline/useOfflineCalculatorsCRUD';
import { helpDeskRaiseCRUD } from './realmOffline/helpDeskRaiseCRUD';
import { useFontStyles } from '../hooks/useFontStyles';
import { setWeatherTitle } from '../state/actions/weatherTitleActions';
import { setMarketpriceData } from '../state/actions/marketPricesList';
import { setTabMenuControl } from '../state/actions/tabmenuControl';
import GenuineCheckModal from './CashbackProgram/GenuineCheckModal';
import { setCashBackModal } from '../state/actions/cashBackModal';
import { setCashBackSuccessModal } from '../state/actions/cashBackSuccessModal';
import GenuinityModal from './CashbackProgram/GenuinityModalComponent';

const { width, height } = Dimensions.get('window');
const playStore = 'https://play.google.com/store/apps/details?id=com.nsl.subeejkisan';
const appStoreLink = 'https://apps.apple.com/us/app/subeej/id6748138745'

const defaultImage = require('../../assets/Images/farmerIconImg.png');
import { useRoute } from '@react-navigation/native';
import { setCashBackSuccessGenuineModal } from '../state/actions/cashBackSuccessGenuineModal';
import { CustomCommonModal } from '../components/CustomCommonModal';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { setNearBy } from '../state/actions/nearByAction';

const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 2;

const HomeScreenRn = ({ route }) => {
  // const route = useRoute();
  const fonts = useFontStyles()
  const { uploadOfflineGeoTagDataToServer, uploadOfflineHelpDesk, uploadOfflineSeedCalc, uploadOfflineYieldCalc, incrementOfflineCount, decrementOfflineCount, updateOfflineCount } = useOfflineSync();
  const { saveSeedMasterList, saveYieldMasterList, saveSeedCalc, fertilizerMasterList, fertilizerMasterList2 } = useOfflineCalculatorsCRUD();

  const {
    getOfflineGeoTagCount
  } = useGeoTaggingCRUD();

  const {
    getOfflineHelpDeskCount,
  } = helpDeskRaiseCRUD();

  const {
    hasSeedCalc,
    hasYieldCalc,
    getSeedCalc
  } = useOfflineCalculatorsCRUD();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentTheme = useSelector(state => state.theme.theme);
  const isConnected = useSelector(state => state.network.isConnected);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const existingDynamicStyles = useSelector(state => state.companyStyles.companyStyles);

  const locationCheck = useSelector(state => state.selectLocationReducer?.locationStyles)
  const offlineCount = useSelector((state) => state.offlineCountReducer.offlineCount);
  const [userData, setUserData] = useState({});
  const [greeting, setGreeting] = useState('');
  const [menuControler, setMenuControler] = useState([]);
  const [dashboardMaster, setDashboardMaster] = useState({});
  const [weatherInfo, setWeatherInfo] = useState({});
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [showAlertHeader, setShowAlertHeader] = useState(false);
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlertYesButton, setShowAlertYesButton] = useState(false);
  const [showAlertNoButton, setShowAlertNoButton] = useState(false);
  const [showAlertYesButtonText, setShowAlertYesButtonText] = useState('');
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [latitude, setLatitude] = useState(locationCheck?.latitude || '');
  const [longitude, setLongitude] = useState(locationCheck?.longitude || '');
  const [selectedCalculator, setSelectedCalculator] = useState('');
  const [listCalculatorsVisible, setListCalculatorsVisible] = useState(false);
  const [productScanModalOpen, setProductScanModalOpen] = useState(false);
  const [farmerType, setFarmerType] = useState('');
  const [fellowFarmerVisible, setFellowFarmerVisible] = useState(true);
  const [fellowFarmerName, setFellowFarmerName] = useState('');
  const [fellowFarmerMobileNumber, setFellowFarmerMobileNumber] = useState('');
  const [fellowFarmerNameValidation, setFellowFarmerNameValidation] = useState(false);
  const [fellowFarmerMobileValidation, setFellowFarmerMobileValidation] = useState(false);
  const [fellowFarmerNameValidationContent, setFellowFarmerNameValidationContent] = useState('');
  const [fellowFarmerMobileValidationContent, setFellowFarmerMobileValidationContent] = useState('');
  const [cameraPermission, setCameraPermission] = useState(null);
  const [loaderApi, setLoaderApi] = useState(false)
  const [uploadTotalCount, setUploadTotalCount] = useState(0)
  const { fetchData } = useGetRequestWithJwt();
  const [langId, setLangId] = useState(null)

  const cachedImages = realm.objects('Image');
  const cachedGeoTaggingHistory = realm.objects('GEOTAGGINGHISTORY');
  const cachedKnowledgeCenter = realm.objects('KnowledgeCenter');
  const cachedGoldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')
  const cachedSamadhanHistory = realm.objects('SAMADHANHISTORY');

  const Meeting = realm.objects('Meeting');
  const GeoTaggingView = realm.objects('GeoTaggingView');
  const cachedHybridList = realm.objects('hybridMaster');
  const FABDetails = realm.objects('FABDetails')
  const helpDeskRaise = realm.objects('helpDeskRaise')
  const YieldMaster = realm.objects('YieldMaster');
  const SeedMaster = realm.objects('SeedMaster');
  const FertilizerMaster = realm.objects('FertilizerMaster');
  const FertilizerMaster2 = realm.objects('FertilizerMaster2')
  const SeedCalSubmit = realm.objects('SeedCalSubmit')
  const YieldCalSubmit = realm.objects('YieldCalSubmit')
  const goldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter')
  const [marketPricesList, setMarketPricesList] = useState({})
  const [marketPriceFlatList, setMarketPriceList] = useState([])
  const [weatherTwo, setWeatherTwo] = useState("")
  const [newLat, setNewLat] = useState(null)
  const [newLong, setNewLong] = useState(null)
  const [advanceKnVisible, setAdvanceKnVisible] = useState(true)
  const isSyncInProgress = useRef(false);
  const [showGenunityModal, setShowGenunityModal] = useState(false);
  const [genunityResponse, setGenunityResponse] = useState(null);
  const [staticServices, setStaticServices] = useState({

    displayName: 'services',
    layout: 'Services',
    layoutIcon: require('../../assets/Images/staticServiceIcon.png'),
    servicesList: [
      {
        fontColor: 'rgba(51, 82, 125, 1)',
        id: 1,
        serviceImage: require('../../assets/Images/staticCalculator.png'),
        status: true,
        subTitle: 'Calculator',
        title: 'Calculator',
        translatedElement: 'Crop',
        translatedTitle: 'calculator',
        visible: false
      },
      {
        fontColor: 'rgba(26, 91, 150, 1)',
        id: 2,
        serviceImage: require('../../assets/Images/staticKnowledgeIcon.png'),
        status: true,
        subTitle: 'Knowledge',
        title: 'Center',
        translatedElement: '',
        translatedTitle: 'products',
        visible: true
      },
      {
        fontColor: 'rgba(235, 90, 65, 1)',
        id: 3,
        serviceImage: require('../../assets/Images/staticRetailerIcon.png'),
        status: true,
        subTitle: 'Retailers',
        title: 'Nearby',
        translatedElement: 'RetailersStatic',
        translatedTitle: 'NearbyStatic',
        visible: true
      },
      {
        fontColor: 'rgba(255, 73, 73, 1)',
        id: 4,
        serviceImage: require('../../assets/Images/staticGeoIcon.png'),
        status: true,
        subTitle: 'Sample',
        title: 'GeoTagging',
        translatedElement: 'SampleStatic',
        translatedTitle: 'GeoTaggingStatic',
        visible: true
      },
      {
        fontColor: 'rgba(26, 164, 228, 1)',
        id: 5,
        serviceImage: require('../../assets/Images/staticCropIcon.png'),
        status: true,
        subTitle: 'Crop',
        title: 'Diagnostic',
        translatedElement: 'Crop',
        translatedTitle: 'DiagnosticStatic',
        visible: false
      },
      {
        fontColor: 'rgba(36, 179, 83, 1)',
        id: 13,
        serviceImage: require('../../assets/Images/staticAdviceIcon.png'),
        status: true,
        subTitle: 'Advice',
        title: 'Agronomy',
        translatedElement: 'AdviceStatic',
        translatedTitle: 'AgronomyStatic',
        visible: true
      },
      {
        fontColor: 'rgba(75, 92, 104, 1)',
        id: 14,
        serviceImage: require('../../assets/Images/staticProductIcon.png'),
        status: true,
        subTitle: 'Product',
        title: 'Scan',
        translatedElement: 'VERIFY',
        translatedTitle: 'PRODUCT',
        visible: true
      },
      {
        fontColor: 'rgba(0, 50, 90, 1)',
        id: 11,
        serviceImage: require('../../assets/Images/staticReferIcon.png'),
        status: true,
        subTitle: 'Refer',
        title: 'Earn Points',
        translatedElement: 'refer',
        translatedTitle: 'Earn_Points',
        visible: true
      }
    ],
    showViewAll: true,
  }
  )

  const [staticServiceBe, setStaticServiceBe] = useState(null)
  const [staticOthers, setStaticOthers] = useState({
    displayName: 'Others',
    layout: 'Others',
    layoutIcon: require('../../assets/Images/staticProdcutInfoIcon.png'),
    servicesList: [
      {
        fontColor: "rgba(200, 10, 80, 1)",
        id: 8,
        serviceImage: require('../../assets/Images/staticDipStictIcon.png'),
        status: true,
        subTitle: "Dipstick",
        title: "Surveys",
        translatedElement: "Dipstick",
        translatedTitle: "Surveys",
        visible: true
      },
      {
        fontColor: 'rgba(26, 91, 150, 1)',
        id: 9,
        serviceImage: require('../../assets/Images/staticBookIcon.png'),
        status: true,
        subTitle: 'Book',
        title: 'Seeds',
        translatedElement: 'Book',
        translatedTitle: 'SeedsStatic',
        visible: true
      },
      {
        fontColor: 'rgba(14, 162, 102, 1)',
        id: 10,
        serviceImage: require('../../assets/Images/staticMeetIcon.png'),
        status: true,
        subTitle: 'Meet',
        title: 'Saathi  Kisan',
        translatedElement: 'MeetStatic',
        translatedTitle: 'Saathi_Kisan',
        visible: true
      },
      {
        fontColor: 'rgba(76, 78, 225, 1)',
        id: 12,
        serviceImage: require('../../assets/Images/staticInviteImg.png'),
        status: true,
        subTitle: 'Invite',
        title: 'Farmer Meeting',
        translatedElement: 'InviteStatic',
        translatedTitle: 'Farmer_Meeting',
        visible: true
      },
      {
        fontColor: '#365E7D',
        id: 13,
        serviceImage: require('../../assets/Images/pestForeCast.png'),
        status: true,
        subTitle: 'Forecast',
        title: 'Pest Forecast',
        translatedElement: 'PEST',
        translatedTitle: 'FORECAST',
        visible: false
      },
      {
        fontColor: '#70DA40',
        id: 14,
        serviceImage: require('../../assets/Images/advanceKnowledgeIcon.png'),
        status: true,
        subTitle: 'Knowledge Center',
        title: 'Knowledge Center',
        translatedElement: 'KNOWLEDGE',
        translatedTitle: 'CENTER',
        visible: false
      },
      {
        fontColor: '#0ED2B3',
        id: 14,
        serviceImage: require('../../assets/Images/field_activity_qr.png'),
        status: true,
        subTitle: 'Field Activity QR',
        title: 'Field Activity QR',
        translatedElement: 'FIELD',
        translatedTitle: 'Activity_QR',
        visible: false
      },
      {
        fontColor: '#70DA40',
        id: 15,
        serviceImage: require('../../assets/Images/scanEarnGif.gif'),
        status: true,
        subTitle: 'Scan & Earn',
        title: 'Scan & Earn',
        translatedElement: 'SCAN',
        translatedTitle: 'EARNCASH',
        visible: true
      },
      {
        fontColor: '#58BADD',
        id: 16,
        serviceImage: require('../../assets/Images/redeemCashIcon.png'),
        status: true,
        subTitle: 'RedeemCash',
        title: 'RedeemCash',
        translatedElement: 'REDEEM',
        translatedTitle: 'CASH',
        visible: true
      },
    ],
    showViewAll: true,
  })
  const [staticOthersBe, setStaticOthersBe] = useState(null)
  const [mandiprivisible, setMandipriceVisible] = useState(false)
  const [weatherVisible, setWeatherVisible] = useState(false)
  const [marketPriceVisible, setMarketPriceVisible] = useState(false)
  const [helpDeskVisible, setHelpDeskVisible] = useState(true)
  const [rewardsVisible, setRewardsVisible] = useState(true)
  const [faqVisible, setFaqVisible] = useState(true)
  const othersList = staticOthers.servicesList.filter((item) => item.visible)
  const servicesList = staticServices.servicesList.filter((item) => item.visible)
  const cashbackModalOpen = useSelector((state) => state.cashBackModalReducer.cashBackScan);
  const [cashBackSelected, setCashBackSelected] = useState("")
  const cashbackSuccessModal = useSelector((state) => state.cashBackSuccessModalReducer.cashBackSuccessScan)
  const cashbackSuccessGenuineModal = useSelector((state) => state.cashBackSuccessGenuineModalReducer.cashBackGenuineSuccessScan)
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")
    const nearByLink=useSelector(state=>state.nearByReducer.nearBy)

  console.log("genunityResponse=--=>", genunityResponse)
  const callApiofflineSynch = async (showLoader) => {
    if (uploadTotalCount == 0 && showLoader) {
      SimpleToast.show(translate('no_data_to_upload'))
      return
    }

    if (isSyncInProgress.current) {
      // Prevent multiple calls
      console.log("Sync already in progress...");
      return;
    }
    isSyncInProgress.current = true; // Set lock
    try {

      if (isConnected) {
        setLoaderApi(showLoader);
        const hassOfflineSeedCalc = hasSeedCalc();
        const hassOfflineYieldCalc = hasYieldCalc();

        if (hassOfflineSeedCalc) {
          const seedCalUpdated = await uploadOfflineSeedCalc();
          if (seedCalUpdated) {
            updateOfflineCount()
          }
        }
        if (hassOfflineYieldCalc) {
          const yieldCalUpdated = await uploadOfflineYieldCalc();
          if (yieldCalUpdated) {
            updateOfflineCount()
          }
        }
        if (getOfflineGeoTagCount() > 0) {
          const result = await uploadOfflineGeoTagDataToServer();
          if (result.success) {
            updateOfflineCount()

            // call here transactiontablemasters data
            getSampleGeoTaggingHistory()
          } else {
            SimpleToast.show("Sync failed");
          }
        }
        if (getOfflineHelpDeskCount() > 0) {
          const result = await uploadOfflineHelpDesk();
          if (result.success) {
            updateOfflineCount()
            fetchSamadhanHistory()
          } else {
            // SimpleToast.show("Sync failed");
          }
          // fetchKnowledgeCenterRefresh()
        }
      } else {
        if (showLoader) {
          SimpleToast.show(translate("please_check_connection"));
        }

      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setTimeout(() => {
        // setLoaderApi(false);
        isSyncInProgress.current = false; // Release lock
      }, 1000);
    }

    setTimeout(() => {
      // setLoaderApi(false);
    }, 1000);
  }

  useEffect(() => {
    const initLocationUpdates = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission === "granted") {
        const isGpsEnabled = await checkIfGpsEnabled();
        if (isGpsEnabled) fetchLocation();
        else {
          fetchLocation();
        }

      }
    };
    if (!latitude || !longitude) {
      initLocationUpdates()

    } else {
      getWeatherDetails();
    }
  }, [latitude, longitude, fetchLocation, requestLocationPermission, checkIfGpsEnabled, getWeatherDetails]);

  useEffect(() => {
    setUploadTotalCount(offlineCount);
  }, [offlineCount])

  useEffect(() => {
    callApiofflineSynch(false)
    getUserMenuControl()
    getMenuController()
  }, [isConnected])



  useEffect(() => {
    if (isConnected) {
      if (latitude != "" && longitude != "") {
        getWeatherDetails()
      }
      getUserDetailsVersion11()
    }
  }, [isConnected])

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const [userName, userPic, mobileNumber, referralCode] = await Promise.all([
            getFromAsyncStorage(USERNAME),
            getFromAsyncStorage(USER_IMG),
            getFromAsyncStorage(MOBILENUMBER),
            getFromAsyncStorage(REFERRALCODE),
          ]);
          setGreeting(getGreetingMessage());
          setUserData({ userName, userPic, mobileNumber, referralCode });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      getUserDetailsVersion11()
      updateOfflineCount();
      fetchUserData();
      checkForceUpdate();
      GetUserLocation();
      setSelectedCalculator('');
      setProductScanModalOpen(false);
      setFellowFarmerName('');
      setFellowFarmerMobileNumber('');
      setFellowFarmerVisible(true);
      setFellowFarmerNameValidation(false);
      setFellowFarmerNameValidationContent('');
      setFellowFarmerMobileValidation(false);
      setFellowFarmerMobileValidationContent('');
      fetchHybridsAndIssueTypesAndCrops()
      fetchKnowledgeCenter()
      goldClubFetchKnowledgeCenter()
      fetchSamadhanHistory()
      getSampleGeoTaggingHistory()
      fetchCurrentLocation()
      getMenuController()
      getUserMenuControl()
      const getLanId = async () => {
        const checkingLangId = await getFromAsyncStorage(LANGUAGEID);
        setLangId(checkingLangId)
      }
      getLanId()
      geSeedAndPopulationCaculator();
      getYieldCalcutlor();
      getFertilizerCalc();
      getFertilizersMaster2()
      requestStoragePermissions()
    }, [])
  );

  useEffect(() => {
    if (cashbackModalOpen) {
      setProductScanModalOpen(false)
      setShowGenunityModal(false)
      setAlertVisible(false);
      setListCalculatorsVisible(false)
    }
  }, [cashbackModalOpen])



  const fetchCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // dispatch(setLocationActions({ latitude, longitude }));
        setNewLat(latitude);
        setNewLong(longitude);
        getWeatherDetailsTest(latitude, longitude)
      },
      error => {
        console.error('Error fetching location:', error);
        if (error.code === 3 || error.code === 2) {
          // Retry with higher accuracy
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              getWeatherDetailsTest(latitude, longitude)
            },
            fallbackError => {
              console.error('Fallback location error:', fallbackError);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
          );
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5000 }
    );
  }

  const getWeatherDetailsTest = async (lat, long) => {

    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        const response = await axios.post(
          `${APIConfig.BASE_URL_NVM}${APIConfig.getWeatherDetails}`,
          {
            latitude: lat,
            longitude: long,
            mobileNumber: headers.mobileNumber,
            userId: headers.userId,
          },
          { headers }
        );
        if (response.data.statusCode === HTTP_OK) {
          if (response?.data?.response?.dailyBaseWeatherInfo) {
            setWeatherTwo(response?.data?.response?.dailyBaseWeatherInfo?.forecast[0])
          }
        } if (response.data.statusCode == 403) {
          setWeatherInfo({});
        }
      } catch (error) {
        console.error('Error fetching weather details:', error);
      } finally {
        // setLoaderApi(false);
      }
    }
  }

  const downloadImageToLocal = async (url, fileName) => {
    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    try {
      // Check if the file already exists in local storage
      const fileExists = await RNFS.exists(localPath);
      if (fileExists) {
        return `file://${localPath}`; // Return the existing file path
      }

      // If the file doesn't exist, proceed with downloading
      const res = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        timeout: DOWNLOAD_TIMEOUT, // Optional: Add timeout for download
        retry: RETRY_ATTEMPTS, // Optional: Add retry logic if needed
      }).promise;

      if (res.statusCode === 200) {
        return `file://${localPath}`;
      } else {
        console.warn(`Image download failed with status: ${res.statusCode} for URL: ${url}`);
        return '';
      }
    } catch (error) {
      console.warn(`Image download failed for URL: ${url}, Error: ${error.message}`);
      return '';
    }
  };

  const processMarketPriceData = async (data) => {
    const updatedList = await Promise.all(
      data.cropList.map(async (item, index) => {
        let imageCropCache = null;
        if (item?.image) {
          try {
            const cropImageName = `cropImage_${index}_${item.name}.png`;
            imageCropCache = await downloadImageToLocal(item.image, cropImageName);
          } catch (err) {
            console.warn(`Failed to download crop image for ${item.name}:`, err);
          }
        }

        const updatedFileNames = await Promise.all(
          item.fileName.map(async (fileItem, fileIndex) => {
            const splitImg1 = fileItem.imageUrl.split("Images/")
            const splitImg2 = splitImg1[1].split(".")[0]
            const fileName = `fileName_${fileIndex}_${splitImg2}.png`;
            // const fileName = `fileName_${fileIndex}_Img.png`;
            const localPath = await downloadImageToLocal(fileItem.imageUrl, fileName);
            return {
              ...fileItem,
              imageUrlLocal: localPath,
            };
          })
        );

        const updatedHybridList = await Promise.all(
          item.hybridList.map(async (hybridItem, hybridIndex) => {
            // const fileName = `hybridImage_${hybridIndex}_${Date.now()}.png`;
            console.log("checkingIMgHybrig=-=>", hybridItem)
            const fileName = `hybridImage_${hybridIndex}_${hybridItem.brandName}hybrid.png`;
            const localPath = await downloadImageToLocal(hybridItem.productImage, fileName);
            return {
              ...hybridItem,
              productImageLocal: localPath,
            };
          })
        );

        return {
          ...item,
          fileName: updatedFileNames,
          hybridList: updatedHybridList,
          imageCropCache,
        };
      })
    );

    return {
      ...data,
      cropList: updatedList,
    };
  };

  const downloadImageToLocalCopy = async (url, fileName) => {
    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    try {
      // Check if the file already exists in local storage
      const fileExists = await RNFS.exists(localPath);
      if (fileExists) {
        // console.log(`Image already exists at: ${localPath}`);
        return `file://${localPath}`; // Return the existing file path
      }

      // If the file doesn't exist, proceed with downloading
      const res = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        timeout: DOWNLOAD_TIMEOUT, // Optional: Add timeout for download
        retry: RETRY_ATTEMPTS, // Optional: Add retry logic if needed
      }).promise;

      if (res.statusCode === 200) {
        // console.log(`Image downloaded successfully to: ${localPath}`);
        return `file://${localPath}`;
      } else {
        // console.warn(`Image download failed with status: ${res.statusCode} for URL: ${url}`);
        return '';
      }
    } catch (error) {
      // console.warn(`Image download failed for URL: ${url}, Error: ${error.message}`);
      return '';
    }
  };

  const processSampleGeoTaggingData = async (data) => {
    const updatedList = await Promise.all(
      data.map(async (item, index) => {
        const fileName = `cropImgs_${item.productLabel}_${item.cropName}.png`;
        const localPath = await downloadImageToLocalCopy(item.imageUrl, fileName);
        return {
          ...item,
          imageUrlLocal: localPath,
        };
      })
    );

    return {
      updatedList
    };
  };


  const geSeedAndPopulationCaculator = async () => {
    // var networkStatus = await getNetworkStatus()
    if (isConnected) {
      try {
        const getYeildCalcURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.geSeedAndPopulationCaculator;
        const getHeaders = await GetApiHeaders()
        const APIResponse = await fetchData(getYeildCalcURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            const masterResp = APIResponse.data
            saveSeedMasterList(masterResp);
          }
        }
      }
      catch (error) {
      }
    }

  }

  const getYieldCalcutlor = async () => {
    if (isConnected) {
      try {
        var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETYIELDCALCULATOR;
        var headers = await GetApiHeaders()
        var APIResponse = await fetchData(url, headers);

        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            let YieldMastersId;
            YieldMastersId = uuidv4();
            var masterResp = APIResponse.data
            saveYieldMasterList(masterResp);
          }

        }
      }
      catch (error) {
      }

    }
  }

  const getFertilizerCalc = async () => {
    if (isConnected) {
      try {
        var getFertilizerCalcURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETFERTILIZERCALCULATOR;
        var getHeaders = await GetApiHeaders()
        var APIResponse = await fetchData(getFertilizerCalcURL, getHeaders);

        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.data
            const masterRespString = JSON.stringify(masterResp);
            fertilizerMasterList(masterResp);
          }


        }
      } catch (error) {
      }
    }
  }

  const getFertilizersMaster2 = async () => {
    if (isConnected) {
      try {
        var getFertilizerCalcURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GET_FERTILIZER_CALCULATOR_MASTER;
        var getHeaders = await GetApiHeaders()
        var APIResponse = await fetchData(getFertilizerCalcURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.data
            if (masterResp != undefined && masterResp != null) {
              fertilizerMasterList2(masterResp);
            }
          }

        }
      }
      catch (error) {
      }
    }
  }


  const fetchHybridsAndIssueTypesAndCrops = async () => {
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST"
        const payload = { companyCode: dynamicStyles.companyCode };
        const url = APIConfig.BASE_URL + APIConfig.mastersgetHybridsDropdownList;
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response.hybridList
          let hybridListId;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              hybridListId = uuidv4();
              const existinghybridMaster = realm.objects('hybridMaster').filtered('_id == $0', hybridListId);
              if (existinghybridMaster.length === 0) {
                break;
              }
              console.warn(`UUID collision detected for ${hybridListId}, attempt ${attempts + 1}`);
              attempts++;
            } catch (uuidError) {
              console.error('Error generating UUID for hybridMaster:', uuidError);
              // setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              // setLoaderApi(false);
              return;
            }
          }
          try {
            realm.write(() => {
              realm.create('hybridMaster', {
                _id: hybridListId,
                hybridsList: JSON.stringify(parseData || []),
                timestamp: new Date(),
              });
            });
          } catch (realmError) {
            console.error('Error creating hybridList object in Realm:', realmError);
            // setLoaderApi(false);
            return;
          }
        } else {
          // setLoaderApi(false)
          // setAlertModal(true)
          // setAlertTextContent(translate("Unable_to_fetch_issue_details"))
        }
      } catch (error) {
        // setLoaderApi(false)
      }
    }
  };

  const getSampleGeoTaggingHistory = async () => {
    if (isConnected) {
      try {
        const url = APIConfig.BASE_URL + APIConfig.geoTagging_getScanHistory
        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        if (response && response?.data) {
          if (response?.data?.scanHistoryList) {
            const uploadedGeotaggingData = await processSampleGeoTaggingData(response?.data?.scanHistoryList)
            const imageUrls = new Set();
            let scanMssgOffline
            if (langId === "2") {
              scanMssgOffline = response.data.scanTeluguMessage
            } else if (langId === "3") {
              scanMssgOffline = response.data.scanHindiMessage
            } else if (langId === "1") {
              scanMssgOffline = response.data.scanMessage
            }
            let geoTaggingHistoryId;
            const maxAttempts = 3;
            let attempts = 0;
            while (attempts < maxAttempts) {
              try {
                geoTaggingHistoryId = uuidv4();
                const existingDashboard = realm.objects('GEOTAGGINGHISTORY').filtered('_id == $0', geoTaggingHistoryId);
                if (existingDashboard.length === 0) {
                  break;
                }
                attempts++;
              } catch (uuidError) {
                return;
              }
              if (attempts >= maxAttempts) {
                return;
              }
            }
            if (uploadedGeotaggingData) {
              try {
                realm.write(() => {
                  realm.delete(cachedGeoTaggingHistory);
                  realm.create('GEOTAGGINGHISTORY', {
                    _id: geoTaggingHistoryId,
                    couponsHistoryList: JSON.stringify(uploadedGeotaggingData.updatedList || []),
                    scanMssg: JSON.stringify(scanMssgOffline || ""),
                    timestamp: new Date(),
                  });
                });
              } catch (realmError) {
                console.error('Error creating GEOTAGGINGHISTORY object in Realm:', realmError);
                return;
              }
            }
          } else {
            console.log("API Error:", response.data.message);
          }
        } else {
        }
      } catch (error) {
        console.error("Error fetching scan history:", error);
      }
    } else {
      // setLoaderApi(false);
    }

  };

  const ShowHistoryRefresh = async () => {

    if (isConnected) {
      try {
        const url = APIConfig.BASE_URL + APIConfig.geoTagging_getScanHistory
        const headers = await GetApiHeaders();
        const response = await fetchData(url, headers);
        if (response && response?.data) {
          if (response?.data?.scanHistoryList) {
            const uploadedGeotaggingData = await processSampleGeoTaggingData(response?.data?.scanHistoryList)
            const imageUrls = new Set();
            let scanMssgOffline
            if (langId === "2") {
              scanMssgOffline = response.data.scanTeluguMessage
            } else if (langId === "3") {
              scanMssgOffline = response.data.scanHindiMessage
            } else if (langId === "1") {
              scanMssgOffline = response.data.scanMessage
            }
            let geoTaggingHistoryId;
            const maxAttempts = 3;
            let attempts = 0;
            while (attempts < maxAttempts) {
              try {
                geoTaggingHistoryId = uuidv4();
                const existingDashboard = realm.objects('GEOTAGGINGHISTORY').filtered('_id == $0', geoTaggingHistoryId);
                if (existingDashboard.length === 0) {
                  break;
                }
                attempts++;
              } catch (uuidError) {
                return;
              }
              if (attempts >= maxAttempts) {
                return;
              }
            }
            if (uploadedGeotaggingData) {
              try {
                realm.write(() => {
                  realm.delete(cachedGeoTaggingHistory);
                  realm.create('GEOTAGGINGHISTORY', {
                    _id: geoTaggingHistoryId,
                    couponsHistoryList: JSON.stringify(uploadedGeotaggingData.updatedList || []),
                    scanMssg: JSON.stringify(scanMssgOffline || ""),
                    timestamp: new Date(),
                  });
                });
                console.log('Successfully created GEOTAGGINGHISTORY with _id:', geoTaggingHistoryId);
              } catch (realmError) {
                console.error('Error creating GEOTAGGINGHISTORY object in Realm:', realmError);
                return;
              }
            }
          } else {
            console.log("API Error:", response.data.message);
          }
        } else {
        }
      } catch (error) {
        console.error("Error fetching scan history:", error);
      }
    } else {
      // setLoaderApi(false);
      // SimpleToast.show(translate('no_internet_conneccted'))

    }

  };

  const fetchKnowledgeCenter = async () => {
    if (cachedKnowledgeCenter && cachedKnowledgeCenter.length > 0) {
      console.log("offlinecallknowledgeCenter-=0=->", cachedKnowledgeCenter)
      return
    }
    else if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        const url = APIConfig.BASE_URL + APIConfig.GETACTIVECROPS;
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response;
          let knowledgeCenterId;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              knowledgeCenterId = uuidv4();
              console.log('Generated knowledgeCenterId:', knowledgeCenterId);
              const existingKnowledgeCenter = realm.objects('KnowledgeCenter').filtered('_id == $0', knowledgeCenterId);
              if (existingKnowledgeCenter.length === 0) {
                break;
              }
              console.warn(`UUID collision detected for ${knowledgeCenterId}, attempt ${attempts + 1}`);
              attempts++;
            } catch (uuidError) {
              console.error('Error generating UUID for KnowledgeCenter:', uuidError);
              // setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              // setLoaderApi(false);
              return;
            }
          }
          if (parseData) {
            try {
              realm.write(() => {
                realm.delete(cachedKnowledgeCenter);
                realm.create('KnowledgeCenter', {
                  _id: knowledgeCenterId,
                  cropsList: JSON.stringify(parseData),
                  timestamp: new Date(),
                });
              });
              console.log('Successfully created KnowledgeCenter with _id:', knowledgeCenterId);
            } catch (realmError) {
              console.error('Error creating KnowledgeCenter object in Realm:', realmError);
            }
          }

        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoaderApi(false);
      }
    } else {
      // setLoaderApi(false);
    }
  };

  const goldClubFetchKnowledgeCenter = async () => {
    if (cachedGoldClubKnowledgeCenter.length > 0) {
      console.log("offlinecallknowledgeCenter-=0=->", cachedGoldClubKnowledgeCenter)
      return
    }
    else if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        const url = APIConfig.BASE_URL_NVM + APIConfig.masters_getAllActiveProductsForSubeejKisan;
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response;
          console.log("siaLatChcek-=-=->", JSON.stringify(parseData))
          const updatedKnowledgeCenter = await processMarketPriceData(parseData)
          let goldClubknowledgeCenterId;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              goldClubknowledgeCenterId = uuidv4();
              console.log('Generated goldClubknowledgeCenterId:', goldClubknowledgeCenterId);
              const existingKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter').filtered('_id == $0', goldClubknowledgeCenterId);
              if (existingKnowledgeCenter.length === 0) {
                break;
              }
              console.warn(`UUID collision detected for ${goldClubknowledgeCenterId}, attempt ${attempts + 1}`);
              attempts++;
            } catch (uuidError) {
              console.error('Error generating UUID for goldClubknowledgeCenterId:', uuidError);
              // setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              // setLoaderApi(false);
              return;
            }
          }
          if (updatedKnowledgeCenter) {
            try {
              realm.write(() => {
                realm.delete(cachedGoldClubKnowledgeCenter);
                realm.create('GoldCludKnowledgeCenter', {
                  _id: goldClubknowledgeCenterId,
                  cropsList: JSON.stringify(updatedKnowledgeCenter),
                  timestamp: new Date(),
                });
              });
              console.log('Successfully created goldclub with _id:', goldClubknowledgeCenterId);
            } catch (realmError) {
              console.error('Error creating KnowledgeCenter object in Realm:', realmError);
            }
          }

        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoaderApi(false);
      }
    } else {
      // setLoaderApi(false);
    }
  };

  const fetchKnowledgeCenterRefresh = async () => {
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        const url = APIConfig.BASE_URL + APIConfig.GETACTIVECROPS;
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response;
          console.log("checkingKnowledgeRefes=-=->", parseData)
          let knowledgeCenterId;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              knowledgeCenterId = uuidv4();
              console.log('Generated knowledgeCenterId:', knowledgeCenterId);
              const existingKnowledgeCenter = realm.objects('KnowledgeCenter').filtered('_id == $0', knowledgeCenterId);
              if (existingKnowledgeCenter.length === 0) {
                break;
              }
              console.warn(`UUID collision detected for ${knowledgeCenterId}, attempt ${attempts + 1}`);
              attempts++;
            } catch (uuidError) {
              console.error('Error generating UUID for KnowledgeCenter:', uuidError);
              // setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              // setLoaderApi(false);
              return;
            }
          }
          if (parseData) {
            try {
              realm.write(() => {
                realm.delete(cachedKnowledgeCenter);
                realm.create('KnowledgeCenter', {
                  _id: knowledgeCenterId,
                  cropsList: JSON.stringify(parseData),
                  timestamp: new Date(),
                });
              });
              console.log('Successfully created KnowledgeCenter with _id:', knowledgeCenterId);
            } catch (realmError) {
              console.error('Error creating KnowledgeCenter object in Realm:', realmError);
            }
          }

        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoaderApi(false);
      }
    }
  };

  const goldClubFetchKnowledgeCenterRefresh = async () => {
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        const url = APIConfig.BASE_URL_NVM + APIConfig.masters_getAllActiveProductsForSubeejKisan;
        const response = await axios.post(url, payload, { headers });
        console.log("two-=-=->", JSON.stringify(response.data))

        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response;
          const updatedKnowledgeCenter = await processMarketPriceData(parseData)
          let knowledgeCenterId;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              knowledgeCenterId = uuidv4();
              console.log('Generated knowledgeCenterId:', knowledgeCenterId);
              const existingKnowledgeCenter = realm.objects('KnowledgeCenter').filtered('_id == $0', knowledgeCenterId);
              if (existingKnowledgeCenter.length === 0) {
                break;
              }
              console.warn(`UUID collision detected for ${knowledgeCenterId}, attempt ${attempts + 1}`);
              attempts++;
            } catch (uuidError) {
              console.error('Error generating UUID for KnowledgeCenter:', uuidError);
              // setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              // setLoaderApi(false);
              return;
            }
          }
          if (updatedKnowledgeCenter) {
            try {
              realm.write(() => {
                realm.delete(cachedGoldClubKnowledgeCenter);
                realm.create('GoldCludKnowledgeCenter', {
                  _id: knowledgeCenterId,
                  cropsList: JSON.stringify(updatedKnowledgeCenter),
                  timestamp: new Date(),
                });
              });
              console.log('Successfully created goldclub with _id:', knowledgeCenterId);
            } catch (realmError) {
              console.error('Error creating KnowledgeCenter object in Realm:', realmError);
            }
          }

        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoaderApi(false);
      }
    }
  };

  const newKnowledgeCenter = async () => {
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        const url = APIConfig.BASE_URL_NVM + APIConfig.masters_getAllActiveProductsForSubeejKisan
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === 200) {
          if (response?.data?.response?.cropList) {
            console.log("reposnecrop=-=->", response?.data?.response?.cropList)
          }
        }
        console.log("sairesponse=-new=-=->", response.data.statusCode === 200)

      } catch (error) {
        console.error("Error fetching data:", error);
        // SimpleToast.show(translate("An_unexpected_error_occurred_Please_try_again"));
      } finally {
        // setLoaderApi(false);
      }
    } else {
      // setLoaderApi(false);
      // SimpleToast.show(translate("no_internet_conneccted"));
    }
  };

  const fetchSamadhanHistory = async () => {
    if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = {
          "farmerId": headers.userId,
          'companyCode': dynamicStyles.companyCode
        };
        const url = APIConfig.BASE_URL_NVM + APIConfig.getRaisedComplaints_v1;
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === "200") {
          const parseData = response.data;
          let samadhanHistoryId;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              samadhanHistoryId = uuidv4();
              console.log('Generated samadhanHistoryId:', samadhanHistoryId);
              const existingKnowledgeCenter = realm.objects('SAMADHANHISTORY').filtered('_id == $0', samadhanHistoryId);
              if (existingKnowledgeCenter.length === 0) {
                break;
              }
              console.warn(`UUID collision detected for ${samadhanHistoryId}, attempt ${attempts + 1}`);
              attempts++;
            } catch (uuidError) {
              console.error('Error generating UUID for samadhanHistory:', uuidError);
              // setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              // setLoaderApi(false);
              return;
            }
          }

          // Try to download and update complaint images
          let finalJsonToStore = parseData;

          try {
            const updatedJson = await processComplaintImages(parseData);
            finalJsonToStore = updatedJson;
            console.log('✅ Images processed, updated JSON ready for Realm.');
          } catch (downloadErr) {
            console.error('⚠️ Failed to process images, storing original JSON:', downloadErr);
            // finalJsonToStore already points to parseData
          }

          try {
            realm.write(() => {
              realm.delete(cachedSamadhanHistory);
              realm.create('SAMADHANHISTORY', {
                _id: samadhanHistoryId,
                ticketsHistory: JSON.stringify(finalJsonToStore),
                timestamp: new Date(),
              });
            });
            console.log('Successfully created samadhanhistory with _id:', samadhanHistoryId);
          } catch (realmError) {
            console.error('Error creating samadhanHistory object in Realm:', realmError);
          }
        }
        else {
          // SimpleToast.show(translate("Unable_to_fetch_issue_details"));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // SimpleToast.show(translate("An_unexpected_error_occurred_Please_try_again"));
      } finally {
        // setLoaderApi(false);
      }
    } else {
      // setLoaderApi(false);
      // SimpleToast.show(translate("no_internet_conneccted"));
    }
  };

  const fetchLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission !== "granted") {
      // SimpleToast.show(translate('Permission_denied'));
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        dispatch(setLocationActions({ latitude, longitude }));
        setLatitude(latitude);
        setLongitude(longitude);
      },
      error => {
        console.error('Error fetching location:', error);
        if (error.code === 3 || error.code === 2) {
          // Retry with higher accuracy
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              dispatch(setLocationActions({ latitude, longitude }));
              setLatitude(latitude);
              setLongitude(longitude);
            },
            fallbackError => {
              console.error('Fallback location error:', fallbackError);
              // SimpleToast.show(translate('Fallback_failed_Please_check_GPS_settings'));
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
          );
        } else {
          // SimpleToast.show(translate('Fallback_failed_Please_check_GPS_settings'));
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5000 }
    );
  }, [dispatch]);


  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        const fine = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
        const coarse = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

        if (
          fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          Alert.alert(
            translate("permission_required"),
            translate("permission_permantely_den"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
          return 'never_ask_again';
        }

        if (
          fine === PermissionsAndroid.RESULTS.DENIED ||
          coarse === PermissionsAndroid.RESULTS.DENIED
        ) {
          Alert.alert(
            translate("permission_required"),
            translate("permission_permantely_den"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
          return 'denied';
        }

        if (
          fine === PermissionsAndroid.RESULTS.GRANTED &&
          coarse === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return 'granted';
        }

        return 'unknown';
      } catch (error) {
        console.warn('Android location permission error:', error);
        return 'error';
      }
    } else if (Platform.OS === 'ios') {
      try {
        const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (status === RESULTS.GRANTED) {
          return 'granted';
        }

        if (status === RESULTS.DENIED) {
          const requestStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (requestStatus === RESULTS.GRANTED) {
            return 'granted';
          } else if (requestStatus === RESULTS.BLOCKED) {
            Alert.alert(
              translate("permission_required"),
              translate("permission_permantely_den"),
              [
                { text: translate("cancel"), style: 'cancel' },
                { text: translate("open_settings"), onPress: () => Linking.openSettings() },
              ]
            );
            return 'blocked';
          } else {
            Alert.alert(
              translate("permission_required"),
              translate("permission_permantely_den"),
              [
                { text: translate("cancel"), style: 'cancel' },
                { text: translate("open_settings"), onPress: () => Linking.openSettings() },
              ]
            );
            return 'denied';
          }
        }

        if (status === RESULTS.BLOCKED) {
          Alert.alert(
            translate("permission_required"),
            translate("permissionBlocked"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => openSettings() },
            ]
          );
          return 'blocked';
        }

        if (status === RESULTS.UNAVAILABLE) {
          Alert.alert(
            translate("Not_Available"),
            translate("permissionNotAvailable"),
            [{ text: translate("ok") }]
          );
          return 'unavailable';
        }

        return 'unknown';
      } catch (error) {
        console.warn('iOS location permission error:', error);
        return 'error';
      }
    }
  };

  const checkIfGpsEnabled = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 20000,
          fastInterval: 6000,
        });
        return true;
      } catch (err) {
        Alert.alert(
          translate("GPS_Required"),
          translate("Please_enable_GPS_for_location_properly"),
          [
            { text: translate("cancel"), style: 'cancel' },
            {
              text: translate("open_settings"),
              onPress: () =>
                Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS'),
            },
          ]
        );
        return false;
      }
    } else {
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          (position) => resolve(true),
          (error) => {
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    }
  }, []);


  const getUserDetailsVersion11 = async () => {
    if (isConnected) {
      try {
        // setLoaderApi(true);
        const headers = await GetApiHeaders();
        headers.companyCode = dynamicStyles.companyCode
        const response = await axios.post(
          `${APIConfig.BASE_URL}${APIConfig.dashboardDetails_v2}`,
          { languageId: headers.languageId },
          { headers: { ...headers, authType: 'JSONREQUEST' } }
        );
        if (response?.data?.statusCode === HTTP_OK) {
          setLoaderApi(false)
          console.log("headerts=-=->", headers)
          console.log("payload=-=->", "languageId:", headers.languageId)
          console.log("bacseUrl=-=->", `${APIConfig.BASE_URL}${APIConfig.dashboardDetails_v2}`)
          console
          const data = response?.data?.response;
          console.log("asaasas", JSON.stringify(data))
          const newDynamicStyles = existingDynamicStyles;
          console.log("datacheking=-=-=>", data)
          newDynamicStyles.languageId = (data?.languageId != undefined && data?.languageId != "" && data?.languageId != null) ? data?.languageId : "1";
          newDynamicStyles.companyName = (data?.companyName != undefined && data?.companyName != "" && data?.companyName != null) ? data?.companyName : "";
          newDynamicStyles.programName = (data?.programName != undefined && data?.programName != "" && data?.programName != null) ? data?.programName : "";
          newDynamicStyles.companyCode = (data?.companyCode != undefined && data?.companyCode != "" && data?.companyCode != null) ? data?.companyCode : "";
          newDynamicStyles.companyLogo = (data?.companyLogo != undefined && data?.companyLogo != "" && data?.companyLogo != null) ? data?.companyLogo : "";
          newDynamicStyles.primaryColor = (data?.primaryColor != undefined && data?.primaryColor != "" && data?.primaryColor != null) ? data?.primaryColor : "#ed3237";
          newDynamicStyles.secondaryColor = (data?.secondaryColor != undefined && data?.secondaryColor != "" && data?.secondaryColor != null) ? data?.secondaryColor : "#ffffff";
          newDynamicStyles.textColor = (data?.textColor != undefined && data?.textColor != "" && data?.textColor != null) ? data?.textColor : "#000000";
          newDynamicStyles.id = (data?.id != undefined && data?.id != "" && data?.id != null) ? data?.id : "0";
          if (data?.loaderLogo != undefined && data?.loaderLogo != "" && data?.loaderLogo != null) {
            const filePath = await downloadFileToLocal(false, data?.loaderLogo, data?.loaderLogo.split('/').pop())
            newDynamicStyles.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
            newDynamicStyles.programInfo = (data?.programInfo != undefined && data?.programInfo != "" && data?.programInfo != null) ? data?.programInfo : "";
            newDynamicStyles.companyInfo = (data?.companyInfo != undefined && data?.companyInfo != "" && data?.companyInfo != null) ? data?.companyInfo : "";
            newDynamicStyles.programLogo = (data?.programLogo != undefined && data?.programLogo != "" && data?.programLogo != null) ? data?.programLogo : "";
            newDynamicStyles.programLogoNew = (data?.programLogoNew != undefined && data?.programLogoNew != "" && data?.programLogoNew != null) ? data?.programLogoNew : "";
          } else {
            newDynamicStyles.loaderPath = "";
          }

          newDynamicStyles.firstName = (data?.firstName != undefined && data?.firstName != "" && data?.firstName != null) ? data?.firstName : "";
          newDynamicStyles.lastName = (data?.lastName != undefined && data?.lastName != "" && data?.lastName != null) ? data?.lastName : "";
          newDynamicStyles.pincode = (data?.pincode != undefined && data?.pincode != "" && data?.pincode != null) ? data?.pincode : "";
          newDynamicStyles.state = (data?.state != undefined && data?.state != "" && data?.state != null) ? data?.state : "";
          newDynamicStyles.district = (data?.district != undefined && data?.district != "" && data?.district != null) ? data?.district : "";
          newDynamicStyles.tahsil = (data?.tahsil != undefined && data?.tahsil != "" && data?.tahsil != null) ? data?.tahsil : "";
          newDynamicStyles.addressLine = (data?.addressLine != undefined && data?.addressLine != "" && data?.addressLine != null) ? data?.addressLine : "";
          newDynamicStyles.landMark = (data?.landMark != undefined && data?.landMark != "" && data?.landMark != null) ? data?.landMark : "";
          newDynamicStyles.villageLocation = (data?.villageLocation != undefined && data?.villageLocation != "" && data?.villageLocation != null) ? data?.villageLocation : "";
          newDynamicStyles.crop = (data?.crop != undefined && data?.crop != "" && data?.crop != null) ? data?.crop : "";
          newDynamicStyles.stateId = (data?.stateId != undefined && data?.stateId != "" && data?.stateId != null) ? data?.stateId : "";
          newDynamicStyles.districtId = (data?.districtId != undefined && data?.districtId != "" && data?.districtId != null) ? data?.districtId : "";
          newDynamicStyles.profilePic = (data?.profilePic != undefined && data?.profilePic != "" && data?.profilePic != null) ? data?.profilePic : "";
          dispatch(setCompanyStyle(newDynamicStyles));
          console.log("newDynamic=-=->", newDynamicStyles)

          setMarketPricesList(data?.userMenuControl[0])
          setMarketPriceList(data?.userMenuControl[0].marketPricesList)
          setMenuControler(data?.userMenuControl || []);
          dispatch(setMarketpriceData(data?.userMenuControl || []));
          console.log('refref', data?.userMenuControl);

          setDashboardMaster(data);
          await Promise.all([
            storeInAsyncStorage(REFERRALCODE, `${data?.referralCode}`),
            storeInAsyncStorage(STATE_ID, `${data?.stateId}`),
            storeInAsyncStorage(STATE_NAME, `${data?.state}`),
            storeInAsyncStorage(DISTRICT_ID, `${data?.districtId}`),
            storeInAsyncStorage(DISTRICT_NAME, `${data?.district}`),
          ]);
        } else if (response.data.statusCode === HTTP_601) {
          handleForceLogout()
          // showAlertWithMessage(
          //   translate('alert'),
          //   true,
          //   true,
          //   translate('alreadyLoggedMessage'),
          //   true,
          //   false,
          //   translate('logout'),
          //   translate('cancel')
          // );
          // setLoaderApi(false)

        } else {
          setLoaderApi(false)
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        // setLoaderApi(false);
      }

    } else {
      setLoaderApi(false)

      // SimpleToast.show(translate("no_internet_conneccted"))
    }
  }

  const getUserMenuControl = async () => {
    if (isConnected) {

      try {
        // setLoaderApi(true);
        const headers = await GetApiHeaders();
        headers.companyCode = dynamicStyles.companyCode
        const url = `${APIConfig.BASE_URL}${APIConfig.users_checkIconsStatus}`
        // console.log("calleeddddd",headers)
        const response = await axios.get(url, { headers })

        if (response?.data?.response && response?.data?.statusCode === HTTP_OK) {
          console.log("repo=-=->", response?.data?.response)
          setAdvanceKnVisible(response?.data?.response?.adkc)
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        // setLoaderApi(false);
      }

    } else {
      // SimpleToast.show(translate("no_internet_conneccted"))
    }
  }


  const handleForceLogout = async () => {
    try {
      logoutMethod()
      // await Promise.all([
      //   deleteFromAsyncStorage(USER_ID),
      //   deleteFromAsyncStorage(MOBILENUMBER),
      //   deleteFromAsyncStorage(USERNAME),
      //   deleteFromAsyncStorage(REFERRALCODE),
      //   deleteFromAsyncStorage(USER_IMG),
      //   deleteFromAsyncStorage(STATE_ID),
      //   deleteFromAsyncStorage(STATE_NAME),
      //   deleteFromAsyncStorage(DISTRICT_ID),
      //   deleteFromAsyncStorage(DISTRICT_NAME),
      //   deleteFromAsyncStorage(FIRSTNAME),
      //   deleteFromAsyncStorage(LASTNAME),
      //   deleteFromAsyncStorage(OFFLINETOTALCOUNT),
      //   deleteFromAsyncStorage(COMPANYCODE),
      //   removeDatbaseData(),
      //   clearDownloadedImages()
      // ]);
      // dispatch(setCompanyStyle({}));
      // navigation.replace('LoginScreenRn');
    } catch (error) {
      console.error('Error during logout:', error);
      SimpleToast.show(translate('logout_error') || 'Failed to log out');
    }
  }

  useEffect(() => {
    if (!staticServiceBe || !staticServiceBe.servicesList) return;

    const updatedServicesList = staticServices.servicesList.map(staticItem => {
      const beItem = staticServiceBe.servicesList.find(be => be.title === staticItem.title);
      console.log("betItem", beItem)
      if (beItem) {
        return {
          ...staticItem,
          visible: beItem.visible,
          status: beItem.status
        };
      }
      return staticItem;
    });

    setStaticServices(prev => ({
      ...prev,
      servicesList: updatedServicesList
    }));

  }, [staticServiceBe]);

  useEffect(() => {
    if (!staticOthersBe || !staticOthersBe.servicesList) return;

    const updatedServicesList = staticOthers.servicesList.map(staticItem => {
      const beItem = staticOthersBe.servicesList.find(be => be.title.trim() === staticItem.title.trim());
      if (beItem) {
        return {
          ...staticItem,
          visible: beItem.visible,
          status: beItem.status
        };
      }
      return staticItem;
    });

    setStaticOthers(prev => ({
      ...prev,
      servicesList: updatedServicesList
    }));
  }, [staticOthersBe]);

  // useEffect(() => {
  //   if (route?.params?.title === CASHBACKSCAN) {
  //     setGenunityResponse(route?.params?.response ? route?.params?.response : null)
  //   }
  // }, [route?.params?.title,genunityResponse])
  useFocusEffect(
    useCallback(() => {
      if (route?.params?.title === CASHBACKSCAN) {
        setGenunityResponse(
          route?.params?.response ? route?.params?.response : null
        );
        navigation.setParams({ title: undefined, response: undefined });
      }
      if (route?.params?.title === CASHBACKSCAN2) {
        setAlertModal(true)
        setAlertTextContent(route?.params?.message ? route?.params?.message : translate("Unable_to_process_scan_the_moment"))
        navigation.setParams({ title: undefined, message: undefined });
      }

      return () => {
        // optional cleanup when screen loses focus
      };
    }, [route?.params?.title, route?.params?.response])
  );

  const alertCloseHandle = () => {
    setAlertModal(false)
  }

  const getMenuController = async () => {
    if (isConnected) {
      try {
        // setLoaderApi(true);
        const headers = await GetApiHeaders();
        headers.companyCode = dynamicStyles.companyCode
        const response = await axios.post(
          `${APIConfig.BASE_URL}${APIConfig.users_UserMenuAccessDetails}`,
          { languageId: headers.languageId },
          { headers: { ...headers, authType: 'JSONREQUEST' } }
        );
        console.log("menuReponseUserDashboard=-=->", JSON.stringify(response.data))
        if (response?.data?.statusCode === HTTP_OK) {
          storeData(USERMENUCONTROL, response?.data?.response?.userMenuControl)
          if (response?.data?.response?.userMenuControl?.Services) {

            setStaticServiceBe(response?.data?.response?.userMenuControl?.Services)
          }
          if (response?.data?.response?.userMenuControl?.Others) {
            setStaticOthersBe(response?.data?.response?.userMenuControl?.Others)
          }
          if (response?.data?.response?.userMenuControl?.More) {
            if (response?.data?.response?.userMenuControl?.More?.servicesList && response?.data?.response?.userMenuControl?.More?.servicesList?.length > 0) {
              if (response?.data?.response?.userMenuControl?.More?.servicesList) {
                dispatch(setTabMenuControl(response?.data?.response?.userMenuControl?.More?.servicesList || []));
                setMandipriceVisible(response?.data?.response?.userMenuControl?.More?.servicesList[1]?.visible)
                setHelpDeskVisible(response?.data?.response?.userMenuControl?.More?.servicesList[4]?.visible)
                setRewardsVisible(response?.data?.response?.userMenuControl?.More?.servicesList[2]?.visible)
                setFaqVisible(response?.data?.response?.userMenuControl?.More?.servicesList[3]?.visible)
              }
            }
          }
          if(response?.data?.response?.nearbyPageLink){
            dispatch(setNearBy(response?.data?.response?.nearbyPageLink || ""))
          }
          setMarketPriceVisible(response?.data?.response?.userMenuControl["Market Prices"].visible)
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        // setLoaderApi(false);
      }

    } else {
      const userMenuControl = await retrieveData(USERMENUCONTROL)
      console.log("userMenuControl", userMenuControl)
      if (userMenuControl?.Services) {
        setStaticServiceBe(userMenuControl?.Services)
      }
      if (userMenuControl?.Others) {
        setStaticOthersBe(userMenuControl?.Others)
        dispatch(setTabMenuControl(userMenuControl?.More?.servicesList || []));
      }
    }
  }

  const getWeatherDetails = useCallback(async () => {
    if (!isConnected || !latitude || !longitude) {
      // setLoaderApi(false);
      return;
    }

    try {
      const headers = await GetApiHeaders();
      const response = await axios.post(
        `${APIConfig.BASE_URL_NVM}${APIConfig.getWeatherDetails}`,
        {
          latitude,
          longitude,
          mobileNumber: headers.mobileNumber,
          userId: headers.userId,
        },
        { headers }
      );

      if (response.data.statusCode === HTTP_OK) {
        if (response?.data?.response?.dailyBaseWeatherInfo) {
          setWeatherInfo(response?.data?.response?.dailyBaseWeatherInfo?.forecast[0] || {});
        }
        setWeatherVisible(response?.data?.response?.isVisible)
      } if (response.data.statusCode == 403) {
        // setWeatherInfo({});
        setWeatherVisible(response?.data?.response?.isVisible)
      }
    } catch (error) {
      console.error('Error fetching weather details:', error);
    } finally {
      // setLoaderApi(false)
    }
  }, [isConnected, latitude, longitude]);

  const fellowFarmerNameHandle = useCallback(value => {
    setFellowFarmerName(value.replace(/[^A-Za-z ]+/g, '').replace(/^\s+/, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)/g, '').trim());
    setFellowFarmerNameValidation(false);
    setFellowFarmerNameValidationContent('');
  }, []);

  const fellowFarmerMobileHandle = useCallback(value => {
    setFellowFarmerMobileNumber(value.replace(/[^0-9]/g, '').replace(/^[^6-9]+/, ''));
    setFellowFarmerMobileValidation(false);
    setFellowFarmerMobileValidationContent('');
  }, []);


  const requestCameraPermission = async (value) => {
    if (Platform.OS == 'android') {
      const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      const result = await PermissionsAndroid.request(permission);
      console.log("checakRe-0-0-9>", result)
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        if (isConnected) {
          navigationProductScan(value)
        } else {
          SimpleToast.show(translate('no_internet_conneccted'))
        }
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else if (Platform.OS == 'ios') {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        if (isConnected) {
          navigationProductScan(value)

        } else {
          SimpleToast.show(translate('no_internet_conneccted'))

        }
      } else if (status === RESULTS.BLOCKED) {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  const cashBackScanRequestCameraPermission = async (value) => {
    if (Platform.OS == 'android') {
      const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      const result = await PermissionsAndroid.request(permission);
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        if (isConnected) {
          navigation.navigate('CashBackScan', { screenName: value })
        } else {
          SimpleToast.show(translate('no_internet_conneccted'))
        }
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else if (Platform.OS == 'ios') {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        if (isConnected) {
          navigation.navigate('CashBackScan', { screenName: value })

        } else {
          SimpleToast.show(translate('no_internet_conneccted'))

        }
      } else if (status === RESULTS.BLOCKED) {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  const cashbackScanBothLocationandCameraHandle = async (value) => {
    // LOCATION PERMISSION
    const locationPermission = await requestLocationPermission();
    if (locationPermission !== "granted") {
      return;
    }
    // GPS ENABLE CHECK
    const isGpsEnable = await checkIfGpsEnabled();
    if (!isGpsEnable) {
      return;
    }

    // CAMERA PERMISSION
    let cameraPermissionGranted = false;

    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        cameraPermissionGranted = true;
      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: "cancel" },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

    } else {

      const status = await request(PERMISSIONS.IOS.CAMERA);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        cameraPermissionGranted = true;
      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: "cancel" },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    }

    // FINAL CHECK (BOTH)
    if (locationPermission === "granted" && cameraPermissionGranted) {

      if (isConnected) {
        navigation.navigate("CashBackScan", { screenName: value });
      } else {
        SimpleToast.show(translate("no_internet_conneccted"));
      }

    }
  };

  const fromProductScancashbackScanBothLocationandCameraHandle = async (value) => {
    // LOCATION PERMISSION
    const locationPermission = await requestLocationPermission();
    if (locationPermission !== "granted") {
      return;
    }
    // GPS ENABLE CHECK
    const isGpsEnable = await checkIfGpsEnabled();
    if (!isGpsEnable) {
      return;
    }

    // CAMERA PERMISSION
    let cameraPermissionGranted = false;

    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        cameraPermissionGranted = true;
      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: "cancel" },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

    } else {

      const status = await request(PERMISSIONS.IOS.CAMERA);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        cameraPermissionGranted = true;
      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: "cancel" },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    }

    // FINAL CHECK (BOTH)
    if (locationPermission === "granted" && cameraPermissionGranted) {

      if (isConnected) {
        navigation.navigate("CashBackScan", { screenName: value });
      } else {
        SimpleToast.show(translate("no_internet_conneccted"));
      }

    }
    setProductScanModalOpen(false);

  };


  const navigationProductScan = useCallback(async (value) => {

    navigation.navigate('QRScannerRn', {
      type: value,
      fellowFarmerName: '',
      fellowFarmerMobileNumber: '',
    });
    setProductScanModalOpen(false);
  }, [navigation]);

  const fellowFarmersSubmitHandle = useCallback(() => {
    if (!fellowFarmerName) {
      setFellowFarmerNameValidation(true);
      setFellowFarmerNameValidationContent(translate('Please_Enter_Name'));
    } else if (fellowFarmerName.length < 3) {
      setFellowFarmerNameValidation(true);
      setFellowFarmerNameValidationContent(translate('Please_Enter_Valid_Name'));
    } else if (!fellowFarmerMobileNumber) {
      setFellowFarmerMobileValidation(true);
      setFellowFarmerMobileValidationContent(translate('Please_Enter_Mobile_Number'));
    } else if (fellowFarmerMobileNumber.length !== 10) {
      setFellowFarmerMobileValidation(true);
      setFellowFarmerMobileValidationContent(translate('Please_enter_valid_mobile_number'));
    } else if (fellowFarmerMobileNumber === userData.mobileNumber) {
      setFellowFarmerMobileValidation(true);
      setFellowFarmerMobileValidationContent(translate("Fellow_farmer_number"));
    } else {
      requestPermissions();
    }
  }, [fellowFarmerName, fellowFarmerMobileNumber, requestPermissions]);




  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      const androidVersion = DeviceInfo.getSystemVersion();
      const permissions = [PermissionsAndroid.PERMISSIONS.CAMERA];
      const result = await PermissionsAndroid.requestMultiple(permissions);
      if (result['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED) {
        navigation.navigate('QRScannerRn', {
          type: farmerType,
          fellowFarmerName,
          fellowFarmerMobileNumber,
        });
        setProductScanModalOpen(false);

      } else {
        Alert.alert(
          translate("Camera_Permission_Required"),
          translate("Please_enable_camera_access_QR_codes"),
          [
            { text: translate("cancel"), style: 'cancel' },
            { text: translate("open_settings"), onPress: () => Linking.openSettings() },
          ]
        );
        setProductScanModalOpen(false);

      }
    }
    else if (Platform.OS === 'ios') {
      // 1) Check current camera permission status
      const status = await check(PERMISSIONS.IOS.CAMERA);

      if (status === RESULTS.GRANTED) {
        navigation.navigate('QRScannerRn', {
          type: farmerType,
          fellowFarmerName,
          fellowFarmerMobileNumber,
        });
        setProductScanModalOpen(false);

      } else {
        // 2) Request camera permission
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);

        if (requestResult === RESULTS.GRANTED) {
          navigation.navigate('QRScannerRn', {
            type: farmerType,
            fellowFarmerName,
            fellowFarmerMobileNumber,
          });
        } else {
          Alert.alert(
            translate("Camera_Permission_Required"),
            translate("Please_enable_camera_access_QR_codes"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openSettings() },
            ]
          );
        }
        setProductScanModalOpen(false);
      }
    }
  }, [navigation, farmerType, fellowFarmerName, fellowFarmerMobileNumber]);



  // const showPermissionAlert = (type) => {
  //   const title = 'permission_required';
  //   const message = type === 'camera' ? 'cameraDesc' : 'galleryDesc';
  //   const cancelText = 'cancel';
  //   const settingsText = 'open_settings';

  //   Alert.alert(translate(title), translate(message),
  //     [
  //       {
  //         text: translate(cancelText),
  //         style: 'cancel'
  //       },
  //       {
  //         text: translate(settingsText),
  //         onPress: () => Linking.openSettings()
  //       }
  //     ],
  //     { cancelable: true }
  //   );
  // };

  // const checkPermissions = useCallback(async () => {
  //   const cameraStatus = await check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA);
  //   setCameraPermission(cameraStatus);
  //   if (cameraStatus !== RESULTS.GRANTED) {
  //     requestPermissions2();
  //   }
  // }, [requestPermissions2]);

  // const requestPermissions2 = useCallback(async () => {
  //   if (cameraPermission !== RESULTS.GRANTED) {
  //     const newCameraStatus = await request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA);
  //     setCameraPermission(newCameraStatus);
  //   }
  // }, [cameraPermission]);

  const handleFarmerType = useCallback(value => {
    setFarmerType(value);
    setFellowFarmerName('')
    setFellowFarmerMobileNumber('')
    setFellowFarmerVisible(false);
  }, []);

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
      setLoaderApi(false)
      return;
    }

    try {
      setLoaderApi(true);
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
        setLoaderApi(false)


      } else {
        setLoaderApi(false)

        SimpleToast.show(apiCallLogout.data.message)
      }

    } catch (error) {
      setLoaderApi(false)

      console.log("Logout error:", error.response?.data || error.message);
    }
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
        });
        console.log("Successfully deleted all Realm data");
      }
    } catch (realmError) {
      console.error('Error deleting objects from Realm:', realmError);
    }
  };

  const handleOkPress = useCallback(async () => {
    if (alertMessage === translate('alreadyLoggedMessage')) {
      try {
        logoutMethod()
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
      } catch (error) {
        console.error('Error during logout:', error);
        SimpleToast.show(translate('logout_error') || 'Failed to log out');
      }
    } else if (alertMessage === strings.update_message) {
      Linking.openURL(Platform.OS === 'ios' ? appStoreLink : playStore);
    }
    setAlertVisible(false);
  }, [alertMessage, dispatch, navigation]);

  const handleNoPress = useCallback(() => {
    setAlertVisible(false);
  }, []);

  const showAlertWithMessage = useCallback((title, header, headerText, message, yesBtn, noBtn, yesText, noText) => {
    setAlertTitle(title);
    setShowAlertHeader(header);
    setShowAlertHeaderText(headerText);
    setAlertMessage(message);
    setShowAlertYesButton(yesBtn);
    setShowAlertNoButton(noBtn);
    setShowAlertYesButtonText(yesText);
    setShowAlertNoButtonText(noText);
    setAlertVisible(true);
  }, []);

  const checkForceUpdate = useCallback(() => {
    const subscriber = firestore()
      .collection(FIREBASE_VERSION_COLLECTION_NAME)
      .doc(FIREBASE_VERSION_DOC_ID)
      .onSnapshot(
        documentSnapshot => {
          if (documentSnapshot?.exists) {
            const data = documentSnapshot.data();
            if (data) {
              setTimeout(() => {
                if (Platform.OS == "android") {
                  checkAppversionUpdate(data);
                } else {
                  checkAppversionUpdateIOS(data);
                }
              }, 500);

            }
          }
        },
        error => {
          console.error('Error fetching Firestore document:', error);
        }
      );
    return () => subscriber();
  }, []);

  const checkAppversionUpdate = useCallback(async documentSnapshot => {
    try {
      const appVersionCode = await getBuildNumber();
      const appVersion = Platform.OS === 'ios' ? documentSnapshot.iosAppVersion : documentSnapshot.androidAppVersion;
      const isUAT = !APP_ENV_PROD;
      const targetVersion = isUAT ? Platform.OS == "ios" ? documentSnapshot?.iosAppVersionUAT : documentSnapshot?.androidAppVersionUAT : appVersion;


      if (targetVersion && targetVersion > appVersionCode) {
        const isMandatory = Platform.OS === 'android' ? documentSnapshot.isMandatoryForAndroid : documentSnapshot.isMandatoryForIos;

      }
    } catch (error) {
      console.error('Error in checkAppversionUpdate:', error);
    }
  }, []);
  async function checkAppversionUpdateIOS(documentSnapshot) {
    // const localVersion = DeviceInfo.getVersion(); // Need to change for Android in future
    const localVersion = await getAppVersion();
    let remoteVersion = '';

    if (APP_ENV_PROD) {
      if (Platform.OS === 'android') {
        remoteVersion = documentSnapshot.androidAppVersion;
      } else {
        remoteVersion = documentSnapshot.iosAppVersion;
      }
    } else {
      if (Platform.OS === 'android') {
        remoteVersion = documentSnapshot.androidAppVersionUAT;
      } else {
        remoteVersion = documentSnapshot.iosAppVersionUAT;
      }
    }
    let showForceUpdate = Platform.OS == 'ios' ? documentSnapshot?.showForceUpdateIOS : documentSnapshot?.showForceUpdate;
    let isMandatory = Platform.OS == 'ios' ? documentSnapshot.isMandatoryForIos : documentSnapshot.isMandatoryForAndroid;

    console.log(`Local: ${localVersion} | Remote: ${remoteVersion}`);
    if (compareVersions(localVersion, remoteVersion) < 0) {
      // showAlertWithMessage(strings.alert, true, true, documentSnapshot.message || strings.update_message, true, !isMandatory, strings.update, strings.cancel);
    }
  }



  const onRefresh = async () => {
    if (isConnected) {
      setRefreshing(true);
      await newKnowledgeCenter()
      await getUserMenuControl()
      await getMenuController()
      // await fetchKnowledgeCenterRefreshGoldClud()
      await GetUserLocation();
      await getUserDetailsVersion11();
      await fetchHybridsAndIssueTypesAndCrops()
      // await fetchKnowledgeCenter()
      await fetchKnowledgeCenterRefresh()
      await goldClubFetchKnowledgeCenterRefresh()
      await fetchSamadhanHistory()
      // await ShowHistory()
      await ShowHistoryRefresh()
      await geSeedAndPopulationCaculator();
      await getYieldCalcutlor();
      await getFertilizerCalc();
      await getFertilizersMaster2()
      setRefreshing(false);
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
      setRefreshing(false);
    }
  }

  const handleMandiNavigations = () => {
    if (isConnected) {
      navigation.navigate('MandiPricesScreen', { productList: menuControler.find(item => item.layout === 'Market Prices')?.marketPricesList || [] });
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
    }
  }
  const navigationNearBy = async () => {
    const hasPermission = await requestLocationPermission()
    const isGpsEnable = await checkIfGpsEnabled()
    if (isGpsEnable) {
      if (hasPermission === "granted") {
        if (isConnected) {
          if (latitude) {
            if(nearByLink){
            navigation.navigate('NearByScreen')
            }else{
              SimpleToast.show(translate("No_data_available"))
            }
          } else {
            fetchCurrentLocation()
            SimpleToast.show(translate("location_error"))
          }
        } else {
          SimpleToast.show(translate("no_internet_conneccted"))
        }
      }
    }
  }

  const handleServiceClickNavigations = (title, subTitle) => {
    console.log("ico=-=-=>", title, subTitle)
    if (title === "Calculator") {
      setListCalculatorsVisible(true)
    } else if (title === "Knowledge") {
      navigation.navigate('KnowledgeCenterRn')
    } else if (subTitle === "Nearby") {
      navigationNearBy()
      // if (isConnected) {
      //   navigation.navigate('NearByScreen')
      // } else {
      //   SimpleToast.show(translate('no_internet_conneccted'))
      // }
    } else if (title === "Sample") {
      navigation.navigate('GeoTaggingScreen')
    } else if (subTitle === "Diagnostic") {
      if (isConnected) {
        navigation.navigate('CropDiagonstic')
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    } else if (title === "Advice") {
      if (isConnected) {
        navigation.navigate('Agronomy')
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    } else if (subTitle === "Scan") {
      setProductScanModalOpen(true)
      setFellowFarmerVisible(true)
    } else if (title === "Refer") {
      navigation.navigate('ReferralScreen')
    } else if (title === "Dipstick") {
      if (isConnected) {
        navigation.navigate('DipstickSurveyRn')
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    } else if (title === "Book") {
      navigation.navigate('BookSeeds')
    } else if (title === "Meet") {
      navigation.navigate('MeetFellowFarmer')
    } else if (title === "Invite") {
      navigation.navigate('InviteFarmerMeeting')
    } else if (subTitle === "Pest Forecast") {
      navigationPest()

    } else if (subTitle === "Knowledge Center") {
      if (isConnected) {
        navigation.navigate("AdvancedKnowledgeCenter")
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    } else if (subTitle === "Field Activity QR") {
      if (isConnected) {
        requestCameraPermission(FIELDACTIVITYQR)
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    } else if (title === "Scan & Earn") {
      cashbackScanBothLocationandCameraHandle(title)
      // cashBackScanRequestCameraPermission(title)
    }
    else if (title === "RedeemCash") {
      dispatch(setCashBackModal(false))
      setCashBackSelected("")
      navigation.navigate("CashFreeTransactionsActivity");
    }

  }

  const yieldScreenNavigation = () => {
    setSelectedCalculator('Yield');
    setTimeout(() => {
      setListCalculatorsVisible(false);
      navigation.navigate('YieldCalculator');
    }, 1000);
  }

  const fertilizerScreenNavigation = () => {
    setSelectedCalculator('fertilizer');
    setTimeout(() => {
      setListCalculatorsVisible(false);
      navigation.navigate('FertilizerSeeds');
    }, 1000);
  }

  const seedScreenNavigation = () => {
    setSelectedCalculator('Seed');
    setTimeout(() => {
      setListCalculatorsVisible(false);
      navigation.navigate('SeedsCalculator');
    }, 1000);
  }

  const rewardPointsCashbackNavigation = (navigationScreenName, value) => {
    setCashBackSelected(value)
    setTimeout(() => {
      dispatch(setCashBackModal(false))
      navigation.navigate(navigationScreenName);
      setCashBackSelected("")
    }, 100);
  }

  const closeCalculatorModal = useCallback(() => {
    setListCalculatorsVisible(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setProductScanModalOpen(false);
    setFellowFarmerName('');
    setFellowFarmerMobileNumber('');
    setFellowFarmerVisible(true);
    setFellowFarmerNameValidation(false);
    setFellowFarmerNameValidationContent('');
    setFellowFarmerMobileValidation(false);
    setFellowFarmerMobileValidationContent('');
  }, []);

  const GetUserLocation = useCallback(async () => {
    if (!isConnected) return;
    try {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
        },
        error => {
          if (error.code === 3 || error.code === 2) {
            Geolocation.getCurrentPosition(
              position => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
              },
              () => GetUserLocation(),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
            );
          }
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      // SimpleToast.show(translate('An_unexpected_error_occurred_Please_try_again'));
    }
  }, [isConnected]);


  const requestStoragePermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          // console.log('Storage permissions granted');
        } else {
          // SimpleToast.show(translate('Storage_permission_denied'));
        }
      } catch (err) {
        console.error('Error requesting storage permissions:', err);
      }
    }
  };

  const renderServiceItems = ({ item }) => {
    const advanceKnowled = item.title === "Advanced" && advanceKnVisible && isConnected
    // console.log("checakinaspopo>",item)
    return (
      <>
        {item.visible &&
          <TouchableOpacity disabled={!item?.status} onPress={() => handleServiceClickNavigations(item.subTitle, item.title)} style={styles.serviceListContainer}>
            <View style={styles.serviceListSubContainer}>
              {!item?.status && <Image source={require('../../assets/Images/comingSoon.png')} style={styles.comingSoonIcon} />}
              <Image source={item.serviceImage} style={styles.serviceImgs} />
            </View>
            <View style={styles.serviceTextContainer}>
              {item?.translatedElement &&
                <Text style={[styles.serviceSubText, { fontFamily: fonts.Regular }]}>{translate(item.translatedElement)}</Text>
              }
              {item?.translatedTitle &&
                <Text style={[styles.serviceMainText, { color: item.fontColor, fontFamily: fonts.SemiBold }]}>{translate(item.translatedTitle)}</Text>
              }
            </View>
          </TouchableOpacity>
        }
      </>
    );
  }

  const renderMarketPricesItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('CropDetailsScreen', {
            minPrice: item.minPrice,
            maxPrice: item.maxPrice,
            name: item.productName,
            marketName: item.marketName,
            productImage: item.productImage,
            origin: 'Home',
          });
        }}
        style={styles.marketPriceMainContainer}
      >
        <Image source={{ uri: item.productImage }} style={styles.marketPriceImg} />
        <View style={styles.marketPriceContentContainer}>
          <Text style={[styles.marketProductName, { fontFamily: fonts.SemiBold }]}>{item.productName}</Text>
          <Text style={[styles.marketPriceName, { fontFamily: fonts.Regular }]}>{item.marketName}</Text>
          <View style={styles.marketImgContainer}>
            <Image source={require('../../assets/Images/downPrice.png')} style={styles.downPriceIcon} />
            <Text style={[styles.marketPriceText, { fontFamily: fonts.SemiBold }]}>{`${item.priceUnit}${item.productPrice}/${item.productUnit}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const servicesStatic = () => (
    <View style={styles.servicesStaticContainer}>
      <View style={styles.headerFlatList}>
        <Image source={staticServices.layoutIcon} style={styles.layoutIcon} />
        <Text style={[styles.serviceText, { fontFamily: fonts.SemiBold }]}>{translate(staticServices.displayName)}</Text>
      </View>
      <FlatList
        // ListEmptyComponent={() => <Text style={styles.noDataText}>{translate('No_data_available')}</Text>}
        numColumns={4}
        data={staticServices.servicesList.filter((item) => item.visible)}
        renderItem={renderServiceItems}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={4}
      />
    </View>
  );

  const servicesOthers = () => (
    <View style={styles.servicesStaticContainer}>
      <View style={styles.headerFlatList}>
        <Image source={staticOthers.layoutIcon} style={styles.layoutIcon} />
        <Text style={[styles.serviceText, { fontFamily: fonts.SemiBold }]}>{translate(staticOthers.displayName)}</Text>
      </View>
      <FlatList
        // ListEmptyComponent={() => <Text style={styles.noDataText}>{translate('No_data_available')}</Text>}
        numColumns={4}
        data={staticOthers.servicesList.filter((item) => item.visible)}
        renderItem={renderServiceItems}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={4}
      />
    </View>
  );

  const navigationPest = async () => {
    const hasPermission = await requestLocationPermission()
    const isGpsEnable = await checkIfGpsEnabled()
    if (isGpsEnable) {
      if (hasPermission === "granted") {
        if (isConnected) {
          if (latitude) {
            dispatch(setWeatherTitle("PestForecast"));

            navigation.navigate('WeatherScreen', { enablePestForecast: true, itemData: weatherTwo, latitude, longitude, visible: weatherVisible, title: translate("PestForecast") })
          } else {
            fetchCurrentLocation()
            SimpleToast.show(translate("location_error"))
          }
        } else {
          SimpleToast.show(translate("no_internet_conneccted"))
        }
      }
    }
  }

  const naviagtionWeather = async () => {
    const hasPermission = await requestLocationPermission()
    const isGpsEnable = await checkIfGpsEnabled()
    if (isGpsEnable) {
      if (hasPermission === "granted") {
        if (isConnected) {
          if (weatherInfo) {
            dispatch(setWeatherTitle("weather"));
            navigation.navigate('WeatherScreen', { itemData: weatherInfo, latitude, longitude, visible: weatherVisible, title: translate("weather") })
          } else {
            fetchLocation()
            SimpleToast.show(translate("location_error"))
          }
        } else {
          SimpleToast.show(translate("no_internet_conneccted"))
        }
      }
    }
  }

  return (
    <View style={styles.homeMainContainer}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />}
      <View style={[styles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
        <View style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
          {dynamicStyles.companyCode === '1100' && <Image source={require('../../assets/Images/staticSubeejIcon.png')} style={styles.subeejIcon} />}
          {dynamicStyles.companyCode === '1400' && <Image source={require('../../assets/Images/staticPrabathIcon.png')} style={styles.subeejIcon} />}
          {dynamicStyles.companyCode === '1300' && <Image source={require('../../assets/Images/staticPravardhanIcon.png')} style={styles.subeejIcon} />}
          {dynamicStyles.companyCode === '1900' && <Image source={require('../../assets/Images/staticLakshmiProgramIcon.png')} style={styles.subeejIcon} />}
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.profileSubContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('MoreScreenRn', { companyName: dynamicStyles.companyName })}>
              <View style={styles.farmerIconContainer}>
                {/* {userData?.userPic ?
                  <Image source={{ uri: userData.userPic }} style={userData?.userPic ? styles.farmerIcon1 : styles.farmerIcon} />
                  : <Image source={defaultImage} style={userData?.userPic ? styles.farmerIcon1 : styles.farmerIcon} />
                } */}
                {userData?.userPic ?
                  <>
                    {isConnected ? <Image source={{ uri: userData.userPic }} style={userData?.userPic ? styles.farmerIcon1 : styles.farmerIcon} />
                      : <Image source={defaultImage} style={userData?.userPic ? styles.farmerIcon1 : styles.farmerIcon} />}
                  </>
                  : <Image source={defaultImage} style={userData?.userPic ? styles.farmerIcon1 : styles.farmerIcon} />
                }
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <View style={styles.greetingSmileContainer}>
                  <Text style={[styles.greetingstText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.Regular }]}>{greeting}</Text>
                  <Image source={require('../../assets/Images/smileIconImg.png')} style={[styles.smileIcon, { tintColor: dynamicStyles.secondaryColor }]} />
                </View>
                <Text style={[styles.userNameText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{userData?.userName}</Text>
              </View>
            </View>

          </View>
        </View>
        <View style={{ flexDirection: "row", position: "absolute", right: width * 0.02, top: Platform.OS == "ios" ? height * 0.05 : height * 0.01 }}>
          <TouchableOpacity
            onPress={() => { callApiofflineSynch(true) }}
            style={{
              marginRight: 10
              // position: 'absolute',
              //  right: width * 0.15,
              // bottom: height * 0.2,
            }}
          >
            <View style={{ position: 'relative' }}>
              <Image
                source={require('../../assets/Images/upload.png')}
                style={{ height: 30, width: 30, tintColor: dynamicStyles.secondaryColor }}
              />

              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: 'red',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ color: 'white', fontSize: 10, textAlign: 'center', fontFamily: fonts.Bold }}>
                  {uploadTotalCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onRefresh()} style={{
            alignSelf: "flex-start", marginLeft: 10, marginRight: 5
          }}>
            <Image source={require("../../assets/Images/RefreshIcon.png")} style={{ height: 30, width: 30, tintColor: dynamicStyles.secondaryColor }} />
          </TouchableOpacity>
        </View>

        {weatherVisible &&
          <>
            {weatherInfo?.max_temp &&
              <TouchableOpacity style={styles.weatherMainContainer} onPress={() => naviagtionWeather()}>
                <View style={styles.degreesTextContainer}>
                  <Text style={[styles.degreeText, { color: dynamicStyles.textColor, fontFamily: fonts.Bold }]}>
                    {`${!isNaN(weatherInfo?.max_temp) ? Math.round(weatherInfo.max_temp).toString() : ''}`}
                    <Text style={[styles.caliciousText, { fontFamily: fonts.Bold }]}>°C</Text>
                  </Text>
                  <Text style={[styles.degreesHighsText, { fontFamily: fonts.Regular }]}>
                    {translate('high')} {!isNaN(weatherInfo?.max_temp) ? Math.round(weatherInfo.max_temp).toString() : ''}°{' '}
                    {translate('low')} {!isNaN(weatherInfo?.min_temp) ? Math.round(weatherInfo.min_temp).toString() : ''}°
                  </Text>
                </View>
                <View style={styles.line} />
                <View style={styles.degreenSecondPartContainer}>
                  <Image source={require('../../assets/Images/cloudeIconImg.png')} style={styles.cloudImgIcon} />
                  <View style={styles.locationDetailsMainContainer}>
                    <View style={styles.locationDetailsContainer}>
                      <Image source={require('../../assets/Images/locationImgIcon.png')} style={styles.locationIcon} />
                      <Text style={[styles.locationText, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]}>{normalizeText(weatherInfo?.city)}</Text>
                    </View>
                    <Text style={[styles.weatherReportText, { fontFamily: fonts.SemiBold }]}>{weatherInfo?.weather_description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            }

          </>
        }

        <Image source={require('../../assets/Images/flowerIcon.png')} style={styles.flowerIcon} />
      </View>
      <View style={styles.flatListContainer}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()} colors={['#ff0000', '#00ff00', '#0000ff']} />}
          nestedScrollEnabled
        >
          {servicesList.length > 0 && servicesStatic()}
          {othersList.length > 0 && servicesOthers()}
          {!loaderApi && (
            <>
              {marketPriceVisible &&
                <>
                  {marketPriceFlatList.length > 0 &&
                    <View style={styles.headerFlatListMarket}>
                      <Image source={{ uri: marketPricesList.layoutIcon }} style={styles.layoutIcon} />
                      <Text style={[styles.serviceText, { fontFamily: fonts.SemiBold }]}>{translate("market_price")}</Text>
                    </View>
                  }
                  <FlatList
                    // ListEmptyComponent={() => <Text style={styles.noDataText}>{translate('No_data_available')}</Text>}
                    numColumns={2}
                    data={marketPriceFlatList}
                    renderItem={renderMarketPricesItem}
                    scrollEnabled={false}
                  />
                </>
              }
            </>

          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <Modal animationType="slide" transparent visible={listCalculatorsVisible}>
        <TouchableWithoutFeedback onPress={closeCalculatorModal}>
          <View style={styles.modalMainContainer}>
            <View style={styles.modalSubContainer}>
              <View style={styles.modalSelectCalMainContainer}>
                <Text style={[styles.modalSelectText, { fontFamily: fonts.SemiBold }]}>{translate('select')}</Text>
                <TouchableOpacity onPress={closeCalculatorModal}>
                  <Image source={require('../../assets/Images/crossIcon.png')} style={styles.modalCrossIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.calculatorOptionsContainer}>
                <TouchableOpacity onPress={seedScreenNavigation} style={styles.selectedCalculatorContainer}>
                  <View style={[styles.calculatorIconContainer, { borderColor: selectedCalculator === 'Seed' ? dynamicStyles.primaryColor : '#F2F6F9' }]}>
                    <Image source={require('../../assets/Images/seedcalIcon.png')} style={styles.subeejIcon1} />
                  </View>
                  <Text style={[styles.selectedCalculatorText, { color: selectedCalculator === 'Seed' ? dynamicStyles.primaryColor : '#33527D', fontFamily: fonts.Bold }]}>
                    {translate('seed_population_calculator')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={fertilizerScreenNavigation} style={styles.selectedCalculatorContainer}>
                  <View style={[styles.calculatorIconContainer, { borderColor: selectedCalculator === 'fertilizer' ? dynamicStyles.primaryColor : '#F2F6F9' }]}>
                    <Image source={require('../../assets/Images/fertilizerIcon.png')} style={styles.subeejIcon1} />
                  </View>
                  <Text style={[styles.selectedCalculatorText, { color: selectedCalculator === 'fertilizer' ? dynamicStyles.primaryColor : '#33527D', fontFamily: fonts.Bold }]}>
                    {translate('fertilizer_calculator')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={yieldScreenNavigation} style={styles.selectedCalculatorContainer}>
                  <View style={[styles.calculatorIconContainer, { borderColor: selectedCalculator === 'Yield' ? dynamicStyles.primaryColor : '#F2F6F9' }]}>
                    <Image source={require('../../assets/Images/yieldIcon.png')} style={styles.subeejIcon1} />
                  </View>
                  <Text style={[styles.selectedCalculatorText, { color: selectedCalculator === 'Yield' ? dynamicStyles.primaryColor : '#33527D', fontFamily: fonts.Bold }]}>
                    {translate('yield_calculator')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal animationType="slide" transparent visible={cashbackModalOpen}>
        <TouchableWithoutFeedback onPress={() => dispatch(setCashBackModal(false))}>
          <View style={styles.modalMainContainer}>
            <View style={styles.modalSubContainer2}>
              <View style={styles.modalSelectCalMainContainer}>
                <Text style={[styles.modalSelectText, { fontFamily: fonts.SemiBold }]}>{translate('select')}</Text>
                <TouchableOpacity onPress={() => dispatch(setCashBackModal(false))}>
                  <Image source={require('../../assets/Images/crossIcon.png')} style={styles.modalCrossIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.calculatorOptionsContainer2}>
                <TouchableOpacity onPress={() => rewardPointsCashbackNavigation("RewardsScreen", REWARDS)} style={styles.selectedCalculatorContainer2}>
                  <View style={[styles.calculatorIconContainer2, { backgroundColor: cashBackSelected === REWARDS ? dynamicStyles.primaryColor : '#fff', borderColor: cashBackSelected === REWARDS ? dynamicStyles.primaryColor : '#D6D6D6' }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Image source={cashBackSelected === REWARDS ? require('../../assets/Images/rewardsGiftIcon2.png') : require('../../assets/Images/rewardsGiftIcon.png')} style={[styles.subeejIcon2]} />
                      <Text style={[styles.selectedCalculatorText2, { color: cashBackSelected === REWARDS ? dynamicStyles.secondaryColor : '#000000', fontFamily: fonts.Bold }]}>
                        {translate('Reward_Points')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => rewardPointsCashbackNavigation("CashFreeTransactionsActivity", CASHBACK)} style={styles.selectedCalculatorContainer2}>
                  <View style={[styles.calculatorIconContainer2, { backgroundColor: cashBackSelected === CASHBACK ? dynamicStyles.primaryColor : '#fff', borderColor: cashBackSelected === CASHBACK ? dynamicStyles.primaryColor : '#D6D6D6' }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Image source={cashBackSelected === CASHBACK ? require('../../assets/Images/cashbackIcon2.png') : require('../../assets/Images/cashbackIcon.png')} style={[styles.subeejIcon2]} />
                      <Text style={[styles.selectedCalculatorText2, { color: cashBackSelected === CASHBACK ? dynamicStyles.secondaryColor : '#000000', fontFamily: fonts.Bold }]}>
                        {translate('Cashback_History')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {isAlertVisible && (
        <CustomAlert
          visible={isAlertVisible}
          onPressClose={() => setAlertVisible(false)}
          title={alertTitle}
          showHeader={showAlertHeader}
          showHeaderText={showAlertHeaderText}
          message={alertMessage}
          onPressOkButton={handleOkPress}
          onPressNoButton={handleNoPress}
          showYesButton={showAlertYesButton}
          showNoButton={showAlertNoButton}
          yesButtonText={showAlertYesButtonText}
          noButtonText={showAlertNoButtonText}
        />
      )}
      <Modal animationType="slide" transparent visible={productScanModalOpen}>
        <TouchableWithoutFeedback>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {fellowFarmerVisible ? (
                <>
                  <View style={styles.modalSelectCalMainContainer}>
                    <Text style={[styles.modalSelectText, { fontFamily: fonts.SemiBold }]}>{translate('select')}</Text>
                    <TouchableOpacity style={{ height: 35, width: 35, borderRadius: 30, borderWidth: 1, borderColor: dynamicStyles.primaryColor, alignItems: "center", justifyContent: "center" }} onPress={handleCloseModal}>
                      <Image source={require('../../assets/Images/crossIcon.png')} style={[styles.modalCrossIcon, { tintColor: dynamicStyles.primaryColor }]} />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity onPress={() => fromProductScancashbackScanBothLocationandCameraHandle('self')} style={[styles.modalButton, { borderColor: dynamicStyles.primaryColor }]}>
                      <Text style={[styles.modalButtonText, { color: dynamicStyles.primaryColor, fontFamily: fonts.SemiBold }]}>{translate('self')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleFarmerType('fellowFarmer')} style={[styles.modalButton, { borderColor: dynamicStyles.primaryColor }]}>
                      <Text style={[styles.modalButtonText, { color: dynamicStyles.primaryColor, fontFamily: fonts.SemiBold }]}>{translate('Fellow_Farmer')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.modalSelectCalMainContainer}>
                    <Text style={[styles.modalSelectText, { fontFamily: fonts.SemiBold }]}>{translate('Fellow_Farmer_Details')}</Text>
                    <TouchableOpacity style={{ height: 35, width: 35, borderRadius: 30, borderWidth: 1, borderColor: dynamicStyles.primaryColor, alignItems: "center", justifyContent: "center" }} onPress={handleCloseModal}>
                      <Image source={require('../../assets/Images/crossIcon.png')} style={[styles.modalCrossIcon, { tintColor: dynamicStyles.primaryColor }]} />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text style={[styles.inputLabel, { fontFamily: fonts.SemiBold }]}>{translate('Name')}</Text>
                    <TextInput
                      value={fellowFarmerName}
                      onChangeText={fellowFarmerNameHandle}
                      placeholder={translate('Enter_name')}
                      placeholderTextColor="#D6D6D6"
                      style={[styles.input, { borderColor: fellowFarmerNameValidation ? 'red' : '#D6D6D6', fontFamily: fonts.Regular }]}
                    />
                    {fellowFarmerNameValidation && <Text style={[styles.validationText, { fontFamily: fonts.Regular }]}>{fellowFarmerNameValidationContent}</Text>}
                    <Text style={[styles.inputLabel, { fontFamily: fonts.SemiBold }]}>{translate('mobile_number')}</Text>
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={10}
                      value={fellowFarmerMobileNumber}
                      onChangeText={fellowFarmerMobileHandle}
                      placeholder={translate('enter_your_mobile_number')}
                      placeholderTextColor="#D6D6D6"
                      style={[styles.input, { borderColor: fellowFarmerMobileValidation ? 'red' : '#D6D6D6', fontFamily: fonts.Regular }]}
                    />
                    {fellowFarmerMobileValidation && <Text style={[styles.validationText, { fontFamily: fonts.Regular }]}>{fellowFarmerMobileValidationContent}</Text>}
                    <TouchableOpacity onPress={fellowFarmersSubmitHandle} style={[styles.scanButton, { backgroundColor: dynamicStyles.primaryColor }]}>
                      <Text style={[styles.modalButtonText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate('scan')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* </ScreenWrapper> */}


      {genunityResponse &&
        <GenuineCheckModal
          visible={cashbackSuccessModal}
          onClose={() => dispatch(setCashBackSuccessModal(false))}

          onRedeem={() => {
            dispatch(setCashBackSuccessModal(false))
          }}
          onScanMore={() => {
            dispatch(setCashBackSuccessModal(false))
          }}
          apiResponse={genunityResponse}
        />
      }
      {genunityResponse &&
        <GenuinityModal
          visible={cashbackSuccessGenuineModal}
          apiResponse={genunityResponse}
          onClose={() => dispatch(setCashBackSuccessGenuineModal(false))}
        />
      }
      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}
      />
      {loaderApi && <PreLoginCustomLoader />}
    </View>
  );
};

export default HomeScreenRn;

const styles = StyleSheet.create({
  homeMainContainer: {
    height: height,
    width: width,
    backgroundColor: '#F2F6F9',
  },
  headerMainContainer: {
    width: width,
    paddingBottom: 14

  },
  subeejIcon: {
    height: 60.3,
    width: 133,
    alignSelf: 'center',
  },
  subeejIcon1: {
    height: height * 0.05,
    width: width * 0.3,
    resizeMode: 'contain',
  },
  profileContainer: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileSubContainer: {
    flexDirection: 'row',
  },
  farmerIconContainer: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 40,
    height: height * 0.06,
    width: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 5,
  },
  farmerIcon: {
    height: height * 0.05,
    width: width * 0.2,
    resizeMode: 'contain',
  },
  farmerIcon1: {
    height: width * 0.1,
    width: width * 0.1,
    borderRadius: 40,
  },
  greetingstText: {
    fontSize: RFValue(10, height),
    lineHeight: 20,
  },
  smileIcon: {
    height: height * 0.015,
    width: width * 0.04,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  greetingSmileContainer: {
    flexDirection: 'row',
  },
  userNameText: {
    fontSize: RFValue(14, height),
    width: 150,
  },
  weatherMainContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  degreesTextContainer: {
    width: width * 0.32,
  },
  caliciousText: {
    fontSize: RFValue(15, height),
  },
  degreeText: {
    fontSize: RFValue(28, height),
  },
  degreesHighsText: {
    color: '#A0A0A0',
    fontSize: RFValue(11, height),
  },
  line: {
    height: 60,
    width: 1,
    backgroundColor: '#E2EFF6',
    marginHorizontal: 5,
  },
  degreenSecondPartContainer: {
    width: '55%',
    flexDirection: 'row',
  },
  locationDetailsMainContainer: {
    marginLeft: 7,
    justifyContent: 'space-around',
  },
  locationDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cloudImgIcon: {
    height: width * 0.15,
    width: width * 0.15,
    resizeMode: 'contain',
  },
  locationIcon: {
    height: width * 0.03,
    width: width * 0.03,
    resizeMode: 'contain',
    marginRight: 6,
  },
  locationText: {
    fontSize: RFValue(14, height),
    width: 100,
  },
  weatherReportText: {
    fontSize: RFValue(14, height),
    color: '#FFB501',
    marginLeft: 3,
    marginTop: 5,
  },
  flatListContainer: {
    paddingHorizontal: 20,
    height: height * 0.7,
  },
  headerFlatList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 13,
    marginLeft: 15,
  },
  headerFlatListMarket: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    marginTop: 15
  },
  serviceText: {
    color: '#3A3A3A',
    fontSize: RFValue(16, height),
    lineHeight: 25
  },
  serviceListContainer: {
    width: '23%',
    minHeight: height * 0.15,
    backgroundColor: '#fff',
    marginRight: 9,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 15,
  },
  serviceListSubContainer: {
    backgroundColor: '#F2F6F9',
    width: '80%',
    height: width * 0.14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTextContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  serviceImgs: {
    height: width * 0.12,
    width: width * 0.12,
    resizeMode: 'contain',
  },
  serviceSubText: {
    color: '#3A3A3A',
    fontSize: RFValue(10, height),
    lineHeight: 20,
    textAlign:"center"
  },
  serviceMainText: {
    fontSize: RFValue(13, height),
    lineHeight: 22,
    textAlign:"center"
  },
  marketPriceMainContainer: {
    backgroundColor: '#fff',
    width: width * 0.43,
    borderRadius: 8,
    paddingVertical: 10,
    paddingLeft: 7,
    marginRight: 10,
    marginBottom: 5,
    flexDirection: 'row',
    elevation: 5,
  },
  marketPriceImg: {
    height: width * 0.15,
    width: width * 0.15,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  marketPriceContentContainer: {
    marginLeft: 10,
    width: '48%',
  },
  downPriceIcon: {
    width: 15,
    height: 15,
    marginRight: 2,
  },
  marketProductName: {
    fontSize: RFValue(12, height),
    color: '#3A3A3A',
  },
  marketPriceName: {
    fontSize: RFValue(10, height),
    color: '#ABABAB',
  },
  marketPriceText: {
    color: '#09B02B',
    fontSize: RFValue(10, height),
  },
  marketImgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomNavigationContainer: {
    backgroundColor: '#fff',
    width: width,
    height: height * 0.08,
    marginTop: 15,
    position: 'absolute',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    bottom: height * 0.04,
    // bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  bottomNavigationIconContainer: {
    alignItems: 'center',
    height: height * 0.05,
    width: '20%',
    justifyContent: 'center',
  },
  bottomNavigationIcons: {
    height: 22,
    width: 68,
    resizeMode: 'contain',
  },
  bottomNavigationIcons2: {
    height: 22,
    width: 68,
  },
  bottomIconLabels: {
    fontSize: RFValue(11, height),
    lineHeight: 20,
  },
  modalMainContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalSubContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    minHeight: height * 0.2,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    padding: 20,
  },
  modalSelectCalMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSelectText: {
    color: '#000000',
    fontSize: RFValue(15, height),
  },
  modalCrossIcon: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
    tintColor: '#555555',
  },
  selectedCalculatorContainer: {
    alignItems: 'center',
    width: '30%',
  },
  selectedCalculatorText: {
    fontSize: RFValue(12, height),
    textAlign: 'center',
    lineHeight: 20,
  },
  calculatorOptionsContainer: {
    marginTop: height * 0.02,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  calculatorIconContainer: {
    marginBottom: 10,
    backgroundColor: '#F2F6F9',
    borderRadius: 10,
    width: width * 0.2,
    height: height * 0.07,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    minHeight: '20%',
    borderRadius: 10,
    padding: 10,
  },
  modalButton: {
    borderWidth: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    marginVertical: 10,
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: RFValue(14, height),
  },
  inputLabel: {
    marginVertical: 5,
    color: '#5D5D5D',
    fontSize: RFValue(14, height),
  },
  input: {
    color: '#000',
    fontSize: RFValue(14, height),
    borderWidth: 1,
    width: '100%',
    height: 50,
    backgroundColor: '#FBFBFB',
    borderRadius: 10,
    paddingLeft: 10
  },
  validationText: {
    color: 'red',
    fontSize: RFValue(14, height),
  },
  scanButton: {
    marginTop: 25,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
  },
  flowerIcon: {
    position: 'absolute',
    top: height * 0.084,
    right: width * 0.01,
    height: 50,
    width: 100,
    tintColor: '#000',
    resizeMode: 'contain',
  },
  servicesStaticContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
    paddingLeft: 2,
  },
  layoutIcon: {
    height: width * 0.05,
    width: width * 0.05,
    resizeMode: 'contain',
    marginRight: 5,
  },
  noDataText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: RFValue(17, height),
    alignSelf: 'center',
    marginTop: 15,
  },
  listFooter: {
    height: height * 0.5,
  },
  comingSoonIcon: {
    height: 15,
    width: '100%',
    resizeMode: 'contain',
  },

  calculatorIconContainer2: {
    marginBottom: 10,
    borderRadius: 10,
    width: "100%",
    // alignItems: 'center',
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "center"
  },
  calculatorOptionsContainer2: {
    marginTop: height * 0.02,
    width: '100%',
    justifyContent: 'space-between',
  },
  selectedCalculatorText2: {
    fontSize: RFValue(12, height),
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedCalculatorContainer2: {
    alignItems: 'center',
    // width: '30%',
  },
  modalSubContainer2: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    minHeight: height * 0.25,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
  },
  subeejIcon2: {
    height: width * 0.08,
    width: width * 0.08,
    resizeMode: 'contain',
    marginRight: 15,
  },
});