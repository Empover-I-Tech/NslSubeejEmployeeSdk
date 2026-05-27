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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleToast from 'react-native-simple-toast';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { Colors } from '../assets/Utils/Color';
import { translate } from '../Localization/Localisation';
import MediaModal from '../Modals/MediaModal';

const KnowledgeCenterDocsList = ({ route }) => {

  const navigation = useNavigation();
  const networkStatus = useSelector(state => state.network.isConnected);
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const [listOfBooksFilter, setListOfBooksFilter] = useState([]);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [mediaLink, setMediaLink] = useState('');
  const [headerTitle, setHeaderTitle] = useState(translate('KnowledgeCenter'));

  const isYouTubeLink = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
  const isImageLink = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
  const isPdfLink = (url) => /\.pdf$/i.test(url);
  const isMp4Link = (url) => /\.mp4$/i.test(url);

  useEffect(() => {
    console.log("subItemList:", route?.params?.selectedItem?.subItemList);
  }, []);


  useEffect(() => {
    if (route?.params) {
      const filteredBooks = route?.params?.selectedItem?.subItemList;
      setListOfBooksFilter(filteredBooks || []);
      setHeaderTitle(route?.params?.selectedItem?.tittle || translate('KnowledgeCenter'));
    }
  }, [route]);

  const handlePressBroucher = (item) => {

    if (item?.isComingSoon) {
      SimpleToast.show(translate('Comingsoon'))
      return
    }

    console.log('item?.handBookPath', item)

    if (item?.urlPath == null || item?.urlPath == undefined || item?.urlPath.trim() == '') {
      SimpleToast.show(translate('invalid_file_format'))
      return;
    }

    if (isYouTubeLink(item?.urlPath)) {
      if (networkStatus) {
        Linking.openURL(item?.urlPath).catch(err => console.error("Couldn't load page", err))
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    }
    else if (isPdfLink(item?.urlPath.trim())) {
      navigation.navigate('KnowledgeCenterPDFView', { selectedItem: item, isComingFrom: true })
      return;
    }
    else if (item?.urlPath.trim()) {
      setMediaLink(item?.urlPath);
      setMediaVisible(true);
    }
    else {
      SimpleToast.show(translate('invalid_file_format'))
    }
  }

  const renderGridItem = (item, index) => {
    console.log('Rendering item:', item);
    return (
      <TouchableOpacity
        onPress={() => handlePressBroucher(item)}
        key={index.toString()}
        activeOpacity={0.8}
        style={{ margin: 3 }}
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
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle="dark-content" />
      )}

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: dynamicStyles.primaryColor,
        paddingBottom: 10,
        paddingHorizontal: 15,

      }}>
        <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => navigation.goBack()}>
          <Image
            style={{ tintColor: dynamicStyles.secondaryColor, height: 15, width: 20, top: 5 }}
            source={require('../../assets/Images/previous.png')}
          />
          <Text style={{
            color: dynamicStyles.secondaryColor, marginLeft: 10, fontSize: 18, fontWeight: 'bold',
            flexShrink: 1,
            flexWrap: 'wrap',
            lineHeight: Platform.OS == 'android' ? 30 : 25,
            minWidth: 200
          }}
            adjustsFontSizeToFit>
            {headerTitle}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ width: '100%', height: "100%", backgroundColor: '#f9f9f9' }}>

        {/* ✅ Single Scrollable List */}
        <FlatList
          data={listOfBooksFilter}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({ item, index }) => renderGridItem(item, index)}
          contentContainerStyle={{
            paddingBottom: 100,
            alignSelf: 'center',
            marginTop: 10,
          }} // space above bottom button
          ListEmptyComponent={
            <View style={{ height: responsiveHeight(70), alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: dynamicStyles.textColor, fontSize: 13, fontWeight: '700' }}>
                {translate('no_data_available')}
              </Text>
            </View>
          }
        />

        <MediaModal
          visible={mediaVisible}
          link={mediaLink}
          onClose={() => setMediaVisible(false)}
          loaderColor={dynamicStyles.primaryColor}
        />
      </View>
    </SafeAreaView>
  );
};

export default KnowledgeCenterDocsList;
