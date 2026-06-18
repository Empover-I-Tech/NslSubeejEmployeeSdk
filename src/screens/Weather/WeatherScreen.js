import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Alert, Dimensions, Modal, TouchableWithoutFeedback, PermissionsAndroid, Linking } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { strings } from '../../Localization/StringsCopy';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import SimpleToast from 'react-native-simple-toast';
import { GetApiHeaders } from '../../utils/helpers';
import { translate } from '../../Localization/Localisation';
import Geolocation from 'react-native-geolocation-service';
import APIConfig, { HTTP_OK, MAP_MY_INDIA_URL } from '../../api/APIConfig';
import CustomYieldCalListViewModal from '../../components/CustomYieldCalListViewModal';
import axios from 'axios';
import CustomInputDropDown from '../../components/CustomInputDropDown';
import { Calendar } from 'react-native-calendars';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import PreLoginCustomLoader from '../../components/PreLoginCustomLoader';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomCircularProgress from '../../components/CustomCircularProgress';
import { setLocationActions } from '../../state/actions/locationActions';
import { useFontStyles } from '../../hooks/useFontStyles';
import { check ,PERMISSIONS,request,RESULTS} from 'react-native-permissions';

const WeatherScreen = ({ route }) => {
  console.log("WeatherRoute=-=->", JSON.stringify(route))
  const fonts=useFontStyles()
  const dispatch=useDispatch()
  const [currentTime, setCurrentTime] = useState(moment().format("LT"));
  const itemData = route?.params?.itemData;
  const navigation = useNavigation()
  const FILTERS = [translate("Days_Forecast_15"), translate("Hourly")]
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [selectedWeather, setSelectedWeather] = useState('');
  let [forecastData, setForecastData] = useState(null)
  let [hourlyData, setHourlyData] = useState(null)
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const { width, height } = Dimensions.get("window")
  const isConnected = useSelector(state => state.network.isConnected);

  let [cropList, setCropList] = useState(null)
  let [SowingDate, setSowingDate] = useState('')
  const [showDatePicker, setDatePicker] = useState(false);
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(dynamicStyles.companyCode)
  const [selectedDate, setSelectedDate] = useState(new Date());
  let [localLatitude, setLocalLatitude] = useState(null)
  let [localLongitude, setLocalLongitude] = useState(null)
  let [localAddress, setLocalAddress] = useState(null)
  let [cityDet, setCityDet] = useState(null)
  let [selectedCrop, setSelectedCrop] = useState(null)
  let [selectedCropId, setSelectedCropId] = useState(null)
  let [pestForecastData, setPestForecastData] = useState(null)
  const [coordinates, setCoordinates] = useState({});
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDatePest, setSelectedDatePest] = useState(translate("Select_Date"));
  const [rawDate, setRawDate] = useState("")
  const [loader, setLoader] = useState(false)
  const [fallBackTest, setFallBackTest] = useState("")

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [mapZoomingLevel, setMapZoomingLevel] = useState(0)
  const [isVisible,setIsVisible]=useState(false)
  const weatherTitle = useSelector((state) => state.weatherTitleReducer.weatherTitle);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("LT"));
    }, 100);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    if(route?.params?.backScreen){
    getWeatherData(route?.params?.backScreen?.latitude, route?.params?.backScreen?.longitude)
    getDetailsDashBoardData(route?.params?.backScreen?.latitude, route?.params?.backScreen?.longitude)
    console.log("route?.params?.backScreen=-=-=>",route?.params?.backScreen)
    setLatitude(route?.params?.backScreen?.latitude)
    setLongitude( route?.params?.backScreen?.longitude)
    setSelectedCrop(null)
    setSelectedDatePest(translate("Select_Date"))
    setPestForecastData(null)
    setRawDate("")
    setMapZoomingLevel(route?.params?.backScreen?.zoom)
      const fetch = async () => {
        let res = await getDetailsFromLatlong(route?.params?.backScreen?.latitude,route?.params?.backScreen?.longitude )
        setCityDet(res)
      }
      fetch()
    }

  }, [route?.params?.backScreen])

  useEffect(() => {
    if(route?.params?.itemData===""||route?.params?.itemData){
    getDetailsDashBoardData(route?.params?.latitude, route?.params?.longitude)
      setLatitude(route?.params?.latitude)
      setLongitude(route?.params?.longitude)
      getWeatherData(route?.params?.latitude, route?.params?.longitude)
    setSelectedCrop(null)
    setSelectedDatePest(translate("Select_Date"))
    setPestForecastData(null)
    setRawDate("")
    setMapZoomingLevel(20)
    }

  }, [route?.params?.itemData])

  const getDetailsDashBoardData = async (latitude, longitude) => {
    const url = MAP_MY_INDIA_URL;
    try {
      let urll = `${url}?lat=${latitude}&lng=${longitude}`
      const response = await axios.get(urll);
      if (response.data && response.data.results) {
        const { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality } = response.data.results[0];
        getCropsList(latitude, longitude, state)
        // return { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching reverse geocode data:', error.message);
      return null;
    }
  }

  let getWeatherData = async (lat, long) => {
    const headers = await GetApiHeaders();
    const url = APIConfig.BASE_URL_NVM + APIConfig.getWeatherDetails
    if (isConnected) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            latitude: lat ? lat : "", longitude: long ? long : "", mobileNumber: headers.mobileNumber, userId: headers.userId
          }),
        });

        const result = await response.json()
        if (result.statusCode === 200) {
          setTimeout(async () => {
            var dashboardResp = result.response
            setForecastData(dashboardResp?.dailyBaseWeatherInfo)
            setHourlyData(dashboardResp?.hourlyBaseWeatherInfo)
            let res = await getDetailsFromLatlong(lat ? lat : latitude, long ? long : longitude)
            setCityDet(res)
            setIsVisible(result?.response?.isVisible)
          }, 100);
        } 
        else if (result.statusCode === 403) {
          setIsVisible(result?.response?.isVisible)
          // setTimeout(async () => {
          //   var dashboardResp = result.response
          //   setForecastData(dashboardResp?.dailyBaseWeatherInfo)
          //   setHourlyData(dashboardResp?.hourlyBaseWeatherInfo)
          //   let res = await getDetailsFromLatlong(lat ? lat : latitude, long ? long : longitude)
          //   setCityDet(res)
          // }, 100);
        } 
        
        
        else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 100);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          // SimpleToast.show(error.message)

          setSuccessLoadingMessage(error.message)
        }, 100);
      } finally {
        setLoadingMessage()
        setLoading(false)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const nextFiveDays = itemData?.weeklyForecast
    ? itemData.weeklyForecast
      .map((day) => ({
        date: moment(day.date, 'DD-MMM-YYYY HH:mm:ss').format('D-MMM'),
        temperature: `${Math.round(day.max_temp || 0)}°`,
        icon: day.icon,
        day: day.day,
        weather_description: day.weather_description
      }))
      .sort((a, b) => {
        if (a.day === 'Today') return -1;
        if (b.day === 'Today') return 1;
        return moment(a.date, 'D-MMM').isBefore(moment(b.date, 'D-MMM')) ? -1 : 1;
      })
    : [];

  const formattedDate = moment().format('DD-MMM-YYYY')

  let todayForecast = forecastData?.forecast?.filter((data) => {
    return data?.day === 'Today'
  })

  let otherDaysForecast = forecastData?.forecast?.filter((data) => {
    return data?.day !== 'Today'
  })

  const getSections = (data) => {
    if (!data) return [];
    const mergedData = data.reduce((acc, dayData) => {
      return { ...acc, ...dayData };
    }, {});
    return Object.keys(mergedData)?.map((dayTitle) => ({
      title: dayTitle,
      data: mergedData[dayTitle],
    }));
  };

  const hourlyDataArr = getSections(hourlyData);

  useFocusEffect(
    React.useCallback(() => {
      let callApi = async () => {
        if (route?.params?.latitude) {
          const { latitude, longitude, address } = route?.params
          latitude !== undefined && setLocalLatitude(latitude);
          longitude !== undefined && setLocalLongitude(longitude);
          latitude !== undefined && setLatitude(latitude);
          longitude !== undefined && setLongitude(longitude);
          setLocalAddress(address)
          getWeatherData(route?.params?.latitude, route?.params?.longitude)
          let res = await getDetailsFromLatlong(latitude, longitude)
          setCityDet(res)
          if (selectedFilter === translate('PestForecast')) {

          }
        }
        if ((route?.params?.enablePestForecast === true) || (route?.params?.backScreen?.enablePestForecast == true)) {
          setSelectedFilter(translate('PestForecast'))
        }
      }
      callApi()
    }, [route?.params])
  );

  useEffect(() => {
    if (selectedDatePest !== '' && selectedCrop !== null) {
      setPestForecastData(null)
      // getDiseasesFromMap(rawDate)
    }
  }, [selectedDatePest])


  const getDiseasesFromMap = async (date) => {
    setLoader(true)
    var getYeildCalcURL = APIConfig.BASE_URL_NVM + APIConfig.getPestInformation
       const payload = {
      "latitude": localLatitude !== null ? localLatitude : latitude,
      "longitude": localLongitude !== null ? localLongitude : longitude,
      "crop": selectedCrop,
      "sowingDate": date,
      "state": cityDet?.state
    }

    const headers = await GetApiHeaders()
    const APIResponse = await axios.post(getYeildCalcURL, payload, { headers })
    console.log("apiresponse=--=->", APIResponse.data)
    if (isConnected) {
      try {
        if (APIResponse?.data?.response?.pestForecast.length > 0) {


          let pestForecastList = APIResponse.data.response.pestForecast
          setPestForecastData(pestForecastList)
          setLoader(false)

        } else {
          console.log("APIResponse?.data?.message=-=->", APIResponse?.data?.message)
          setFallBackTest(APIResponse?.data?.message || translate("No_pests_detected_moment_later"))
          setLoader(false)
        }
      } catch (erro) {
        setLoading(false)
      }


    } else {
      setLoading(false)

      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const getDetailsFromLatlong = async (latitude, longitude) => {
    const url = MAP_MY_INDIA_URL;
    try {
      let urll = `${url}?lat=${latitude}&lng=${longitude}`
      const response = await axios.get(urll);
      if (response.data && response.data.results) {
        const { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality } = response.data.results[0];
        return { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality };
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  const openToDatePicker = () => {
    var minDate = '';
    minDate = new Date();
    if (selectedCrop) {
      setDatePicker(true)
    } else {
      SimpleToast.show(translate('please_select_crop'))
    }
  }

  const handleConfirm = (date) => {
    var selectedDate = moment(date).format('DD-MM-YYYY');
    setSowingDate(selectedDate);
    setDatePicker(false);
  }


  const handleCancel = () => {
    setDatePicker(false)
  }

  const changeDropDownData = (dropDownData, type, selectedItem) => {
    setSelectedDatePest(translate("Select_Date"))
    setFallBackTest("")
    setShowDropDowns(true);
    setdropDownData(dropDownData);
    setDropDownType(type);
    setSelectedDropDownItem(selectedItem);
  }

  const onSelectedCrop = async (item) => {
    setSelectedCrop(item.name)
    setSelectedCropId(item?.id);
    setSowingDate('')
    setPestForecastData(null)
    setShowDropDowns(false);
  }

  let getCropsList = async (latitude, longitude, state) => {
    if (isConnected) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var url = APIConfig.BASE_URL_NVM + APIConfig.getPestForecastCrops
        var getHeaders = await GetApiHeaders()
        const payload = { "latitude": latitude, "longitude": longitude, "state": state }
        var APIResponse = await axios.post(url, payload, { getHeaders });
        if (APIResponse?.data?.statusCode === 200) {
          var masterResp = APIResponse.data.response.pestForecastCropsList
          setCropList(masterResp)
          setFallBackTest("")
        }
        else {

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
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const handleDateModal = () => {
    if (selectedCrop) {
      setCalendarVisible(true)
    } else {
      SimpleToast.show(translate("Please_Select_Crop"))
    }
  }

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
          { text: translate("open_settings"), onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
  } else {
    // For iOS, use a test getCurrentPosition to determine if GPS is on
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(true),
        (error) => {
          Alert.alert(
        translate("GPS_Required"),
        translate("Please_enable_location_services_settings"),
            [
              { text: translate("cancel"), style: 'cancel' },
              { text: translate("open_settings"), onPress: () => Linking.openURL('App-Prefs:root=Privacy&path=LOCATION') },
            ]
          );
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }
  }, []);

  const fetchLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission!=="granted") {
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
        if (error.code === 3 || error.code === 2) {
          // Retry with higher accuracy
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              setLatitude(latitude);
              setLongitude(longitude);
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
  }, []);

  const callLocationNavigation = async () => {

      const hasPermission = await requestLocationPermission();
      const isGpsEnabled = await checkIfGpsEnabled();
    if (isGpsEnabled) {
      if (hasPermission === "granted") {
            if(isConnected){
                navigation.navigate('Location',{coordinates:{latitude:latitude,longitude:longitude,address:cityDet,screenName:"WeatherScreen",zoom:mapZoomingLevel, isComingFrom: (route?.params?.enablePestForecast === true) || (route?.params?.backScreen?.enablePestForecast == true) ? true : false}})
            }else{
                SimpleToast.show(translate('no_internet_conneccted'));
            }
      }
    }else{
      fetchLocation()
    }
  }


  const closeDate = () => {
    setCalendarVisible(false)
  }

  const today = new Date().toISOString().split("T")[0];

  const handleRemedy = (item) => {
    navigation.navigate('Remedyrecommendation', { data: item, cropName: selectedCrop, latitude, longitude })
  }


  return (
    <View style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }}>
      <View style={[styles.flexFull, styles.gray300bg]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View
          style={[styles.header, { backgroundColor: dynamicStyles.primaryColor,marginBottom:10 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",width:"100%" }}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.popToTop()}>
              <Image source={require('../../../src/assets/images/weatherScreen/newBackButton.png')} style={{
                height: 20, width: 34, tintColor: dynamicStyles.secondaryColor, marginTop: 15, marginLeft: 10
              }} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.Bold }]}>
              {translate(weatherTitle)}
            </Text>
            <View style={{width:40}}/>


          </View>
        </View>


        {showDropDowns &&
          <CustomYieldCalListViewModal
            dropDownType={dropDownType}
            listItems={dropDownData}
            selectedItem={selectedDropDownItem}
            onSelectedCrop={(item) => onSelectedCrop(item)}
            closeModal={() => setShowDropDowns(false)} />}

        {selectedFilter === translate("Days_Forecast_15") && forecastData && 
        <View style={[styles.weatherInfoCard]}>
          <View style={[styles.locationTimeContainer, { marginBottom: 0, }]}>
            <View style={[styles.locationContainer, { flexDirection: "column", alignItems: "center", }]}>
              <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor, marginHorizontal: 0, textAlign: "left", alignSelf: "flex-start",fontFamily:fonts.Regular }]}>
                {todayForecast[0]?.displayDay || '--'}
              </Text>
              <Text style={[stylesheetStyles.rangeText,{fontFamily:fonts.Regular}]}>
                {todayForecast[0]?.date || '--'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { callLocationNavigation() }}
              style={[styles.locationContainer, { marginTop: -responsiveHeight(4) }]}>
              <Image source={require("../../../assets/Images/locationImgIcon.png")} style={{
                height: width * 0.05,
                width: width * 0.05,
                resizeMode: "contain",
                marginRight: 6
              }} />
              <Text style={[styles.locationText, { color: dynamicStyles.textColor ,fontFamily:fonts.SemiBold}]}>
                {(todayForecast[0]?.city) || '--'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.weatherDescriptionContainer}>
              <Image source={{ uri: todayForecast[0]?.image }} style={{
                height: width * 0.3,
                width: width * 0.3,
                resizeMode: "contain"
              }} />

              <View style={styles.weatherDescription}>
                <Text style={[styles.weatherDescText, { color: 'rgba(255, 181, 1, 1)',fontFamily:fonts.Regular,minWidth: "80%", fontSize: 15 }]}>
                  {todayForecast[0]?.weather_description || "--"}
                </Text>
                {todayForecast[0]?.max_temp ? <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor, fontSize: 34,fontFamily:fonts.Regular }]}>
                    {Math.round(todayForecast[0]?.max_temp)}
                  </Text>
                  <Text style={[styles.degreeText, { color: dynamicStyles.textColor, marginTop: -3,fontFamily:fonts.Regular }]}>{"°c"}</Text>
                </View> : <Text style={[styles.tempText, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}>
                  {'--'}
                </Text>}

                <View style={styles.tempRange}>
                  {todayForecast[0]?.max_temp ?
                    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                      <Text style={[styles.rangeText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                        {`${translate('High')} ${Math.round(todayForecast[0]?.max_temp)}`}
                      </Text>
                      <Text style={[styles.degree2Text, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>{"°"}</Text>
                    </View> :

                    <Text style={[styles.tempText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                      {'--'}
                    </Text>}
                  <View style={styles.divider} />
                  {todayForecast[0]?.min_temp ?
                    <View style={{ flexDirection: "row", alignItems: 'center', marginLeft: 5 }}>
                      <Text style={[styles.rangeText, { color: '#d3d3d3' ,fontFamily:fonts.Regular}]}>
                        {`${translate('Low')} ${Math.round(todayForecast[0]?.min_temp)}`}
                      </Text>
                      <Text style={[styles.degree2Text, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>{"°"}</Text>
                    </View> :

                    <Text style={[styles.tempText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                      {'--'}
                    </Text>}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.weatherStats}>
            <View style={styles.weatherStatItem}>
              <Image source={require('../../../assets/Images/forceRain.png')} style={styles.weatherStatIcon} />
              <Text style={[styles.weatherStatText, { color: dynamicStyles.textColor,fontFamily:fonts.SemiBold }]}>
                {todayForecast[0]?.speed ? `${todayForecast[0]?.speed}/h` : '--'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.weatherStatItem}>
              <Image source={require('../../../assets/Images/dropIcon.png')} style={styles.weatherStatIcon} />
              <Text style={[styles.weatherStatText, { color: dynamicStyles.textColor, fontFamily:fonts.SemiBold  }]}>
                {todayForecast[0]?.humidity ? `${todayForecast[0]?.humidity}%` : '--'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.weatherStatItem}>
              <Image source={require('../../../assets/Images/cloud.png')} style={styles.weatherStatIcon} />
              <Text style={[styles.weatherStatText, { color: dynamicStyles.textColor,fontFamily:fonts.SemiBold  }]}>
                {todayForecast[0]?.rain !== undefined ? `${todayForecast[0]?.rain}%` : '--'}
              </Text>
            </View>
          </View>
        </View>
        }

        {/* {!loading && forecastData &&  */}
        <View style={{ flexDirection: "row", alignSelf: "flex-end", marginRight: "5%", marginBottom: 15, marginTop: selectedFilter !== translate("Days_Forecast_15") ? 15 : 0 }}>
         {isVisible&&
         <>
                   <TouchableOpacity onPress={() => {
            setSelectedFilter(translate("Days_Forecast_15"))
            setSelectedWeather('')
          }} activeOpacity={0.5} style={[selectedFilter === translate("Days_Forecast_15") ? {
            marginRight: "2%",
            backgroundColor: dynamicStyles.primaryColor,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            minHeight: "4%",
            width: "36%",
          } :
            {
              borderWidth: 1,
              borderColor: dynamicStyles.primaryColor,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              minWidth: '30%',
              minHeight: "4%",
              marginRight: "2%",
              width: "40%",
            }
          ]}>
            <Text style={[{fontFamily:fonts.Regular, fontSize: 10, marginTop: 1, color:
                selectedFilter === translate("Days_Forecast_15") ? dynamicStyles.secondaryColor : dynamicStyles.primaryColor
            }]}>{translate("Days_Forecast_15")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setSelectedFilter(translate("Hourly"))
            if (hourlyDataArr) {
              // alert(JSON.stringify(hourlyDataArr[0]))
              setSelectedWeather(hourlyDataArr[0])
            }
          }} activeOpacity={0.5} style={[
            selectedFilter === translate("Hourly") ?
              {
                backgroundColor: dynamicStyles.primaryColor,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
                minWidth: '25%',
                minHeight: "4%"
              } :
              {
                borderWidth: 1,
                borderColor: dynamicStyles.primaryColor,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
                minWidth: '25%',
                minHeight: "4%"
              }]}>
            <Text style={{fontFamily:fonts.Regular, fontSize: 10, marginTop: 1, color:
                selectedFilter === translate("Hourly") ? dynamicStyles.secondaryColor : dynamicStyles.primaryColor
            }}>3 {translate("Hourly")}</Text>
          </TouchableOpacity>
             <TouchableOpacity onPress={() => {
            setSelectedFilter(translate('PestForecast'))
            if (hourlyDataArr) {
              // alert(JSON.stringify(hourlyDataArr[0]))
              setSelectedWeather(hourlyDataArr[0])
            }
          }} activeOpacity={0.5} style={[
            { marginLeft: 10 },
            selectedFilter === translate('PestForecast') ?
              {
                backgroundColor: dynamicStyles.primaryColor,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
                minWidth: '25%',
                minHeight: "4%"
              } :
              {
                borderWidth: 1,
                borderColor: dynamicStyles.primaryColor,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
                minWidth: '25%',
                minHeight: "4%"
              }]}>
            <Text style={{fontFamily:fonts.Regular, fontSize: 10, marginTop: 1, color:
                selectedFilter === translate('PestForecast') ? dynamicStyles.secondaryColor : dynamicStyles.primaryColor
            }}>{translate('PestForecast')}</Text>
          </TouchableOpacity>
         </>
         }
        </View>
        {/* } */}
        {selectedFilter === translate('PestForecast') ?
          <>
            <View
              style={[styles.weatherInfoCard, { marginBottom: 5, marginTop: 5, padding: 10 }]}>
              <View style={[styles.locationTimeContainer, { marginBottom: 0, }]}>
                <View style={[styles.locationContainer, { flexDirection: "column", alignItems: "center", }]}>
                  <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor, marginHorizontal: 0, textAlign: "left", alignSelf: "flex-start",fontFamily:fonts.Regular }]}>
                    {translate("Location_Details")}
                  </Text>
                </View>
                {/* {cropList && cropList.length > 0&& */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      callLocationNavigation()
                    }}
                    style={[styles.locationContainer]}>
                    <Image source={require("../../../assets/Images/locationImgIcon.png")} style={{
                      height: width * 0.05,
                      width: width * 0.05,
                      resizeMode: "contain",
                      marginRight: 6
                    }} />
                  </TouchableOpacity>
                </View>
                {/* } */}


              </View>
              <View style={{ backgroundColor: "rgba(242, 246, 249, 1)", height: 1, width: "100%", alignSelf: "center", marginVertical: 5 }} />
              <Text style={[styles.forecastTemp, { color: dynamicStyles.textColor, fontFamily:fonts.Regular,  fontSize: 12 }]}>
                {translate("Showing_infestation_Forecast")}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                <View>
                  <Text style={[styles.forecastTemp, { color: 'rgba(93, 93, 93, 1)', fontFamily:fonts.Regular,  fontSize: 10 }]}>{translate("State")}</Text>
                  <Text style={[styles.forecastTemp, { color: dynamicStyles.textColor, fontFamily:fonts.SemiBold,  fontSize: 11 }]}>{cityDet?.state || '--'}</Text>
                </View>
                <View>
                  <Text style={[styles.forecastTemp, { color: 'rgba(93, 93, 93, 1)', fontFamily:fonts.Regular,  fontSize: 10 }]}>{translate("District")}</Text>
                  <Text style={[styles.forecastTemp, { color: dynamicStyles.textColor, fontFamily:fonts.SemiBold,  fontSize: 11 }]}>{cityDet?.district || '--'}</Text>
                </View>
                <View>
                  <Text style={[styles.forecastTemp, { color: 'rgba(93, 93, 93, 1)', fontFamily:fonts.Regular,  fontSize: 10 }]}>{translate("new_village")}</Text>
                  <Text style={[styles.forecastTemp, { color: dynamicStyles.textColor, fontFamily:fonts.SemiBold,  fontSize: 11 }]}>{cityDet?.village || cityDet?.locality || 'N/A'}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: "rgba(242, 246, 249, 1)", height: 1, width: "100%", alignSelf: "center", 
              marginTop: responsiveHeight(2), marginBottom: responsiveHeight(0.5), }} />
              {cropList && cropList.length > 0 &&
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={[{ width: '45%' }]}>

                    <CustomInputDropDown
                      width={[]}
                      defaultValue={selectedCrop != undefined && selectedCrop != translate('select') ? selectedCrop : translate('select')}
                      labelName={translate('Crop')}
                      IsRequired={false}
                      placeholder={translate('Crop')}
                      onEndEditing={async event => {
                        // calculateTotalOrderValue()
                      }}
                      onFocus={() => {
                        let updatedCompanyList = cropList.filter((x) => {
                          return x.companyCode === selectedCompanyId
                        })
                        changeDropDownData(cropList, strings.crop, selectedCrop)
                      }}
                    />

                  </View>
                  <View style={{ width: "45%" }}>
                    <Text style={{ color: "#000", marginBottom: 13, fontSize: RFValue(14, height),fontFamily:fonts.Medium }}>{translate("sowing_date")}</Text>
                    <TouchableOpacity onPress={handleDateModal} style={[stylesheetStyles.textInputContainer, { borderColor: "#D6D6D6" }]}>
                      <Text style={[stylesheetStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{selectedDatePest}</Text>
                      <Image source={require('../../../assets/Images/calendarIcon.png')} style={[stylesheetStyles.dropDownIcon, { tintColor: dynamicStyles.primaryColor }]} />
                    </TouchableOpacity>
                  </View>
                </View>

              }
              {(pestForecastData != null && pestForecastData.length) && <View style={{ borderWidth: 1, borderColor: "rgba(242, 246, 249, 1)", paddingHorizontal: 10, paddingVertical: 10, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                <Text style={{ color: dynamicStyles.textColor,fontFamily:fonts.SemiBold, fontSize: 12 }}>{translate('PestDiseases')}</Text>
              </View>}
              {(pestForecastData != null && pestForecastData.length) ? <View style={{ maxHeight: height * 0.45 }}>
                {/* {(pestForecastData != null && pestForecastData.length) &&  */}
                <View style={{ maxheight: 300, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, paddingHorizontal: 10, paddingVertical: 10, borderColor: "rgba(242, 246, 249, 1)", borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }}>
                  {/* {pestForecastData && */}
                  <FlatList
                    data={pestForecastData}
                    ListEmptyComponent={() =>
                      <Text
                        style={{
                          textAlign: "center",
                          marginTop: 20, color: "#000",
                          fontSize: 15,
                          fontFamily:fonts.SemiBold
                        }}>{fallBackTest}</Text>

                    }
                    renderItem={({ item, index }) => {
                      console.log("pestDetails=-=-=>", item, latitude, longitude)
                      return (
                        <TouchableOpacity onPress={() => handleRemedy(item)} style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }, pestForecastData.length - 1 !== index && { marginBottom: 10 }]}>
                          <Image style={{ height: 50, width: 50, resizeMode: "cover", borderRadius: 10 }} source={{ uri: item?.imageUrl }} />
                          <View style={{ width: 1, height: "80%", backgroundColor: "rgba(242, 246, 249, 1)" }} />
                          <View style={{ width: '50%' }}>
                            {/* {item?.pests&&<RenderHTML contentWidth={width} source={{ html: item?.pests }} />}
                                {item?.description&&<RenderHTML contentWidth={width} source={{ html: item?.description }} />} */}

                            <Text style={{ color: dynamicStyles.textColor, fontFamily:fonts.SemiBold, fontSize: RFValue(14, height) }}>{item?.pests}</Text>
                            {item?.description && <Text style={{ color: dynamicStyles.textColor,fontFamily:fonts.Regular, fontSize: RFValue(12, height) }}>{item?.description}</Text>}
                          </View>
                          <CustomCircularProgress
                            percentage={item?.percentage} radius={25} strokeWidth={6} percentageText={item?.percentage} level={item?.level}
                          />
                        </TouchableOpacity>
                      )
                    }}
                    keyExtractor={item => item.id}
                    ListFooterComponent={<View style={{height : responsiveHeight(2)}}/>}
                  />
                  {/* } */}


                </View>
                {/* } */}
              </View> : <View>
                   <Text
                        style={{
                          textAlign: "center",
                          color: "#000",
                          fontSize: 15,
                          fontFamily:fonts.SemiBold,
                          paddingVertical: fallBackTest ? 15 : 0
                        }}>{fallBackTest}</Text>
              </View>}
            </View>
          </>

          : <FlatList
            contentContainerStyle={{}}
            data={selectedFilter === translate("Days_Forecast_15") ? otherDaysForecast : hourlyDataArr}
            keyExtractor={(item, index) => index.toString()}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{height : responsiveHeight(2)}}/>}
          //   ListFooterComponent={<>
          //   <Image style={{ height: 150, width: 150, resizeMode: "contain", alignSelf: "center", marginTop: responsiveHeight(10) }} source={require("../../../assets/Images/weatherFallIcon.png")} />
          //    <Text style={[styles.headerText, { color:"#000",fontFamily:fonts.Bold,alignSelf:"center" }]}>
          //     {translate("No_data_available")}
          //   </Text>
          // </>}
            renderItem={({ item }) => {
              return (
                JSON.stringify(selectedWeather) === JSON.stringify(item) ? <View
                  style={[styles.weatherInfoCard, { marginBottom: 5, marginTop: 5, padding: 10 }]}>
                  <View style={[styles.locationTimeContainer, { marginBottom: 0, }]}>
                    <View style={[styles.locationContainer, { flexDirection: "column", alignItems: "center", }]}>
                      <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor, marginHorizontal: 0, textAlign: "left", alignSelf: "flex-start",fontFamily:fonts.Regular }]}>
                        {selectedWeather?.data[0]?.displayDay}
                      </Text>
                      <Text style={[stylesheetStyles.rangeText,{fontFamily:fonts.Regular}]}>
                        {moment(selectedWeather?.data[0]?.dt_txt).format('DD-MMM-YYYY')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                      <TouchableOpacity
                    onPress={() => {
                      callLocationNavigation()
                    }} style={styles.locationContainer}>
                        <Image source={require("../../../assets/Images/locationImgIcon.png")} style={{
                          height: width * 0.05,
                          width: width * 0.05,
                          resizeMode: "contain",
                          marginRight: 6
                        }} />

                        <Text style={[styles.locationText, { color: dynamicStyles.textColor,fontFamily:fonts.SemiBold }]}>
                          {(selectedWeather?.data[0]?.city) || '--'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => {
                          if (selectedWeather) {
                            setSelectedWeather('')
                            // setSelectedWeather(item)
                          } else {
                            setSelectedWeather(item)
                          }
                        }}
                        style={[{ backgroundColor: dynamicStyles.primaryColor, borderRadius: 5, padding: 5, alignItems: "center", justifyContent: "center", marginLeft: 10 }]}>
                        <Image style={[{ height: 10, width: 10, tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={selectedWeather === item ? require('../../../assets/Images/up_arrow.png') : require('../../../assets/Images/down_arow.png')}></Image>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.weatherDetails}>
                    <View style={styles.weatherDescriptionContainer}>
                      <Image source={require("../../../assets/Images/cloudeIconImg.png")} style={{
                        height: width * 0.3,
                        width: width * 0.3,
                        resizeMode: "contain"
                      }} />
                      <View style={styles.weatherDescription}>
                        <Text style={[styles.weatherDescText, { color: 'rgba(255, 181, 1, 1)', fontFamily:fonts.Regular, minWidth: "80%", fontSize: 15 }]}>
                          {selectedWeather?.data[0]?.weather_description || "--"}
                        </Text>
                        {selectedWeather?.data[0]?.max_temp ? <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor, fontSize: 34 ,fontFamily:fonts.Regular}]}>
                            {Math.round(selectedWeather?.data[0]?.max_temp)}
                          </Text>
                          <Text style={[styles.degreeText, { color: dynamicStyles.textColor, marginTop: -3 ,fontFamily:fonts.Regular}]}>{"°c"}</Text>
                        </View> : <Text style={[styles.tempText, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}>
                          {'--'}
                        </Text>}

                        <View style={styles.tempRange}>
                          {selectedWeather?.data[0]?.max_temp ?
                            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                              <Text style={[styles.rangeText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                                {`${translate('High')} ${Math.round(selectedWeather?.data[0]?.max_temp)}`}
                              </Text>
                              <Text style={[styles.degree2Text, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>{"°"}</Text>
                            </View> :

                            <Text style={[styles.tempText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                              {'--'}
                            </Text>}
                          <View style={styles.divider} />
                          {selectedWeather?.data[0]?.min_temp ?
                            <View style={{ flexDirection: "row", alignItems: 'center', marginLeft: 5 }}>
                              <Text style={[styles.rangeText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                                {`${translate('Low')} ${Math.round(selectedWeather?.data[0]?.min_temp)}`}
                              </Text>
                              <Text style={[styles.degree2Text, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>{"°"}</Text>
                            </View> :

                            <Text style={[styles.tempText, { color: '#d3d3d3',fontFamily:fonts.Regular }]}>
                              {'--'}
                            </Text>}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.weatherStats}>
                    <View style={styles.weatherStatItem}>
                      <Image source={require('../../../assets/Images/forceRain.png')} style={styles.weatherStatIcon} />
                      <Text style={[styles.weatherStatText, { color: dynamicStyles.textColor,fontFamily:fonts.SemiBold  }]}>
                        {selectedWeather?.data[0]?.speed ? `${selectedWeather?.data[0]?.speed}/h` : '--'}
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.weatherStatItem}>
                      <Image source={require('../../../assets/Images/dropIcon.png')} style={styles.weatherStatIcon} />
                      <Text style={[styles.weatherStatText, { color: dynamicStyles.textColor ,fontFamily:fonts.SemiBold }]}>
                        {selectedWeather?.data[0]?.humidity ? `${selectedWeather?.data[0]?.humidity}%` : '--'}
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.weatherStatItem}>
                      <Image source={require('../../../assets/Images/cloud.png')} style={styles.weatherStatIcon} />
                      <Text style={[styles.weatherStatText, { color: dynamicStyles.textColor ,fontFamily:fonts.SemiBold }]}>
                        {selectedWeather?.data[0]?.rain !== undefined ? `${selectedWeather?.data[0]?.rain}%` : '--'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', height: 1, borderBottomWidth: 0.5, borderColor: "#d3d3d3", marginTop: 10 }} />
                  <FlatList
                    data={item?.data}
                    nestedScrollEnabled={true}
                    renderItem={({ item: subItem }) => {
                      return <View style={[styles.forecastItem, { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }
                        } >
                          <Text style={[stylesheetStyles.forecastTemp, { color: dynamicStyles.textColor, width: 25, fontFamily:fonts.SemiBold}]}>
                            {Math.round(subItem?.max_temp) || '--'}
                          </Text>
                          <Text style={[stylesheetStyles.degreeText, { color: dynamicStyles.textColor, marginTop: -3,fontFamily:fonts.SemiBold }]}>{"°c"}</Text>
                        </View>
                        {subItem?.image &&
                          <Image source={{ uri: subItem?.image }} style={styles.forecastIcon} />
                        }

                        <Text style={[styles.forecastTemp, { color: dynamicStyles.textColor, fontFamily:fonts.Regular }]}>
                          {subItem.time}
                        </Text>
                      </View>
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    scrollEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContainer}
                    ListFooterComponent={<View style={{height : responsiveHeight(2)}}/>}
                  />
                </View> :
                  <TouchableOpacity
                    disabled={selectedFilter === translate("Days_Forecast_15")}
                    activeOpacity={0.5}
                    onPress={() => {
                      // Alert.alert(item)
                      if (selectedWeather) {
                        setSelectedWeather('')
                        setSelectedWeather(item)
                      } else {
                        setSelectedWeather(item)
                      }
                    }}
                    style={stylesheetStyles.container}>
                    <View style={stylesheetStyles.tempContainer}>
                      {(
                        <View style={stylesheetStyles.tempWrapper}>
                          <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}>
                            {selectedFilter === translate("Days_Forecast_15") ? item?.displayDay : item?.data[0]?.displayDay || '--'}
                          </Text>
                        </View>
                      )}

                      <View style={stylesheetStyles.rangeContainer}>
                        <Text style={[stylesheetStyles.rangeText,{fontFamily:fonts.Regular}]}>
                          {selectedFilter === translate("Days_Forecast_15") ? item?.date : moment(item?.data[0]?.dt_txt).format('DD-MMM-YYYY') || '--'}
                        </Text>
                      </View>
                    </View>

                    <View style={stylesheetStyles.iconContainer}>
                      <Image source={require("../../../assets/Images/cloudeIconImg.png")} style={{
                        height: width * 0.1,
                        width: width * 0.1,
                        resizeMode: "contain"
                      }} />
                      <View style={stylesheetStyles.tempWrapper}>
                        <Text style={[stylesheetStyles.tempText, { color: dynamicStyles.textColor, fontSize: 27, marginTop: 10,fontFamily:fonts.Regular }]}>
                          {Math.round(selectedFilter !== translate("Days_Forecast_15") ? item?.data[0]?.max_temp : item?.max_temp) || '--'}
                        </Text>
                        <Text style={[stylesheetStyles.degreeText, { color: dynamicStyles.textColor, marginTop: 5 ,fontFamily:fonts.Regular}]}>{"°c"}</Text>
                      </View>
                    </View>
                    {selectedFilter !== translate("Days_Forecast_15") && <View style={[{ backgroundColor: dynamicStyles.primaryColor, borderRadius: 5, padding: 5, alignItems: "center", justifyContent: "center" }]}>
                      <Image style={[{ height: 10, width: 10, tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={selectedWeather === item ? require('../../../assets/Images/up_arrow.png') : require('../../../assets/Images/up_arrow.png')}></Image>

                    </View>}
                  </TouchableOpacity>
              )
            }}
          />}

        <Modal visible={isCalendarVisible} transparent animationType="slide">
          <TouchableWithoutFeedback>

            <View style={stylesheetStyles.modalMainContainer}>
              <View style={stylesheetStyles.modalSubContainer}>
                <TouchableOpacity onPress={closeDate} style={{
                  position: "absolute", right: 5, top: 5,
                  borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center",
                  backgroundColor: "#000"
                }}>
                  <Image source={require("../../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                </TouchableOpacity>
                <Calendar
                  theme={{
                    textDayFontFamily:fonts.Regular,     // Font for days
                    textMonthFontFamily:fonts.Bold,      // Font for month title
                    textDayHeaderFontFamily:fonts.Regular, // Font for week day labels (e.g., Mon, Tue)

                    // Optional: size and color overrides
                  
                  }}

                  // minDate={today}
                  onDayPress={(day) => {
                    setSelectedDatePest(moment(day.dateString, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY"));
                    // setApiSendDate(date)
                    setRawDate(day.dateString)
                    getDiseasesFromMap(day.dateString)
                    setCalendarVisible(false);
                    // setRequiredByValidations(false)
                  }}
                  markedDates={
                    selectedDate ? { [selectedDate]: { selected: true, marked: true, selectedColor: "#ED3237" } } : {}
                  }
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        {loader && <PreLoginCustomLoader />}
      </View>
    </View>
    // <Text>hello</Text>
  );
};

const stylesheetStyles = StyleSheet.create({
  modalMainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  modalSubContainer: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center"
  },
  textInputContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    height: 47,
    // marginTop: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
    width: "100%",
  },
  selectCropTextInput: {
    fontSize: 14,
    lineHeight: 30,
    width: "90%",
    paddingLeft: 10,
    color: '#000'
  },
  dropDownIcon: {
    height: 20,
    width: 20,
    tintColor: "#000",
    resizeMode: "contain"
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    width: '50%',
    color: "rgba(255, 255, 255, 1)",
    position: "absolute"
  },
  circle: {
    height: 10,
    width: 10,
    borderRadius: 100,
    backgroundColor: "rgba(0, 177, 122, 1)",
    position: "absolute",
    right: 10,
    top: 12,
    zIndex: 100,
  },
  leafHome: {
    height: 250,
    width: 250,
    resizeMode: "contain",
    position: "absolute",
    right: -60,
    // tintColor:"transparent"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: responsiveHeight(10),
    width: "90%",
    backgroundColor: "white",
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
    elevation: 5
  },
  tempContainer: {
    width: "40%"
  },
  tempWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 0
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
    marginLeft: 'auto',
  },
  tempText: { fontSize: 15, marginHorizontal: 5 },
  degreeText: { fontSize: 16, fontWeight: '400', marginLeft: 2 },
  weatherIcon: { width: 50, height: 50, resizeMode: "contain", marginLeft: 2, marginRight: 10 },
  weatherDescription: { marginLeft: 5, marginTop: 1 },
  weatherDescText: { fontSize: responsiveFontSize(1.5),color: 'rgba(255, 181, 1, 1)', textTransform: 'capitalize', width: "100%" },
  leftLeaf: {
    height: 200,
    width: 200,
    resizeMode: "contain",
    position: "absolute",
    left: -40,
  },
  divider: { width: 1, height: '60%', backgroundColor: '#d3d3d3', marginLeft: 5 },
  degree2Text: { fontSize: 14, color: '#d3d3d3', marginTop: -5 },
  rangeText: { fontSize: responsiveFontSize(1.8),color: '#00000099', },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 20, height: 20, resizeMode: "contain" },
  locationText: { marginLeft: 5, fontSize: 12, width: '70%' },
});

const styles = StyleSheet.create({
  flexFull: { flex: 1 },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  headerText: {fontSize: 18 },
  weatherInfoCard: {
    width: "90%",
    alignSelf: "center",
    marginTop: 30,
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    backgroundColor: "white",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  locationTimeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 20, height: 20, resizeMode: "contain" },
  locationText: { marginLeft: 5, fontSize: 12,},
  timeText: { fontSize: 12, fontWeight: "600" },
  weatherDetails: { flexDirection: 'row', marginTop: 5, marginBottom: 10 },
  weatherDescriptionContainer: { flexDirection: 'row', alignItems: 'center' },
  weatherIcon: { width: 110, height: 110, resizeMode: "contain" },
  weatherDescription: { marginLeft: 35 },
  weatherDescText: { fontSize: 25,color: '#FF6A00', textTransform: 'capitalize', width: "65%" },
  tempText: { fontSize: 54,marginTop: 10 },
  degreeText: { fontSize: 14, fontWeight: '400', marginTop: 35, marginLeft: 2 },
  degree2Text: { fontSize: 14,},
  tempRange: { flexDirection: 'row', justifyContent: 'space-between', width: '60%' },
  rangeText: { fontSize: 14, },
  weatherStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 },
  weatherStatItem: { flexDirection: 'row', alignItems: 'center' },
  weatherStatIcon: { width: 20, height: 20, resizeMode: "contain" },
  weatherStatText: { marginLeft: 5, fontSize: 14,},
  divider: { width: 1, height: '100%', backgroundColor: '#d3d3d3' },
  graphContainer: { marginTop: 80, paddingHorizontal: 15 },
  graphTitle: { fontWeight: '600', fontSize: 14 },
  fiveDayForecast: {
    marginTop: 0, paddingLeft: 20, backgroundColor: "white", padding: 20, width: '90%', alignSelf: "center", borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  fiveDayTitle: { fontWeight: '600', fontSize: 15 },
  forecastItem: { marginHorizontal: 5, paddingHorizontal: 3, marginTop: 5 },
  forecastDay: { fontSize: 10, color: '#888' },
  forecastIcon: {
    width: 40, height: 40, resizeMode: "contain", marginVertical: 3,
  },
  forecastTemp: { marginTop: 5, fontSize: 14, color: '#d3d3d3' },
  flatListContainer: { marginTop: 5 },
  chartContainer: { alignItems: 'center', marginVertical: 4 },
  chart: { marginBottom: 5, borderRadius: 10 }
});

export default WeatherScreen;

