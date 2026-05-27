import React, { useEffect, useState } from 'react';
import {
  Platform,
  Text,
  StatusBar,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  StyleSheet
} from 'react-native';
import SimpleToast from 'react-native-simple-toast';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { translate } from '../Localization/Localisation';
import { Colors } from '../assets/Utils/Color';
import { getNetworkStatus } from '../api/NetworkUtils';
import { GetApiHeaders } from '../utils/helpers';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import axios from 'axios';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';

const AdvancedKnowledgeCenter = () => {
  const navigation = useNavigation();
  const networkStatus = useSelector(state => state.network.isConnected);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const [cropsList, setCropsList] = useState([]);
  const [listOfBooksFilter, setListOfBooksFilter] = useState([]);
  const [broucherUrlPath, setBroucherUrlPath] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = (msg = '') => {
    setLoadingMessage(msg);
    setLoadingCount(prev => prev + 1);
  };

  const stopLoading = () => {
    setLoadingCount(prev => Math.max(prev - 1, 0));
  };

  const loading = loadingCount > 0;

  useEffect(() => {
    if (cropsList && cropsList.length > 0 && selectedId === null) {
      console.log("cropsList", cropsList)
      const firstCrop = cropsList[0];
      setSelectedId(firstCrop.id);
      console.log("firstCrop", firstCrop)
      onCropSelect(firstCrop); // trigger selection callback if needed
    }
  }, [cropsList]);

  const onCropSelect = async (selectedItem) => {
    console.log("sdsds", selectedItem)
    // update selected crop for UI
    setSelectedId(selectedItem.id);
    await fetchDataBasedOnCropAPI(selectedItem);
  };

  const fetchDataBasedOnCropAPI = async (selectedCrop = null) => {
    console.log(" API START");
    var networkStatus = await getNetworkStatus()
    if (!networkStatus) return;
    startLoading(translate('please_wait_getting_data'));

    try {

      var documentURL = APIConfig.BASE_URL_NVM + APIConfig.getAdvancedKnowledgeCenterDataByCompany_DOC;
      var headers = await GetApiHeaders();

      var dataList = {
        "userId": headers.userId,
        "cropId": selectedCrop?.id || null,
        "cropName": selectedCrop?.cropName || null
      }
      var APIResponse = await axios.post(documentURL, dataList, { headers });
      console.log("jsonresponse", JSON.stringify(APIResponse));
      console.log(" API RESPONSE");
      if (APIResponse != undefined && APIResponse != null) {
        var apiResponse = APIResponse.data
        if (apiResponse.statusCode == HTTP_OK) {
          var jsonresponse = apiResponse.response
          console.log("jsonresponse", JSON.stringify(jsonresponse))
          setListOfBooksFilter(jsonresponse?.knowledgeCenterJsonList || []);
          setBroucherUrlPath(jsonresponse?.brouchurPath || '');
        }
        else if (apiResponse.statusCode == 601) {
          SimpleToast.show(apiResponse?.message)
        }
        else {
          SimpleToast.show(apiResponse?.message)
        }

      }
    } catch (error) {
      console.error(error);
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    if (networkStatus) fetchKnowledgeCenterData();
  }, [networkStatus])

  const fetchKnowledgeCenterData = async () => {
    const network = await getNetworkStatus();
    if (!network) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }
    try {
      startLoading(translate('please_wait_getting_data'));

      const headers = await GetApiHeaders();
      headers.companyCode = dynamicStyles?.companyCode;
      const KnowledgeCenterURL = APIConfig.BASE_URL_NVM + APIConfig.getAdvancedKnowledgeCenterDataByCompany;
      var APIResponse = await axios.get(KnowledgeCenterURL, { headers });
      console.log("APIResponse", JSON.stringify(APIResponse.data.response))
      if (APIResponse?.data?.statusCode === HTTP_OK) {
        let resp = APIResponse.data.response
        setCropsList(resp.knowledgeCntrCropsList || []);
      } else {
        Alert.alert(APIResponse?.data?.message || translate('something_went_wrong'));
      }
    } catch (error) {
      SimpleToast.show(error.message);
    } finally {
      stopLoading();
    }
  };


  const renderCropsListItem = ({ item }) => {
    const isSelected = selectedId === item?.id;

    return (
      <View
        style={{
          alignItems: 'center',
          width: `${100 / 5}%`, // 5 items per row
          padding: 4     // vertical spacing
        }}
      >
        <TouchableOpacity
          style={[
            styleSheetStyles.itemContainer,
            isSelected && { backgroundColor: dynamicStyles.primaryColor }
          ]}
          onPress={() => onCropSelect(item)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item?.vectorImage }}
            style={styleSheetStyles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 12,
            textAlign: "center",
            marginTop: 4, // spacing below circle
            fontWeight: isSelected ? 'bold' : 'normal',
            color: isSelected ? dynamicStyles.primaryColor : dynamicStyles.textColor,
            width: '100%'
          }}

        >
          {item?.cropName.replace(/-/g, " ")}
        </Text>
      </View>
    );
  };

  const handlePressBroucher = (item) => {

    if (item?.isComingSoon) {
      SimpleToast.show(translate('Comingsoon'))
      return
    }
    console.log('item?.handBookPath', item)
    navigation.navigate('KnowledgeCenterDocsList', { selectedItem: item, headerTitle: item.tittle })
  }

  const gridItem = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => handlePressBroucher(item)}
        key={index.toString()}
        activeOpacity={0.8}
      >
        <View
          style={[
            {
              width: Dimensions.get('window').width / 2.5,
              borderRadius: 5,
              borderWidth: 0.5,
              borderColor: Colors.white,
              elevation: 0.5,
              bottom: 10,
              minHeight: responsiveHeight(25),
              backgroundColor: Colors.white,
              margin: 10,
            },
          ]}
        >
          {/* ✅ Coming Soon image stays 100% visible */}
          {item?.isComingSoon && <Image
            source={require('../../assets/Images/comingSoon.png')}
            style={{
              width: '50%',
              height: 20,
              alignSelf: 'flex-end',
              zIndex: 2,
              position: 'absolute',
            }}
            resizeMode="contain"
          />}

          {/* ✅ Card Content with reduced opacity */}
          <View style={{ opacity: item?.isComingSoon ? 0.5 : 1.0 }}>
            <View
              style={[{ alignContent: 'center', alignSelf: 'center', justifyContent: 'center', marginTop: 10, width: '98%' }
              ]}
            >
              <Image
                source={
                  item?.thumbNailPath?.trim()
                    ? { uri: item.thumbNailPath }
                    : require('../../assets/Images/NoCropImage.png')
                }
                defaultSource={require('../../assets/Images/NoCropImage.png')}
                onError={(e) => console.log('Image failed:', item?.thumbNailPath)}
                style={[{ width: 120, height: 120, alignContent: 'center', alignSelf: 'center', justifyContent: 'center' }
                ]}
                resizeMode="contain"
              />
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: Colors.lightGray,
                width: '95%',
                alignSelf: 'center',
                marginTop: 10,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                marginTop: 5,
                justifyContent: 'center',
              }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  {
                    color: dynamicStyles.textColor, textAlign: 'left', fontSize: 10, fontWeight: '700', width: '80%',
                    lineHeight: Platform.OS == 'android' ? 15 : 25, textAlignVertical: 'center'
                  },
                ]}
                numberOfLines={2}
              >
                {item.tittle}
              </Text>

              <View
                style={[{ width: 20, height: 20, borderRadius: 12.5, alignItems: 'center', justifyContent: 'center', backgroundColor: dynamicStyles.primaryColor },
                ]}
              >
                <Image
                  resizeMode='contain'
                  style={[{ width: 10, height: 10, tintColor: dynamicStyles.secondaryColor }
                  ]}
                  source={require('../../assets/Images/rightArrow.png')}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onpressBroucher = async () => {
    console.log("sddsdsd", broucherUrlPath)
    if (broucherUrlPath != undefined && broucherUrlPath != "") {
      navigation.navigate('KnowledgeCenterPDFView', { selectedItem: broucherUrlPath, isComingFrom: false })
    }
    else {
      SimpleToast.show(translate('NoDataFound'))
    }
  }

  return (
    <View style={{ width: '100%', height: "100%" }}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle="dark-content" />
      )}

      <View style={{ width: '100%', height: "100%", backgroundColor: '#f9f9f9' }}>

        {/* Header */}
        <View style={{
          backgroundColor: dynamicStyles.primaryColor,
          width: "100%",
          paddingStart: 20,
          paddingEnd: 20,
          paddingBottom: 20,
          borderBottomStartRadius: 10,
          borderBottomEndRadius: 10,
          paddingTop: 20

        }}>
          <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => navigation.goBack()}>
            <Image
              style={{ tintColor: dynamicStyles.secondaryColor, height: 15, width: 20, top: 5 }}
              source={require('../../assets/Images/previous.png')}
            />
            <Text style={{
              color: dynamicStyles.secondaryColor, marginLeft: 10, fontSize: 18, fontWeight: 'bold', lineHeight : 22,
              flexShrink: 1,
              flexWrap: 'wrap',
              minWidth: 200
            }}
            >
              {translate('knowledgeCenter')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Single Scrollable List */}
        <FlatList
          data={listOfBooksFilter}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({ item, index }) => gridItem(item, index)}
          contentContainerStyle={{
            paddingBottom: 100,
            alignSelf: "center", width: "90%",
          }} // space above bottom button
          ListEmptyComponent={
            <View style={{ height: responsiveHeight(70), alignItems: "center", justifyContent: "center" }}>
              {listOfBooksFilter.length == 0 && !loading &&
                <Text style={{ color: dynamicStyles.textColor, fontSize: 13, fontWeight: '700' }}>
                  {translate('no_data_available')}
                </Text>}
            </View>
          }

          // ✅ Crops grid is now the list header
          ListHeaderComponent={
            cropsList.length > 0 && (
              <View style={{ width: '98%', marginTop: 15, alignSelf: "center" }}>
                {/* Header Row */}
                <View style={styleSheetStyles.headerRow}>
                  <Text style={styleSheetStyles.title}>{translate('Crops')}</Text>

                  {cropsList.length > 5 && (
                    <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                      <Text style={styleSheetStyles.viewAll}>
                        {showAll ? translate('View_Less') : translate('View_All')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Crops Grid (Always scrollable naturally now) */}
                <FlatList
                  data={showAll ? cropsList : cropsList.slice(0, 5)}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderCropsListItem}
                  numColumns={5}
                  style={{ marginBottom: 20, alignSelf: cropsList.length == 1 ? "" : "center", width: "100%" }}
                  scrollEnabled={false}
                  contentContainerStyle={{

                  }}
                />
              </View>
            )
          }
        />

        {/* ✅ Always stays at bottom correctly */}
        {broucherUrlPath !== "" && dynamicStyles.companyCode == "1100" &&
          <TouchableOpacity
            onPress={() => { onpressBroucher() }}
            style={{
              height: 50,
              width: '95%',
              backgroundColor: dynamicStyles.primaryColor,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: 15,
              alignSelf: "center"
            }}
          >
            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: 14, fontWeight: 'bold' }}>
              {translate("view_nsl_broucher")}
            </Text>
          </TouchableOpacity>}
      </View>
      {loading && <PreLoginCustomLoader />}
    </View>
  );
};

export default AdvancedKnowledgeCenter;

const styleSheetStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black
  },
  viewAll: {
    fontSize: 14,
    color: Colors.black,
    padding: 5
  },
  itemContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,   // half of width/height
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    padding: 5
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 15, // make the image circular
    marginBottom: 5,
  }
});
