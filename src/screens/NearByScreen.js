import { Platform, Pressable, StyleSheet, Text, View,Image, Dimensions, TouchableOpacity,StatusBar,ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Styles } from '../styles/Styles';
import { useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';
import { getFromAsyncStorage, getUserLocation } from '../utils/keychainUtils';
import { MOBILENUMBER } from '../utils';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFontStyles } from '../hooks/useFontStyles';
const {height,width}=Dimensions.get("window")

const NearByScreen = ({navigation}) => {
  const fonts=useFontStyles()
    const currentTheme = useSelector(state => state.theme.theme);
    const styles = Styles(currentTheme);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedFilters, setSelectedFilters] = useState([]);
    // const { isOpen, onOpen, onClose } = useDisclose();
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [mobileNumber, setMobileNumber] = useState('');
    const [distance,setDistance]=useState(Platform.OS === 'android' ? '' :'10')
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [backBtnDisable,setBackBtnDisable]=useState(false)
    const nearByLink=useSelector(state=>state.nearByReducer.nearBy)
    const url = `${nearByLink}/?latitude=${latitude}&longitude=${longitude}&distance=${distance}&filterString&mobileNumber=${mobileNumber}`;

    useEffect(() => {
      const fetchMobileNumber = async () => {
        try {
          const mobile = await getFromAsyncStorage(MOBILENUMBER);
          setMobileNumber(mobile || '');
        } catch (error) {
          console.error("Error fetching mobile number:", error);
        }
      };
    
      const fetchUserLocation = async () => {
        try {
          const latlong = await getUserLocation();
          if (latlong) {
            setLatitude(latlong?.latitude);
            setLongitude(latlong?.longitude);
          }
          console.log("User Location (latitude, longitude):", latlong);
        } catch (error) {
          console.error("Error fetching user location:", error);
        }
      };
    
      fetchMobileNumber();
      fetchUserLocation();
    }, []);
    
  const handleFilterChange = (newValues) => {
    if (newValues.length <= 3) {
      setSelectedFilters(newValues);
    } else {
      alert(translate("You_can_select_up_filters_only"));
    }
  };

const onMessage = (event) => {
  try {
      const message = event.nativeEvent.data;
      console.log("Received event:", message);
      const parsedData = JSON.parse(message);
      if (parsedData.action === 'loadGridView') {
        console.log('Navigating to NearByRetailersScreen');
        navigation.navigate('NearByRetailersScreen', {
          mobileNumber: parsedData.mobileNumber,
          latitude: parsedData.latitude,
          longitude: parsedData.longitude,
          distance: parsedData.distance,
          filterString: parsedData.filterString,
        });
        console.log("rawwwww",parsedData)
      }
  } catch (error) {
      console.error("Error parsing WebView message:", error);
  }
};

  const backBtnHandle = () => {
    setBackBtnDisable(true)
    navigation.goBack()
  }

  return (
    <View style={{  backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
    <View style={[styles.full_height, styles.full_width]}>
        {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}
      <View style={[{
        paddingTop: 20,
        paddingHorizontal: 20,
        height: 80, backgroundColor: dynamicStyles.primaryColor
      }]}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <TouchableOpacity disabled={backBtnDisable} onPress={backBtnHandle}>
            <Image source={require('../../assets/Images/BackIcon.png')} style={[{
              height: 40,
              width: 40,
              resizeMode: "contain", tintColor: dynamicStyles.secondaryColor
            }]} />
          </TouchableOpacity>
          <Text style={[{
            fontSize: RFValue(16, height),
            fontFamily:fonts.SemiBold,
            alignSelf: "center",
            lineHeight: 30, color: dynamicStyles.secondaryColor
          }]}>{translate("Nearby")}</Text>
          <TouchableOpacity style={{width:40}} 
          // onPress={onOpen}
          >
          {/* <Image style={{tintColor:dynamicStyles.secondaryColor,margin:10}}source={require('../../assets/Images/FilterIcon.png')} /> */}

          </TouchableOpacity>
        </View>
        {/* <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} /> */}
      </View>
        
       <WebView 
       onMessage={onMessage}
        source={{ uri: url }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webView}
      />
      
     


    {/* {isLoading && (
          <View style={{position:"absolute",bottom:height*0.5,right:width*0.45}}>
            <ActivityIndicator size="large" color={dynamicStyles.primaryColor} />
          </View>
      )} */}

       {/* <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Box w="100%" p={4}>
            <HStack justifyContent={"space-around"}>
            <Text style={{ lineHeight:30,fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{translate('Select_Filters')}</Text>
            <Pressable onPress={onClose}>
            <CloseIcon size="5" mt="0.5" color="grey" />
              </Pressable>
            </HStack>
            <Checkbox.Group
              value={selectedFilters}
              onChange={handleFilterChange}
            >
              <Checkbox  value="filter1" my={2}colorScheme="red">
                {translate("All")}
              </Checkbox>
              <Checkbox value="filter2" my={2}colorScheme="red">
              {translate("Distributors")}
              </Checkbox>
              <Checkbox value="filter3" my={2}colorScheme="red">
              {translate("Retailers")}
              </Checkbox>
            </Checkbox.Group>
            <Button mt={4} colorScheme="red" onPress={onClose}>{translate("Apply_Filters")}</Button>
          </Box>
        </Actionsheet.Content>
      </Actionsheet> */}

    </View>
    </View>
  )
}

export default NearByScreen

const styles = StyleSheet.create({})