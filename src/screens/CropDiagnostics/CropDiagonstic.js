import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, Linking, Modal, ImageBackground, PermissionsAndroid, Button, TouchableWithoutFeedback, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Colors } from '../../styles/colors';
import ImagePicker from 'react-native-image-crop-picker';
import { GetApiHeaders } from '../../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import PreLoginCustomLoader from '../../components/PreLoginCustomLoader';

import SimpleToast from 'react-native-simple-toast';
import CustomButton from '../../components/CustomButton';
// import CustomSuccessLoader from '../Components/CustomSuccessLoader';
// import CustomErrorLoader from '../Components/CustomErrorLoader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { translate } from '../../Localization/Localisation';
import CustomGalleryPopup from '../../components/CustomGalleryPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';
import Geolocation from 'react-native-geolocation-service';
import APIConfig, { HTTP_OK } from '../../api/APIConfig';
import useGetRequestWithJwt from '../../api/useGetRequestWithJwt';
import CustomLoader from '../../components/cropDiagnosisLoader';
import usePostRequestWithJwt from '../../api/usePostRequestWithJwt';
import { useFontStyles } from '../../hooks/useFontStyles';

const CropDiagonstic = ({ route }) => {
  const { fetchData } = useGetRequestWithJwt();
  const fonts=useFontStyles()
  const { postData, error, apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
  const isConnected = useSelector(state => state.network.isConnected);
  const [loaderImage, setLoaderImage] = useState(require('../../../assets/Images/SubeejLoader.gif'))
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [cropLoading, setCropLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(translate('Crop_Diagnostic'));
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [ImageData, setImageData] = useState(null);
  const [cameraRelatedPopUp, setCameraRelatedPopUp] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  let [fromGallery, setFromGallery] = useState(false);
  let [proceedEnabled, setproceedEnabled] = useState(false)
  const [diseases, setDiseases] = useState([]);
  const [coordinates, setCoordinates] = useState({});
  const [latitude, setLatitude] = useState(route?.params?.geoLocation?.split(",")[0]);
  const [longitude, setLongitude] = useState(null);



  useEffect(() => {
    if (selectedFilter === translate('history')) {
      getHistory();
    }
  }, [selectedFilter]);


  useEffect(() => {
    GetUserLocation()
  }, [])
  const GetUserLocation = async () => {
    if (isConnected) {
      try {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude)
            setLongitude(longitude)
            setCoordinates(position.coords)
          },
          (error) => {
            if (error.code === 3 || error.code === 2) {
              Geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  setLatitude(latitude)
                  setLongitude(longitude)
                  setCoordinates(position.coords)
                },
                () =>console.log("checking"),
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 },
              );
            }
          },
          { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
        );
      } catch (err) {
        console.error("Unexpected error:", err);
        Alert.alert(translate("Error"), translate("An_unexpected_error_occurred_Please_try_again"));
      }
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
    }
  }

  const getHistory = async () => {

    if (isConnected) {
      try {
        setLoading(true)
        setCropLoading(false);
        setLoadingMessage(translate('please_wait_getting_data'))
        var getHistoryUrl = APIConfig.BASE_URL_NVM + APIConfig.CROPDIAGNOSTIC.CROPDIAGNOSTICHISTORY;

        const getHeaders = await GetApiHeaders()
        getHeaders.applicationName = "subeej"

        console.log('headersInCropDiagnosis', getHeaders);
        const APIResponse = await fetchData(getHistoryUrl, getHeaders);

        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 1000);
            console.log('what is reponse In history', JSON.stringify(APIResponse))
            setDiseases(APIResponse?.data || []);
            // if (APIResponse.response.cartList.length == 0) {
            //   navigation.goBack()
            // } else {
            //   setCartData(APIResponse.response.cartList)
            // }
          }
          else {
            SimpleToast.show(APIResponse.message)
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 1000);
        }
      } catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const cropDiagDATA = [
    {
      name: translate('Go_to_Farm'),
      id: 1,
      image: require('../../../assets/Images/cropOne.png'),
      textColor: "rgba(52, 136, 250, 1)"
    },
    {
      name: translate('Click_Photo'),
      id: 2,
      image: require('../../../assets/Images/cropTwo.png'),
      textColor: "rgba(8, 128, 180, 1)"
    },
    {
      name: translate('Find_Disease'),
      id: 3,
      image: require('../../../assets/Images/cropThree.png'),
      textColor: "rgba(70, 140, 0, 1)"
    },
  ];

  const CarouselDATA = [
    {
      name: translate('titleOne'),
      desc: translate('Desc_one'),
      id: 1,
    },
    {
      name: translate('titleTwo'),
      desc: translate('Desc_two'),
      id: 2,
    },
  ];

  let openCameraProfilePic = async () => {

    try {
      var image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      setImageData(response)
      setFromGallery(false)
      // if (!cameraRelatedPopUp) {
      setCameraRelatedPopUp(true)
      // }
    } catch (err) {
      console.error(err)
    }
    setShowSelectionModal(false)
  }

  const submitCrop = async () => {

    if (isConnected) {
      try {
        setLoading(false)
        setCropLoading(true)
        setLoadingMessage(translate('Detecting_Problem'))

        var cropDiseaseNotification = APIConfig.BASE_URL_NVM + APIConfig.CROPDIAGNOSTIC.CROPDISEASEIDENTIFICATION;
        const getHeaders = await GetApiHeaders()
        getHeaders.applicationName = "subeej"
        getHeaders['Content-Type'] = APIConfig.MULTIPARTFORMDATA;
        getHeaders.authType = "JSONREQUEST";

        // delete getHeaders.authType;
        console.log('headersIncropdiseases', getHeaders);
        console.log('headersIncropdiseasesLatLong', latitude+" "+longitude);

        const jsonData = {
          "latitude": latitude.toString(),
          "longitude": longitude.toString(),
        };

        const formData = new FormData();
        const fileExtension = ImageData.name.split('.').pop().toLowerCase();
        const mimeTypeMap = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
          gif: 'image/gif',
          bmp: 'image/bmp',
        };

        const mimeType = mimeTypeMap[fileExtension] || 'image/jpeg'; // fallback to jpeg if unknown

        console.log("📸 multipartFileBeforeAppend:", {
          uri: ImageData.uri,
          type: mimeType,
          name: ImageData.name
        });

        if (ImageData != undefined && ImageData != "" && ImageData != "") {
          console.log('ImageDataInformdata', ImageData)
          formData.append('file',
            {
              uri: ImageData.uri,
              type: mimeType,
              name: ImageData.name
            });
        } else {
          formData.append('file', "");
        }

        formData.append('jsonData', JSON.stringify(jsonData));

        console.log("FormData:", JSON.stringify(formData));

        const APIResponse = await sendData(cropDiseaseNotification, formData, getHeaders, false);
        // console.log('APIResponse APIResponseis:', JSON.stringify(APIResponse))

        if (APIResponse === undefined || APIResponse === null || APIResponse.data === undefined || APIResponse.data === null) {
          setTimeout(() => {
            setLoading(false)
            setCropLoading(false)
            setLoadingMessage()
            SimpleToast.show(APIResponse?.message)
          }, 100);
        }
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
            setCropLoading(false)
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            const tempData = APIResponse.data
            if (tempData.statusCode == HTTP_OK) {
              const dashboardRespBYPASS = tempData.response
              console.log(dashboardRespBYPASS);
              navigation.navigate("CropDesiesDetection", { data: dashboardRespBYPASS })
            }
            else {
              SimpleToast.show(translate('Something_went_wrong'))
            }

            setTimeout(() => {
              setLoading(false)
              setCropLoading(false)
              setLoadingMessage()
            }, 100);
          } else {
            // alert("reached to else condition")
            setLoading(false)
            setCropLoading(false)
            setLoadingMessage()
            // SimpleToast.show(translate('something_went_wrong'))
          }
        } else {
          // Alert.alert("reached to other else  condition")
          setTimeout(() => {
            setLoading(false)
            setCropLoading(false)
            setLoadingMessage()
            SimpleToast.show(translate('something_went_wrong'))
          }, 100);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setCropLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 100);
      }
    } else {
       SimpleToast.show(translate('no_internet_conneccted'))
    }
  }


  let openImagePickerProfilePic = async () => {


    try {
      var image = await ImagePicker.openPicker({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      setImageData(response)
      setCameraRelatedPopUp(true)
      setFromGallery(true)
    } catch (err) {
      console.error(err)
    }
    setShowSelectionModal(false)
  }

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('dontShowThisAgain', JSON.stringify(value));
      setCameraRelatedPopUp(false)
      openCameraProfilePic()
    } catch (e) {
      console.error(e)
    }
  };

  const checkData = async () => {
    try {
      const result = await AsyncStorage.getItem('dontShowThisAgain');
      return JSON.parse(result);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[{ flex: 1, backgroundColor: 'rgba(249, 249, 249, 1)' }]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View
          style={[styleSheetStyles.header, { backgroundColor: dynamicStyles.primaryColor }]}
        >
          <TouchableOpacity style={styleSheetStyles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../../../assets/Images/samadhanBackIcon.png')} style={{ height: 20, width: 34, tintColor: dynamicStyles.secondaryColor, marginTop: 15, marginLeft: 10 }} />
          </TouchableOpacity>
          <Text style={[styleSheetStyles.headerText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>
            {translate('Crop_Diagnostic_Tool')}
          </Text>
        </View>
        <View style={[{ backgroundColor: dynamicStyles?.highLightedColor }, styleSheetStyles.tabMain]}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => setSelectedFilter(translate('Crop_Diagnostic'))} style={[selectedFilter === translate('Crop_Diagnostic') && { backgroundColor: dynamicStyles.primaryColor }, styleSheetStyles.tabBtn]}>
            <Text style={[selectedFilter === translate('Crop_Diagnostic') ? { color: dynamicStyles.secondaryColor } : { color: dynamicStyles.textColor }, styleSheetStyles.tabTxt,{fontFamily:fonts.SemiBold}]}>{translate('Crop_Diagnostic')}</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={() => {
            setSelectedFilter(translate('history'));
          }} style={[selectedFilter === translate('history') && { backgroundColor: dynamicStyles.primaryColor }, styleSheetStyles.tabBtn]}>
            <Text style={[selectedFilter === translate('history') ? { color: dynamicStyles.secondaryColor } : { color: dynamicStyles.textColor }, styleSheetStyles.tabTxt,{fontFamily:fonts.SemiBold}]}>{translate('history')}</Text></TouchableOpacity>
        </View>

        {
          selectedFilter === translate('Crop_Diagnostic') &&
          <View style={{ marginVertical: 10, height: '80%' }}>
            <FlatList
              data={cropDiagDATA}
              ListFooterComponent={<>
                <View style={{ marginTop: 3, bottom: 1 }}>
                  <CustomButton
                    onPress={() => {
                      setShowSelectionModal(true)
                    }}
                    title={translate('Take_a_Picture')}
                    buttonBg={dynamicStyles.primaryColor}
                    btnWidth={'90%'}
                    titleTextColor={dynamicStyles.secondaryColor}
                    textAlign='center'
                  />
                </View>
                <View style={{ height: 50 }} /></>}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<>
                <View style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                  height: 60
                }}>
                  <Text style={{
                    fontFamily:fonts.SemiBold,
                    fontSize: 16,
                    color: dynamicStyles?.primaryColor
                  }}>
                    {translate('No_data_available')}
                  </Text>
                </View>
              </>}
              renderItem={({ item }) => <View key={item.id} style={{
                width: "90%", backgroundColor: "white", marginVertical: 10, alignSelf: "center", elevation: 1, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center", paddingVertical: 15
              }}>
                <Image source={item.image} style={{ height: 60, width: 60, resizeMode: "contain", alignSelf: "center" }} />
                <Text style={{ color: item.textColor, fontSize: 12, alignSelf: "center", marginTop: 5,fontFamily:fonts.Regular }}>{item.name}</Text>
              </View>}
              keyExtractor={item => item.id}

            />
            <Modal
              animationType="fade"
              transparent={true}
              visible={cameraRelatedPopUp}
            // onRequestClose={onPressingOut}
            >
              <View
                // testID="openAttachmentModal"
                //   onPressOut={onPressingOut}
                style={stylesheetStyes.overallContainer}
              >
                <TouchableWithoutFeedback>
                  {ImageData !== null
                    ?
                    // proceedEnabled ?
                    //   <View style={[[stylesheetStyes.subContainer, {
                    //     height: responsiveHeight(50),
                    //     alignItems: "center", justifyContent: "center"
                    //   }]]}>
                    //     <TouchableOpacity
                    //       style={{
                    //         position: "absolute",
                    //         right: 0,
                    //         top: 0,
                    //         padding: 15,
                    //         zIndex: 100
                    //       }}
                    //       onPress={() => {alert('attempted to close')}}>
                    //       <Image source={require('../assets/images/crossMark.png')} style={{ height: 20, width: 20, resizeMode: "contain" }} />
                    //     </TouchableOpacity>
                    //     <View style={{ backgroundColor: "rgba(0, 0, 0, 0.03)", height: 250, width: 250, alignItems: "center", justifyContent: "center", borderRadius: 500, alignSelf: "center" }}>
                    //       <Image source={require("../assets/images/cropThree.png")} style={{
                    //         height: 120,
                    //         width: 120, resizeMode: "cover", alignSelf: "center",
                    //       }} />
                    //     </View>
                    //     <Text style={{ color: 'rgba(0, 0, 0, 1)',  fontSize: 12, alignSelf: "center", textAlign: "center", width: "55%", marginTop: 20 }}>{translate("Detecting_Problem")}</Text>
                    //   </View>
                    //   : 
                    <View style={[[stylesheetStyes.subContainer, {
                    }]]}>
                      <Image source={{ uri: ImageData?.uri }} style={{
                        height: responsiveHeight(68),
                        marginTop: 10,
                        borderRadius: 15,
                        width: responsiveWidth(85), resizeMode: "cover", alignSelf: "center",
                      }} />
                      <View style={[styleSheetStyles.container, {
                        marginTop: 25
                      }]}>
                        <TouchableOpacity onPress={() => {
                          if (fromGallery) {
                            // setCameraRelatedPopUp(false)
                            openImagePickerProfilePic()
                          }
                          else { openCameraProfilePic() }
                        }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor }]}>
                          <Text style={[styleSheetStyles.buttonText, { color: dynamicStyles.primaryColor,fontFamily:fonts.Regular }]}>{fromGallery ? translate("ReSelect") : translate('Re-Take')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          submitCrop()
                          setCameraRelatedPopUp(false)
                        }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: Colors.lightGray, backgroundColor: dynamicStyles.primaryColor, }]}>
                          <Text style={[styleSheetStyles.buttonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.Regular }]}>{translate('proceed')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    : <View style={[stylesheetStyes.subContainer]}>
                      <TouchableOpacity
                        onPress={() => {
                          storeData(true)
                        }}
                        style={{ position: "absolute", right: 15, top: 20 }}>
                        <Text style={{ color: dynamicStyles.primaryColor, fontSize: 10,fontFamily:fonts.Regular }}>{translate('Dont_show_this_again')}</Text>
                      </TouchableOpacity>
                      <Image style={{ height: 200, width: 200, resizeMode: "contain", alignSelf: "center", marginTop: responsiveHeight(10) }} source={require('../../../assets/Images/cameraPopup.png')} />
                      <Text style={{ color: dynamicStyles.primaryColor, fontSize: 13, alignSelf: "center", marginTop: responsiveHeight(5),fontFamily:fonts.Regular }}>{CarouselDATA[carouselIndex].name}</Text>
                      <Text style={{ color: dynamicStyles.textColor, fontSize: 11, alignSelf: "center", textAlign: "center", width: "92%", marginTop: 5,fontFamily:fonts.Regular }}>{CarouselDATA[carouselIndex].desc}</Text>
                      <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", position: "absolute", bottom: responsiveHeight(18) }}>
                        <View style={[carouselIndex === 0 ? { height: 10, width: 10, backgroundColor: dynamicStyles.primaryColor, borderRadius: 60, marginRight: 2.5 } : { height: 10, width: 10, borderColor: dynamicStyles.primaryColor, borderRadius: 60, borderWidth: 1, marginRight: 2.5 }]} />
                        <View style={[carouselIndex === 1 ? { height: 10, width: 10, backgroundColor: dynamicStyles.primaryColor, borderRadius: 60 } : { height: 10, width: 10, borderColor: dynamicStyles.primaryColor, borderRadius: 60, borderWidth: 1 }]} />
                      </View>
                      <View style={[styleSheetStyles.container, {
                        marginTop: "auto"
                      }]}>
                        <TouchableOpacity onPress={() => {
                          setCarouselIndex(1)
                          openCameraProfilePic()
                        }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor }]}>
                          <Text style={[styleSheetStyles.buttonText, { color: dynamicStyles.primaryColor,fontFamily:fonts.Regular }]}>{translate('skip')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          if (carouselIndex === 0) {
                            setCarouselIndex(carouselIndex + 1)
                          } else {
                            openCameraProfilePic()
                          }
                        }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: Colors.lightGray, backgroundColor: dynamicStyles.primaryColor, }]}>
                          <Text style={[styleSheetStyles.buttonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.Regular }]}>{translate('Next')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>}
                </TouchableWithoutFeedback>
              </View>
            </Modal>
          </View>
        }

        <CustomGalleryPopup
          showOrNot={showSelectionModal}
          onPressingOut={() => setShowSelectionModal(false)}
          onPressingCamera={async () => {
            if (await checkData()) {
              openCameraProfilePic()
            } else {
              setCameraRelatedPopUp(true), setShowSelectionModal(false), setImageData(null), setCarouselIndex(0)
            }
          }}
          onPressingGallery={() => { setImageData(null), openImagePickerProfilePic() }}
        />

        {
          selectedFilter === translate('history') &&
          <View style={{ marginVertical: 10, height: '80%' }}>
            {diseases.length > 0 ? (
              <FlatList
                data={diseases}
                ListFooterComponent={<View style={{ height: 50 }} />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<>
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 20,
                    height: 60
                  }}>
                    <Text style={{
                      fontFamily:fonts.SemiBold,
                      fontSize: 16,
                      color: dynamicStyles?.primaryColor
                    }}>
                      {translate('No_data_available')}
                    </Text>
                  </View>
                </>}
                renderItem={({ item }) => <View style={{
                  width: "90%", backgroundColor: "white", marginVertical: 10, alignSelf: "center", elevation: 1, borderRadius: 10, padding: 10
                }}>
                  {console.log('itemsInrender', item)}
                  <View style={{ flex: 1, borderWidth: 2, borderColor: "rgba(0, 0, 0, 0.05)", borderRadius: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: dynamicStyles.highLightedColor, height: 35, paddingHorizontal: 10 }}>
                      <Image tintColor={dynamicStyles.primaryColor} source={require('../../../assets/Images/diseaseDetected.png')} style={{ height: 20, width: 20, resizeMode: "contain" }} />
                      <Text style={{ color: dynamicStyles.primaryColor, marginLeft: 10 ,fontFamily:fonts.SemiBold}}>{item.cropDiseaseTitle != undefined ? item.cropDiseaseTitle : translate('No_Disease_Detected')}</Text>
                    </View>
                    <View style={{ padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={item?.imageUrl ? { uri: item.imageUrl } : require('../../../assets/Images/image_not_exist.png')} style={{ height: 65, width: 65, resizeMode: "contain", borderRadius: 60 }} />
                        <View>
                          <Text style={{ color: dynamicStyles.textColor, marginLeft: 10, fontSize: 12,fontFamily:fonts.Regular }}>{item?.diseaseName || ''}</Text>
                          <Text style={{ color: dynamicStyles.textColor, marginLeft: 10, fontSize: 10 ,fontFamily:fonts.Regular}}>{item?.cropName || ''}</Text>
                          <Text style={{ color: 'rgba(85, 85, 85, 1)', marginLeft: 10, fontSize: 10,fontFamily:fonts.Regular }}>{item?.createdOn?.split('T')[0] || ''}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={{ maxWidth: "40%", alignItems: "center", justifyContent: "center", padding: 8, margin: 8, borderWidth: 1, borderColor: dynamicStyles.primaryColor, borderRadius: 5 }} onPress={() => navigation.navigate("CropDesiesDetection", { data: item })}>
                      <Text style={{ color: dynamicStyles.primaryColor ,fontFamily:fonts.SemiBold,fontSize:14}}>{translate("View_Details")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>}
                keyExtractor={item => item.id}

              />
            ) : (
              <View style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}>
                <Text style={[{ color: 'red', marginLeft: 10, fontWeight: '500', fontSize: 14 ,fontFamily:fonts.SemiBold}]}>{translate('No_data_available')}</Text>
              </View>
            )}
          </View>
        }

        {cropLoading && <CustomLoader loading={cropLoading} message={loadingMessage} loaderImage={require("../../../assets/Images/plant_animation.gif")} fromCropDiag={cropLoading} />}
        {loading && !cropLoading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} fromCropDiag={false} />}
        {/* {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
        {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}  */}
        {/* {loading && <PreLoginCustomLoader />} */}
      </View>
    </View>
  );
};



const styleSheetStyles = StyleSheet.create({
  buttonText: {
    fontSize: 14,
  },
  container: {
    // top:5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    width: '45%',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    bottom: 10
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  saveButton: {},
  flexFull: { flex: 1 },
  tabBtn: { width: "50%", height: "100%", borderRadius: 5, alignItems: "center", justifyContent: "center" },
  tabMain: {
    height: 45, width: responsiveWidth(90), alignSelf: "center", marginTop: responsiveHeight(2), borderRadius: 5, marginBottom: responsiveHeight(0.5),
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  headerText: { fontSize: 18 },
  dabba: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: "90%",
    alignSelf: "center",
    // height: 200,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    // borderColor:'rgba(0, 0, 0, 0.06)',borderWidth:2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  tabTxt: { fontSize: 14,},
});

const stylesheetStyes = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewTen: { marginLeft: responsiveWidth(2.5) },
  imgTwo: {
    height: 50,
    width: 50,
    borderRadius: 6,
  },
  textFive: { marginBottom: responsiveHeight(1) },
  viewTwelve: { marginTop: 20 },
  textSeven: {
    textAlign: "center",
    // color: COLORS.paragraphText
  },
  textSix: {
    position: "absolute",
    right: responsiveWidth(1),
    bottom: responsiveHeight(0),
    fontSize: responsiveFontSize(1.5),
    color: "rgba(37,39,73,0.5)",
  },
  viewEleven: {
    height: responsiveHeight(35),
    width: responsiveWidth(100),
    backgroundColor: "rgba(255,255,255,1)",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  uploadText: {
    fontSize: responsiveFontSize(2.3),
    marginLeft: responsiveWidth(5),
    marginTop: responsiveHeight(4),
    // color: COLORS.darkBlueGrey,
    fontWeight: "bold",
  },
  textEight: { fontSize: responsiveFontSize(3) },
  viewThirteen: { padding: responsiveHeight(1) },
  touchOne: {
    flexDirection: "row",
    height: responsiveHeight(6),
    borderRadius: 50,
    margin: responsiveHeight(1),
    width: responsiveWidth(12),
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    height: responsiveHeight(80),
    width: responsiveWidth(90),
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingBottom: 15,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  image3: {
    height: responsiveHeight(4),
    width: responsiveWidth(8),
  },
  text11: {
    // color: COLORS.darkBlueGrey,
    fontWeight: "bold",
    marginRight: responsiveWidth(10),
    marginTop: responsiveHeight(2),
  },
  touchTwo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 0.3,
    borderBottomColor: "rgba(37,39,73,0.1)",
  },
  viewNine: { flexDirection: "row" },
  scrollViewStyle: { flex: 1, backgroundColor: "rgba(255,255,255,1)" },
  textFour: {
    //  color: COLORS.petwatchOrange
  },
  viewEight: {
    // borderColor: COLORS.petwatchOrange,
    borderRadius: responsiveHeight(1),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: responsiveHeight(0.1),
    height: responsiveHeight(5),
    width: responsiveWidth(25),
    marginRight: responsiveWidth(5),
  },
  textThree: {
    //  color: COLORS.paragraphText
  },
  textTwo: {
    marginRight: responsiveWidth(2),
    // color: COLORS.petwatchOrange
  },
  viewSeven: { paddingLeft: responsiveWidth(5) },
  viewSix: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(0.5),
  },
  viewFive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F1F1",
    height: responsiveHeight(10),
    width: responsiveWidth(100),
  },
  cameraView: { alignItems: "center", justifyContent: "center" },
  viewFour: { marginLeft: responsiveWidth(2) },
  textOne: {
    marginLeft: responsiveWidth(3),
    // color: COLORS.darkBlueGrey,
    fontSize: responsiveFontSize(2.2),
  },
  imgOne: {
    height: 50,
    width: 50,
    borderRadius: 6,
  },
  viewTwentyOne: {
    height: responsiveHeight(8),
    width: responsiveWidth(16),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginRight: responsiveWidth(10),
  },
  cameraOverallView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(5),
    marginLeft: responsiveWidth(5),
  },
  galleryImage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  viewThree: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: responsiveWidth(70),
  },
  viewOne: {
    height: responsiveHeight(8),
    width: responsiveWidth(100),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,1)",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  overallContainer: {
    flex: 1,
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    alignItems: "center",
    justifyContent: "center"
  },
  viewTwo: { padding: responsiveWidth(4) },
  outerContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,1)",
    marginTop: responsiveHeight(3),
  },
  topContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "rgba(37,39,73,0.1)",
    width: responsiveWidth(75),
  },
  avatar: {
    marginTop: responsiveHeight(2),
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderRadius: responsiveHeight(1),
  },
  trueBorder: {
    borderBottomLeftRadius: responsiveHeight(2),
    borderBottomRightRadius: responsiveHeight(2),
    borderTopRightRadius: responsiveHeight(2),
    backgroundColor: "rgba(254, 91, 87,0.1)",
  },
  falseBorder: {
    borderBottomLeftRadius: responsiveHeight(2),
    borderBottomRightRadius: responsiveHeight(2),
    borderTopLeftRadius: responsiveHeight(2),
  },
  leftMargin: { marginRight: 16 },
  rightMargin: { marginLeft: 16 },
  avatarContent: {
    fontSize: 30,
    textAlign: "center",
    textAlignVertical: "center",
  },
  messageContent: {
    padding: responsiveHeight(1),
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(2),
    padding: 3,
    backgroundColor: "#F4F4F4",
    width: responsiveWidth(90),
    marginLeft: responsiveWidth(5),
    borderRadius: responsiveHeight(3),
    marginBottom: responsiveHeight(3),
  },
  textInput: {
    backgroundColor: "#F4F4F4",
    width: responsiveWidth(64),
    marginLeft: responsiveWidth(3),
    padding: 16,
  },
  submit: { marginLeft: responsiveWidth(2) },
  view4: { borderRadius: responsiveHeight(60) },
  viewSafe: { flex: 1, backgroundColor: "white" },
  image: {
    minWidth: responsiveWidth(50),
    minHeight: responsiveHeight(50),
    marginBottom: responsiveHeight(1),
  },
  pdf: {
    padding: 7,
    fontSize: responsiveFontSize(1.5),
    fontWeight: "600",
    lineHeight: 5,
  },
  fastImageOne: {
    height: responsiveHeight(10),
    width: responsiveWidth(20),
    marginBottom: responsiveHeight(2),
  },
  touchThree: {
    height: responsiveHeight(15),
    alignItems: "center",
    justifyContent: "center",
  },
});


export default CropDiagonstic;
