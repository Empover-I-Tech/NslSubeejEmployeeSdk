import { Text, View, TouchableOpacity, Dimensions, Linking, ScrollView, StyleSheet, Image, Platform, StatusBar, FlatList, Modal, TouchableWithoutFeedback } from "react-native";
import { useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { RFValue } from "react-native-responsive-fontsize";
import usePostRequestWithJwt from '../api/usePostRequestWithJwt';
import { GetApiHeaders } from '../utils/helpers';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { WebView } from 'react-native-webview';
import SimpleToast from 'react-native-simple-toast';
import axios from "axios";
import realm from "./realmOffline/realmConfig";
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useFontStyles } from "../hooks/useFontStyles";
import CustomLoader from "../components/CustomLoader";
const { width, height } = Dimensions.get('window');


const KnowledgeCenterRn = () => {
  const fonts=useFontStyles()
  const isConnected = useSelector(state => state.network.isConnected);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const navigation = useNavigation();
  const currentTheme = useSelector(state => state.theme.theme);
  const [menuController, setMenuController] = useState([]);
  const [cropIdSelected, setCropIdSeleceted] = useState(null);
  const [hybridList, setHybridList] = useState([]);
  const [cropImg, setCropImg] = useState("");
  const [cropImageCache,setCropImgCache]=useState("")
  const [nslCrop, setNslCrop] = useState(false);
  const [seasonId, setSeasonId] = useState(null);
  const [cropName, setCropName] = useState("");
  const [hybridsVisible, setHybridVisible] = useState(false);
  const [seasonName, setSeasonName] = useState("");
  const [hybridDescriptionPop, setHybDesPop] = useState(false);
  const [loaderApi, setLoaderApi] = useState(false);
  const [fabDetails, setFabDetails] = useState(null);
  const { error: apiError, sendData } = usePostRequestWithJwt();
  const [productLeafLetModal, setProductLeafLetModal] = useState(false);
  const [productLeafValue, setProductLeafValue] = useState("");
  const [youTubeLinkValue, setYouTubeLink] = useState("");
  const [hydImg, setHydImg] = useState("");
  const [backBtnDisable, setBackBtnDisable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const cachedGoldClubKnowledgeCenter = realm.objects('GoldCludKnowledgeCenter') 
  const [hybridName,setHybridName]=useState("")
  const [hybridImgsObj,setHybridImgsObj]=useState({})
  const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
  const RETRY_ATTEMPTS = 2;


  useFocusEffect(
    useCallback(() => {
      fetchHybridsAndIssueTypesAndCrops();
    }, [])
  );

  
    const downloadImageToLocal = async (url, fileName) => {
    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
  
    try {
      const fileExists = await RNFS.exists(localPath);
      if (fileExists) {
        console.log(`Image already exists at: ${localPath}`);
        return `file://${localPath}`; 
      }
        const res = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        timeout: DOWNLOAD_TIMEOUT,
        retry: RETRY_ATTEMPTS,
      }).promise;
  
      if (res.statusCode === 200) {
        console.log(`Image downloaded successfully to: ${localPath}`);
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
            console.log("fileNameUrl=-=->", splitImg2)
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

  const handleNavigationGoBack = () => {
    setBackBtnDisable(true);
    navigation.goBack();
  };

  const handlePopHybDes = (hybId, hydImg,hybridName,hybridImgCache,leaflet,productVideo) => {
    console.log('PopupChecking',hydImg,leaflet)
    const hydImgs={}
    hydImgs.HydImg=hydImg
    hydImgs.HydImgCache=hybridImgCache
    setHybridImgsObj(hydImgs)
    setHybDesPop(true);
    // getFABDetails(hybId);
    setHydImg(hydImg);
    setHybridName(hybridName)
    setProductLeafValue(leaflet);
    setYouTubeLink(productVideo);
  };

  const handlePopHybDesClose = () => {
    setHybDesPop(false);
  };

  const renderUspa = ({ item, index }) => {
    return (
      <View style={RnStyles.uspaContainer}>
        <Text style={RnStyles.uspsText}>{`${index + 1}. ${item.englishLangMessage}`}</Text>
      </View>
    );
  };

  const fetchHybridsAndIssueTypesAndCrops = async () => {
    setLoaderApi(true);
    if (cachedGoldClubKnowledgeCenter.length > 0) {
      const cachedData = cachedGoldClubKnowledgeCenter[0];
      const parseData = JSON.parse(cachedData.cropsList);
      console.log("offlineChceking=-=->",JSON.stringify(parseData))
      console.log("offlineChcekingeeee=-=->",JSON.stringify(parseData.cropList))
      setMenuController(parseData.cropList || []);
      setCropIdSeleceted(parseData.cropList?.[0]?.id || null);
      setHybridList(parseData.cropList?.[0]?.hybridList || []);
      setCropImg(parseData.cropList?.[0]?.image || "");
      setCropImgCache(parseData.cropList?.[0]?.imageCropCache || "")
      setNslCrop(parseData.cropList?.[0]?.nslCrop || false);
      // setSeasonId(parseData.cropList?.[0]?.seasonId || null);
      // setSeasonName(parseData.cropList?.[0]?.seasonName || "");
      setCropName(parseData.cropList?.[0]?.name || "");
      setHybridVisible(true);
      setLoaderApi(false);
      return;
    }
    else if (isConnected) {
      try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        // const url = APIConfig.BASE_URL + APIConfig.GETACTIVECROPS;
        const url = APIConfig.BASE_URL_NVM + APIConfig.masters_getAllActiveProductsForSubeejKisan;
        const response = await axios.post(url, payload, { headers });
        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response;
          setMenuController(parseData.cropList || []);
          setCropIdSeleceted(parseData.cropList?.[0]?.id || null);
          setHybridList(parseData.cropList?.[0]?.hybridList || []);
          setCropImg(parseData.cropList?.[0]?.image || "");
          setNslCrop(parseData.cropList?.[0]?.nslCrop || false);
          // setSeasonId(parseData.cropList?.[0]?.seasonId || null);
          // setSeasonName(parseData.cropList?.[0]?.seasonName || "");
          setCropName(parseData.cropList?.[0]?.name || "");
          setHybridVisible(true);
          setLoaderApi(false);
          const updatedKnowledgeCenter= await processMarketPriceData(parseData)
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
              setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              setLoaderApi(false);
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
              console.log('Successfully created goldClubknowledgeCenterId with _id:', goldClubknowledgeCenterId);
            } catch (realmError) {
              console.error('Error creating goldClubknowledgeCenterId object in Realm:', realmError);
            }
          }
     
        } else {
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoaderApi(false);
      }
    } else {
      setLoaderApi(false);
      SimpleToast.show(translate("no_internet_conneccted"));
    }
  };

  const fetchKnowledgeCrops=async()=>{
    if(isConnected){
     try {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        const payload = { companyCode: dynamicStyles.companyCode };
        // const url = APIConfig.BASE_URL + APIConfig.GETACTIVECROPS;
        const url = APIConfig.BASE_URL_NVM + APIConfig.masters_getAllActiveProductsForSubeejKisan;
        console.log("checapopaso=-=-=->",url)
        const response = await axios.post(url, payload, { headers });
        console.log("checlingresponse=-=->",JSON.stringify(response.data.response))
        if (response.data.statusCode === HTTP_OK) {
          const parseData = response.data.response;
          setMenuController(parseData.cropList || []);
          setCropIdSeleceted(parseData.cropList?.[0]?.id || null);
          setHybridList(parseData.cropList?.[0]?.hybridList || []);
          setCropImg(parseData.cropList?.[0]?.image || "");
          setNslCrop(parseData.cropList?.[0]?.nslCrop || false);
          // setSeasonId(parseData.cropList?.[0]?.seasonId || null);
          // setSeasonName(parseData.cropList?.[0]?.seasonName || "");
          setCropName(parseData.cropList?.[0]?.name || "");
          setHybridVisible(true);
          setLoaderApi(false);
                console.log("onlonechecking=-=->",JSON.stringify(parseData))

          const updatedKnowledgeCenter= await processMarketPriceData(parseData)
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
              setLoaderApi(false);
              return;
            }
            if (attempts >= maxAttempts) {
              console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
              setLoaderApi(false);
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
              console.log('Successfully created GoldCludKnowledgeCenter with _id:', goldClubknowledgeCenterId);
            } catch (realmError) {
              console.error('Error creating GoldCludKnowledgeCenter object in Realm:', realmError);
            }
          }
     
        } else {
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoaderApi(false);
      }
    }else{
      setLoaderApi(false);
      SimpleToast.show(translate("no_internet_conneccted"));
    }
  }

  const selectedCropIdHandle = (cropId, hybridList, cropImg, nslCrop, seasonId, seasonName, cropName,cropImgCache) => {
    console.log('cacheCheck',cropId, hybridList, cropImg, nslCrop, seasonId, seasonName, cropName,cropImgCache)
    setCropIdSeleceted(cropId);
    setHybridList(hybridList);
    setCropImg(cropImg);
    setNslCrop(nslCrop);
    setSeasonId(seasonId);
    setSeasonName(seasonName);
    setCropName(cropName);
    setHybridVisible(true);
    setCropImgCache(cropImgCache)
  };

  const getFABDetails = async (hybridId) => {
    if (isConnected) {
      const url = APIConfig.BASE_URL + APIConfig.KNOWLEDEGECENTER.GETFABDETAILS;
      const headers = await GetApiHeaders();
      headers.authType = "JSONREQUEST";
      const payload = {
        cropId: cropIdSelected,
        hybridId: hybridId,
        seasonId: seasonId,
        version: 1,
      };
      const apiResponse = await sendData(url, payload, headers, false);
      if (apiResponse.statusCode === HTTP_OK) {
        const decodedResponse = apiResponse.data.response;
        setFabDetails(decodedResponse);
        const imageUrls = [];
        if (decodedResponse.productLeaflet) imageUrls.push(decodedResponse.productLeaflet);
        if (decodedResponse.testmonial) imageUrls.push(decodedResponse.testmonial);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'));
    }
  };


  const renderProductItem = ({ item }) => {
    return (
            <TouchableOpacity
            onPress={() => selectedCropIdHandle(
              item.id,
              item.hybridList,
              item.image,
              item.nslCrop,
              item.seasonId,
              item.seasonName,
              item.name,
              item.imageCropCache
            )}
            style={RnStyles.productListItemContainer}
          >
            <View style={[RnStyles.productServiceSubItemContainer, {
              borderWidth: 1,
              borderColor: cropIdSelected === item.id ? dynamicStyles.primaryColor : "#E5E9EB",
              backgroundColor: cropIdSelected === item.id ? dynamicStyles.primaryColor : "#E5E9EB"
            }]}>
              {item?.fileName&&item?.fileName?.length>0&&
              <Image resizeMode="contain"  style={RnStyles.productImgInfoContainer} source={{uri:isConnected?item.fileName[0].imageUrl:item.fileName[0].imageUrlLocal}}/>
              }
            </View>
            <Text style={[RnStyles.productInfonText,{fontFamily:fonts.Regular}]}>{item.name}</Text>
          </TouchableOpacity>
    );
  };

   const shareToWhatsApp = async () => {
    const shareOptions = {
      title: 'Share via',
      message: "Product Leaf",
      url: productLeafValue,
      social: Share.Social.WHATSAPP,
    };

    try {
      await Share.shareSingle(shareOptions);
    } catch (error) {
      console.log('Error sharing to WhatsApp', error);
    }
  };

  const openYouTube = () => {
    const url = youTubeLinkValue;
    if(isConnected){
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
    }else{
       SimpleToast.show(translate("no_internet_conneccted"))
    }
  };

  const onRefresh = useCallback(async () => {
    if (isConnected) {
      setRefreshing(true);
      await fetchKnowledgeCrops()
      setRefreshing(false);
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
      setRefreshing(false);
    }
  }, [fetchKnowledgeCrops]);

  const productInfoHandle = () => {
    if (isConnected) {
      setHybDesPop(false);
      setProductLeafLetModal(true);
    } else {
      SimpleToast.show(translate("no_internet_conneccted"))
    }

  }

  return (
    <View style={{  backgroundColor: dynamicStyles.primaryColor,flex:1 }} edges={['top']}>
    <View style={RnStyles.booksSeedsMainContainer}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />
      )}
      <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
        <View style={RnStyles.headerContentContainer}>
          <TouchableOpacity disabled={backBtnDisable} onPress={handleNavigationGoBack}>
            <Image
              source={require('../../assets/Images/BackIcon.png')}
              style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]}
            />
          </TouchableOpacity>
          <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{translate("products")}</Text>
          <View style={RnStyles.headerPlaceholder} />
        </View>
        <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
          <TouchableOpacity onPress={onRefresh} style={{ alignSelf: "flex-start",bottom:height*0.04,left:width*0.8}}>
            <Image source={require("../../assets/Images/RefreshIcon.png")} style={{ height: 30, width: 30, tintColor: dynamicStyles.secondaryColor }} />
          </TouchableOpacity>
      </View>
      {!loaderApi &&
        <View style={RnStyles.cropsContainer}>
          <Text style={[RnStyles.cropsText,{fontFamily:fonts.SemiBold}]}>{translate("crops")}</Text>
          <FlatList
           bounces={false}
            //  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff0000', '#00ff00', '#0000ff']}  />}
            ListEmptyComponent={() => (
              <Text style={RnStyles.noDataText}>{translate("No_data_available")}</Text>
            )}
            horizontal
            data={menuController}
            renderItem={renderProductItem}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
          />
        </View>
      }

      {hybridsVisible &&
        <View style={RnStyles.hybridCardContainer}>
          <View style={[RnStyles.hybridSeedsHeaderCard, { backgroundColor: dynamicStyles.primaryColor }]}>
            <Text style={[RnStyles.hybridText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.Regular }]}>{translate("hybridSeeds")}</Text>
            <Image
              source={require("../../assets/Images/triangleIcon.png")}
              style={[RnStyles.triangleIcon, { tintColor: dynamicStyles.primaryColor }]}
            />
          </View>
          <View>
            {isConnected?
            <>
            {cropImg&&
             <Image   source={{ uri: cropImg }}
              style={RnStyles.cropImg}/>
            }
            </>       
            :
            <>
            {cropImageCache&&
              <Image   source={{ uri: cropImageCache }}
              style={RnStyles.cropImg}/>
            }
            </>
            }

            <View style={[RnStyles.cottonTextContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
              <Text style={[RnStyles.cottonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>{cropName}</Text>
            </View>
          </View>

          <View>
            <Text style={[RnStyles.hybridText,{fontFamily:fonts.SemiBold}]}>{translate("Hybrid_Name")}</Text>
            <FlatList
              ListEmptyComponent={() => (
                <Text style={[RnStyles.noHybridDataText,{fontFamily:fonts.Bold}]}>{translate("No_data_available")}</Text>
              )}
              horizontal
              data={hybridList}
              renderItem={({ item }) => {
                return(
                <TouchableOpacity
                  onPress={() => handlePopHybDes(item.id, item.productImage,item.brandName,item.productImageLocal,item.productLeaflet,item.testimonial)}
                  style={RnStyles.hybridImgMainContainer}
                >
                  <View style={RnStyles.hybridImgSunContainer}>
                <Image resizeMode="contain"  style={RnStyles.hybridPckImg}   source={{ uri:isConnected?item.productImage: item.productImageLocal }}/>

                  </View>
                  <Text style={[RnStyles.cottonHybridText,{fontFamily:fonts.SemiBold}]}>{item.brandName}</Text>
                </TouchableOpacity>
              )}}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
            />
          </View>
        </View>
      }

      <Modal
        animationType="slide"
        transparent={true}
        visible={hybridDescriptionPop}
      >
        <TouchableWithoutFeedback>
          <View style={RnStyles.modalContainer}>
            <View style={RnStyles.modalContent}>
              <TouchableOpacity onPress={handlePopHybDesClose} style={[RnStyles.closeButton,{borderColor:dynamicStyles.primaryColor,backgroundColor:dynamicStyles.secondaryColor}]}>
                <Image
                  source={require("../../assets/Images/crossIcon.png")}
                  style={[RnStyles.crossIcon,{tintColor:dynamicStyles.primaryColor}]}
                />
              </TouchableOpacity>
              <View style={RnStyles.descriptionContainer}>
                <View style={RnStyles.descriptionHeader}>
                  {/* <Text style={[RnStyles.descriptionTitle, { color: dynamicStyles.textColor,fontFamily:fonts.Bold }]}>
                    {translate('Description')}
                  </Text> */}
                  <View style={RnStyles.cropNameContainer}>
                    <Text style={[RnStyles.cropNameText, { color: dynamicStyles.textColor,fontFamily:fonts.SemiBold }]}>
                      {/* {fabDetails?.cropName} */}
                      {cropName}
                    </Text>
                  </View>
                </View>
                <View style={RnStyles.divider} />
                <View>
                  <Text style={[RnStyles.contentText,{fontFamily:fonts.Regular}]}>
                    {/* {fabDetails?.hybridName} */}
                    {hybridName}
                    </Text>
                </View>
              </View>
              <View style={RnStyles.imageContainer}>
                {hydImg&&
            <Image resizeMode="contain"  style={RnStyles.hybridImage}   source={{ uri:isConnected?hybridImgsObj.HydImg:hybridImgsObj.HydImgCache}}/>
                }

                <ScrollView />
              </View>

              <View style={RnStyles.actionButtonsContainer}>
                {productLeafValue && (
                  <>
                      <TouchableOpacity
                          style={[RnStyles.actionButton, { backgroundColor: dynamicStyles.primaryColor }]}
                          onPress={productInfoHandle}
                        >
                          <Text style={[RnStyles.actionButtonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>
                            {translate("View_Product_Info")}
                          </Text>
                        </TouchableOpacity>
                  </>
                 
                )}
                {youTubeLinkValue && (
                  <>
                   <TouchableOpacity
                          style={[RnStyles.actionButton, { backgroundColor: dynamicStyles.primaryColor }]}
                          onPress={openYouTube}
                        >
                          <Text style={[RnStyles.actionButtonText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>
                            {translate("Testimonials")}
                          </Text>
                        </TouchableOpacity>
                  </>
                 
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={productLeafLetModal}
      >
        <TouchableWithoutFeedback>
          <View style={RnStyles.modalContainer}>
            <View style={RnStyles.webViewModalContent}>
              <TouchableOpacity
                onPress={() => {
                  setProductLeafLetModal(false);
                  setHybDesPop(true);
                }}
                style={[RnStyles.closeButton,{borderColor:dynamicStyles.primaryColor,marginRight:6}]}
              >
                <Image
                  source={require("../../assets/Images/crossIcon.png")}
                 style={[RnStyles.crossIcon,{tintColor:dynamicStyles.primaryColor}]}
                />
              </TouchableOpacity>
              <WebView
                source={{ uri: productLeafValue }}
                style={RnStyles.webView}
                containerStyle={RnStyles.webViewContainer}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(event) => {
                  console.log("event", event.nativeEvent.data);
                  if (event.nativeEvent.data == "Accepted") {
                    approveTermsButtonClick();
                  }
                }}
              />
                  <TouchableOpacity onPress={shareToWhatsApp} style={{borderColor:"red",alignItems:"flex-end",paddingHorizontal:25,backgroundColor:"transparent",position:"absolute",bottom:height*0.01,right:0}}>
              <Image style={{height:45,width:45,resizeMode:"contain"}} source={require("../../assets/Images/whatsappkn.png")}/>
              </TouchableOpacity>
            </View>
        
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {loaderApi && <PreLoginCustomLoader />}
      {refreshing && <PreLoginCustomLoader/>}
    </View>
    </View>
  )

}

export default KnowledgeCenterRn;

const RnStyles = StyleSheet.create({
  booksSeedsMainContainer: {
    backgroundColor: "#F2F6F9",
    flex: 1,
    width: "100%",
  },
  headerMainContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    height: 80,
  },
  headerContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backArrowImg: {
    height: 40,
    width: 40,
    resizeMode: "contain",
  },
  bookSeedsText: {
    fontSize: RFValue(16, height),
    alignSelf: "center",
    lineHeight: 30,
  },
  headerPlaceholder: {
    width: 40,
  },
  flowerImg: {
    position: "absolute",
    top: 30,
    right: 20,
    height: 50,
    width: 100,
    tintColor: "#000",
    resizeMode: "contain",
  },
  contentMainContainer: {
    padding: 20,
  },
  textFieldsMainContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    paddingBottom: 20,
    height: 400,
  },
  cropsContainer: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
  },
  cropsText: {
    color: "#3A3A3A",
    fontSize: RFValue(16, 680),
    marginBottom: 10,
  },
  productListItemContainer: {
    marginRight: 10,
    alignItems: "center",
    width: 60,
  },
  productServiceSubItemContainer: {
    height: 40,
    width: 40,
    borderRadius: 30,
    alignItems: "center",
  },
  productImgInfoContainer: {
    height: width * 0.08,
    width: width * 0.08,
    position: "absolute",
  },
  productInfonText: {
    fontSize: RFValue(10, 680),
    color: "#3A3A3A",
  },
  hybridCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignSelf: "center",
    width: "90%",
    marginTop: 20,
  },
  hybridSeedsHeaderCard: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginBottom:20
  },
  hybridSeedsHeaderCard1: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: "30%",
    borderRadius: 40,
  },
  hybridSeedsHeaderCardContainer: {
    width: "100%",
  },
  hybridText: {
    fontSize: RFValue(15, 680),
  },
  hybridText1: {
    fontSize: RFValue(10, 680),
    fontWeight: "600",
  },
  triangleIcon: {
    height: 15,
    width: 15,
    resizeMode: "contain",
    position: "absolute",
    top: height * 0.050,
  },
  triangleIcon1: {
    height: 15,
    width: 15,
    resizeMode: "contain",
    bottom: height * 0.007,
    left: width * 0.1,
  },
  cropImg: {
    width: "100%",
    height: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cottonTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cottonText: {
    fontSize: RFValue(10, 680),
  },
  hybridText: {
    color: "#000000",
    fontWeight: "400",
    fontSize: RFValue(12, 680),
    marginVertical: 10,
  },
  hybridImgMainContainer: {
    backgroundColor: "#FFF1F2",
    width: 88,
    borderRadius: 8,
    alignItems: "center",
    padding: 4,
    marginRight: 10,
  },
  hybridImgSunContainer: {
    backgroundColor: "#FFF",
    height: 70,
    width: "90%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cottonHybridText: {
    color: "#000000",
    fontSize: RFValue(9, 680),
    marginTop: 2,
  },
  hybridPckImg: {
    height: 60,
    width: "80%",
    resizeMode: "contain",
  },
  contentText: {
    color: "#18181A",
    fontSize: RFValue(12, 680),
  },
  uspsText: {
    color: "#18181A",
    fontSize: RFValue(12, 680),
    fontWeight: "400",
  },
  uspaContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  modalContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 5,
    width: "90%",
    minHeight: "30%",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  closeButton: {
    marginVertical: 10,
    alignSelf: "flex-end",
    borderWidth:1,
    height:35,width:35,
    alignItems:"center",
    justifyContent:"center",
    borderRadius:18
  },
  crossIcon: {
    resizeMode: "contain",
    height: 15,
    width: 15,
  },
  descriptionContainer: {
    borderWidth: 1,
    borderColor: "#B4B4B4",
    borderRadius: 8,
    padding: 10,
  },
  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  descriptionTitle: {
    fontSize: 14,
    padding: 5,
  },
  cropNameContainer: {
    flexDirection: "row",
  },
  cropNameText: {
    fontSize: 14,
    padding: 5,
  },
  divider: {
    backgroundColor: "#B4B4B4",
    height: 1,
    width: "100%",
    marginVertical: 10,
    alignSelf: "center",
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: "#B4B4B4",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  hybridImage: {
    height: height * 0.3,
    width:height * 0.2,
    resizeMode: "contain",
    alignSelf: "center",
  },
  actionButtonsContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    justifyContent: "center",
    width: 140,
    alignItems: "center",
    borderRadius: 10,
    // height:40,
  },
  actionButtonText: {
    fontSize: 14,
    lineHeight:25
  },
  webViewModalContent: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 5,
    width: "90%",
    height: "70%",
  },
  webViewCloseButton: {
    marginVertical: 10,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  webViewCrossIcon: {
    resizeMode: "contain",
    height: 15,
    width: 15,
    tintColor: "#fff",
  },
  webView: {
    height: '100%',
    width: '100%',
    alignSelf: "center",
  },
  webViewContainer: {
    width: '100%',
    height: '100%',
  },
  noDataText: {
    color: "#000",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  noHybridDataText: {
    textAlign: "center",
    fontSize: 15,
    alignSelf: "center",
    marginTop: 20,
  },
});
