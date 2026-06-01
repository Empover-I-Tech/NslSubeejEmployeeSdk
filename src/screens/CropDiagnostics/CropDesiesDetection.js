import { StatusBar, StyleSheet, Text, View, Image, FlatList, Linking, TouchableOpacity, Alert, Platform, Dimensions,SafeAreaView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { translate } from '../../Localization/Localisation';
import { Styles } from '../assets/style/styles';
import { configs, HTTP_OK } from '../helpers/URLConstants';
import { GetApiHeaders, getNetworkStatus, GetRequest } from '../NetworkUtils/NetworkUtils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import RNFS from "react-native-fs";
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import SimpleToast from 'react-native-simple-toast';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFontStyles } from '../../hooks/useFontStyles';
const {height}=Dimensions.get("window")


const CropDesiesDetection = ({ route }) => {
  const navigation = useNavigation();
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const fonts=useFontStyles()
  // const [cropDiseases, setCropDiseases] = useState(route?.params?.data || []);
  // const [imageUrl, setImageUrl] = useState(route?.params?.data[0]?.imageUrl || null)
  // const [cropname, setCropname] = useState(route?.params?.data[0]?.crop_name || '')
  // const [diseasename, setDiseasename] = useState(route?.params?.data[0]?.disease_name || '')
  // const [diagnosis, setDiagnosis] = useState(route?.params?.data[0]?.diagnosis || '')
  // const [advisory, setAdvisory] = useState(route?.params?.data[0]?.advisory || [])
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [cropDiseases, setCropDiseases] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [cropName, setCropName] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advisory, setAdvisory] = useState([]);
  const viewShotRef = useRef(null);

  useEffect(() => {
    const data = route?.params?.data;

    let normalizedData = [];

    // Normalize to array
    if (Array.isArray(data)) {
      normalizedData = data;
    } else if (typeof data === 'object' && data !== null) {
      normalizedData = [data];
    }

    setCropDiseases(normalizedData);

    const firstItem = normalizedData[0] || {};

    // setImageUrl(firstItem.imageUrl || firstItem.uploadImageUrl || null);
    // setCropName(firstItem.cropName || firstItem.cropName || '');
    // setDiseaseName(firstItem.diseaseName || firstItem.diseaseName || '');
    // setDiagnosis(firstItem.diagnosis || firstItem.diagnosis || '');
    // setAdvisory(Array.isArray(firstItem.advisory) ? firstItem.advisory : firstItem.advisory ? [{ point: firstItem.advisory }] : []);

    setImageUrl(firstItem.imageUrl || null);
    setCropName(firstItem.cropName || '');
    setDiseaseName(firstItem.diseaseName || '');
    setDiagnosis(firstItem.diagnosis || '');
    setAdvisory(Array.isArray(firstItem.advisory) ? firstItem.advisory : []);
  }, [route?.params?.data]);


  // const shareProductDetails = async () => {
  //   try {
  //     // 2. Capture view as image
  //     const uri = await viewShotRef.current.capture();
  //     console.log('Screenshot saved at:', uri);

  //     // 3. Convert to base64
  //     const base64 = await RNFS.readFile(uri, 'base64');
  //     const imageUrl = `data:image/png;base64,${base64}`;

  //     const url = `whatsapp://send?text=${encodeURIComponent(imageUrl)}`;

  //     Linking.openURL(url)
  //       .then(() => console.log('WhatsApp is open!'))
  //       .catch((err) => {
  //         SimpleToast.show(translate('whatsapp_not_installed'));
  //       });
  //   } catch (error) {
  //     console.error('Failed to share product details via WhatsApp:', error);
  //     SimpleToast.show(translate('failed_to_share_via_whatsapp'))
  //   }
  // };

  const shareProductDetails = async () => {
    try {
      if(Platform.OS === 'ios'){
        const uri = await viewShotRef.current.capture();
        const shareOptions = {
            title: 'Share via',
            url: uri,
        };
        Share.open(shareOptions);
        }else{

      
      const uri = await viewShotRef.current.capture();
      console.log('Screenshot saved at:', uri);

      const base64 = await RNFS.readFile(uri, 'base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      // const shareOptions = {
      //   title: 'Share via',
      //   url: imageUrl,
      //   social: Share.Social.WHATSAPP,
      // };
      const shareOptions = {
        url: imageUrl,
        type: 'image/png', // Important!
        social: Share.Social.WHATSAPP,
      };

      await Share.shareSingle(shareOptions);
    }
    } catch (error) {
      console.error('Failed to share product details via WhatsApp:', error);
      SimpleToast.show(translate('failed_to_share_via_whatsapp'));
    }
  };

  return (
    // <SafeAreaView >
    <View style={{ backgroundColor: "rgba(242, 246, 249, 1)", flex: 1 }}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
      <SafeAreaView style={{ backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
        <View
          style={[styleSheetStyles.header, { backgroundColor: dynamicStyles.primaryColor }]}
        >
          <TouchableOpacity style={styleSheetStyles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../../../assets/Images/samadhanBackIcon.png')} style={{
              height: 20, width: 34, tintColor: dynamicStyles.secondaryColor, marginTop: 15, marginLeft: 10
            }} />
          </TouchableOpacity>
          <Text style={[styleSheetStyles.headerText, { color: dynamicStyles.secondaryColor ,fontFamily:fonts.Bold}]}>
            {translate('crop_disease_detection')}
          </Text>
        </View>
      </SafeAreaView>
      <ViewShot ref={viewShotRef} options={{ format: Platform.OS == 'android' ? "png" : "jpg", quality: 0.1 }}>
        <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 200, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, resizeMode: 'cover' }} />
        <ScrollView>
          <View style={{ backgroundColor: "white", width: "95%", alignSelf: "center", marginTop: 20, borderRadius: 10, }}>
            <View style ={{flexDirection : 'row',justifyContent : 'space-between',margin : 10}}>
              <View>
                <Text style={[{ color: "grey",fontFamily:fonts.SemiBold ,fontSize:14}]}>{translate('disease_name')}</Text>
                <Text style={[{ color: dynamicStyles.textColor, fontFamily:fonts.Bold, fontSize: 14 }]}>{diseaseName || translate('not_available')}</Text>
              </View>
              <TouchableOpacity
                style={{
                  borderColor: '#0CB500',
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#0CB500',
                  // backgroundColor : 'black',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
                onPress={() => shareProductDetails()}
              >
                <Image
                  source={require('../../../assets/Images/whatsappkn.png')}
                  style={{ width: 25, height: 25, resizeMode: "contain", }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ height: 2, backgroundColor: 'rgba(242, 246, 249, 1)', marginVertical: 7, margin: 10 }} />

            <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10,fontFamily:fonts.Bold, fontSize: RFValue(14,height),lineHeight:25 }]}>{translate('most_possible_diagnosis')}</Text>
            <View style={{ margin: 0, width: '90%' }}>
              <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10, margin: 2, fontFamily:fonts.Regular, fontSize:RFValue(14,height),lineHeight:25}]}>{diagnosis || translate('not_available')}</Text>

              <View style={{ marginBottom: 10,maxHeight:height*0.35 }}>
                {console.log('advisoryPointsInFlatlist', advisory)}
                {advisory.length > 0 ? (
                  <FlatList
                    data={advisory}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={{ marginHorizontal: 10, flexDirection: 'row' }}>
                        <Text style={[{ color: dynamicStyles?.textColor,  fontSize:RFValue(14,height),lineHeight:25,fontFamily:fonts.Regular ,fontSize:14}]}>{index + 1}. </Text>
                        <Text style={[{ color: dynamicStyles?.textColor,  fontSize:RFValue(14,height),lineHeight:25 ,fontFamily:fonts.Regular,fontSize:14}]}>{item.point}</Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10, margin: 2,fontFamily:fonts.SemiBold, fontSize: 13 }]}>{translate('not_available')}</Text>
                )}
              </View>
            </View>
            {/* buttons */}
            {/* <View style={{ flexDirection: 'row', margin: 5, justifyContent: 'space-between', paddingBottom: 10 }}>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    borderColor: dynamicStyles.primaryColor,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 6,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                  onPress={() => console.log('Primary pressed')}
                >
                  <Image
                    source={require('../assets/images/community.png')}
                    style={{ width: 25, height: 25, marginRight: 10, resizeMode: "contain", tintColor: dynamicStyles.primaryColor }}
                  />
                  <Text style={[styles['font_size_14_bold'], { color: 'red', color: dynamicStyles.primaryColor }]}>{translate('share_on_community')}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    borderColor: '#0CB500',
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#0CB500',
                    padding: 10,
                    borderRadius: 6,
                  }}
                  onPress={() => shareProductDetails()} 
                >
                  <Image
                    source={require('../assets/images/callIcon.png')}
                    style={{ width: 25, height: 25, marginRight: 10, resizeMode: "contain" }}
                  />
                  <Text style={[styles['font_size_14_bold'], { color: 'white', }]}>{translate('whatsapp')}</Text>
                </TouchableOpacity>
              </View>
            </View> */}
            {/* <View>
              <View style={{ alignItems: 'center', margin: 10 }}>
                <TouchableOpacity
                  style={{
                    borderColor: '#0CB500',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0CB500',
                    width: 40, // Make width and height equal for circle
                    height: 40,
                    borderRadius: 20,
                  }}
                  onPress={() => shareProductDetails()}
                >
                  <Image
                    source={require('../assets/images/callIcon.png')}
                    style={{ width: 25, height: 25, resizeMode: "contain", }}
                  />
                </TouchableOpacity>
              </View>
            </View> */}
          </View>
        </ScrollView>
      </ViewShot>
    </View>


    // </SafeAreaView>
  )
}

export default CropDesiesDetection

const styleSheetStyles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  headerText: { fontSize: 18 },
  font14: { fontSize: 14,  fontWeight: "bold" },


})