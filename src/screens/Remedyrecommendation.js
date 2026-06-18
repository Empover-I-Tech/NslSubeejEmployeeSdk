import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { strings } from "../strings/strings";
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SimpleToast from 'react-native-simple-toast';
import axios from 'axios';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { GetApiHeaders } from '../utils/helpers';
import { translate } from '../Localization/Localisation';
import RenderHTML from 'react-native-render-html';
import CustomCircularProgress from '../components/CustomCircularProgress';
import { useFontStyles } from '../hooks/useFontStyles';
const { height } = Dimensions.get("window")

const Remedyrecommendation = ({ route }) => {
  const fonts = useFontStyles()
  const [diseaseData, setDiseaseData] = useState(route?.params?.data || '')
  // console.log('rrrrrrr', route)
  const [pests, setPests] = useState(route?.params?.data?.pests || '')
  const [description, setDescription] = useState(route?.params?.data?.description || '')
  const [cropName, setCropName] = useState(route?.params?.cropName || '');
  let [SowingDate, setSowingDate] = useState('')
  const dynamicStyles = useSelector((state) => state.companyStyles.companyStyles);
  const navigation = useNavigation()
  const FILTERS = [translate('fifteenDaysForecast'), translate('Hourly')];
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')

  let [localLatitude, setLocalLatitude] = useState(null)
  let [localLongitude, setLocalLongitude] = useState(null)
  let [localAddress, setLocalAddress] = useState(null)
  let [forecastData, setForecastData] = useState(null)
  let [hourlyData, setHourlyData] = useState(null)
  let [cityDet, setCityDet] = useState(null)
  let [selectedCrop, setSelectedCrop] = useState(null)
  let [pestForecastData, setPestForecastData] = useState(null)
  const [diagnosis, setDiagnosis] = useState('');
  const [advisory, setAdvisory] = useState([]);
  const isConnected = useSelector(state => state.network.isConnected);



  let getWeatherData = async (lat, long) => {
    const headers = await GetApiHeaders();
    const url = APIConfig.BASE_URL_NVM + APIConfig.nslgetWeatherDetailsV1
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
          }, 100);
        } else {
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

  useFocusEffect(
    React.useCallback(() => {
      console.log('screen focused')
      console.log(route.params)
      let callApi = async () => {
        if (route?.params?.latitudes) {
          const { latitudes, longitudes, address } = route?.params;
          latitudes !== undefined && setLocalLatitude(latitudes);
          longitudes !== undefined && setLocalLongitude(longitudes);

          setLocalAddress(address)
          getWeatherData(latitudes, longitudes)
          let res = await getDetailsFromLatlong(latitudes, longitudes)
          console.log(res, "<------------------ res")
          setCityDet(res)
          setSelectedCrop(null);
          setSowingDate('');
          setPestForecastData(null)
          // if(selectedFilter === translate('PestForecast')){
          // }
        }
        if (route?.params?.enablePestForecast === true) {
          setSelectedFilter(translate('PestForecast'))
        }
      }
      callApi()
    }, [route?.params])
  );

  const getDetailsFromLatlong = async (latitude, longitude) => {
    const url = MAP_MY_INDIA_URL;
    try {
      let urll = `${url}?lat=${latitude}&lng=${longitude}`
      const response = await axios.get(urll);
      console.log(response.data.results, ",,,,,,, res from rev geo code")
      if (response.data && response.data.results) {
        const { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality } = response.data.results[0];
        return { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality };
      } else {
        console.warn('No results found from reverse geocoding');
        return null;
      }
    } catch (error) {
      console.error('Error fetching reverse geocode data:', error.message);
      return null;
    }

  }

  useEffect(() => {
    getRedemy();
  }, [])

  const getRedemy = async () => {
    // console.log("called getRedemy API");

    if (isConnected) {
      try {
        setTimeout(() => {
          setLoading(true);
          setLoadingMessage(translate('please_wait_getting_data'));
        }, 50);

        const getRemedyUrl = APIConfig.BASE_URL_NVM + APIConfig.getRemedies;
        const headers = await GetApiHeaders();

        const payload = {
          cropName: cropName,
          diseaseName: pests,
          latitude: route.params.latitude.toString(),
          longitude: route.params.longitude.toString(),
        };
        console.log('URLInR:', getRemedyUrl);
        console.log('PayloadInR:', payload);
        console.log('headers:', headers);

        const APIResponse = await axios.post(getRemedyUrl, payload, { headers });

        console.log('Response:', APIResponse.data);

        if (APIResponse?.data) {
          setTimeout(() => {
            setLoading(false);
            setLoadingMessage('');
          }, 500);

          const { statusCode, response, message } = APIResponse.data;

          if (statusCode === HTTP_OK) {
            if (response != null) {
              setDiagnosis(response[0]?.diagnosis);
              setAdvisory(response[0]?.advisory);
            }

          } else {
            SimpleToast.show(message || translate('something_went_wrong'));
          }
        } else {
          setTimeout(() => {
            setLoading(false);
            setLoadingMessage('');
          }, 1000);
        }
      } catch (error) {
        console.error('Remedy API Error:', error);
        setTimeout(() => {
          setLoading(false);
          setSuccessLoadingMessage(error.message);
        }, 1000);
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'));
    }


  };



  return (
    <View style={[styles.flexFull, styles.gray300bg]}>
      {/* {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />} */}
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
      <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[{ flexDirection: 'row' }]} onPress={() => navigation.goBack()}>
          <Image source={require('../../src/assets/images/weatherScreen/newBackButton.png')} style={{ height: 20, width: 34, tintColor: dynamicStyles.secondaryColor, marginTop: 3 }} />
          <Text style={[styles.headerText, { marginLeft: 10, color: dynamicStyles.secondaryColor, fontFamily: fonts.Bold }]}>
            {translate('remedy_recommendation')}
          </Text>
        </TouchableOpacity>

      </View>
      <ScrollView>
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, margin: 10, width: "90%", alignSelf: "center", borderRadius: 10, shadowColor: '#000', backgroundColor: "white", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 2 }}>
          <View style={{ margin: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ width: "78%" }}>
              <Text style={[{ color: dynamicStyles.textColor, fontFamily: fonts.Bold, fontSize: 14, lineHeight: 30 }]}>{pests}</Text>
              <Text style={[{ color: dynamicStyles?.textColor, fontSize: 14, lineHeight: 25, fontFamily: fonts.Medium }]}>{description}</Text>
            </View>
            {diseaseData?.percentage && <CustomCircularProgress
              percentage={diseaseData?.percentage} radius={25} strokeWidth={6} percentageText={diseaseData?.percentage} level={diseaseData?.level}
            />}
          </View>
          <View style={{ height: 2, backgroundColor: 'rgba(242, 246, 249, 1)', marginVertical: 7, margin: 10 }} />
          <View style={{ margin: 10 }}>
            <Text style={[{ color: dynamicStyles?.textColor, fontSize: 14, marginBottom: 10, fontFamily: fonts.Bold }]}>{diagnosis}</Text>
            <View style={{ maxHeight: height * 0.55 }}>
              {advisory?.length > 0 ? (
                <FlatList
                  data={advisory}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', width: "95%" }}>
                      <Text style={[{ color: dynamicStyles?.textColor, fontSize: 14, lineHeight: 26, fontFamily: fonts.Regular }]}>{index + 1}. </Text>
                      <Text style={[{ color: dynamicStyles?.textColor, fontSize: 14, lineHeight: 26, fontFamily: fonts.Regular }]}>{item.point}</Text>
                    </View>
                  )}
                />
              ) : (
                <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10, margin: 2, fontFamily: fonts.Regular, fontSize: 13 }]}>{translate('not_available')}</Text>
              )}
            </View>

          </View>
        </View>
      </ScrollView>
      {/* {loading && !cropLoading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} fromCropDiag={false} />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  flexFull: { flex: 1 },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  headerText: { fontSize: 18 },

});

export default Remedyrecommendation;
