import { requireNativeComponent, NativeEventEmitter, NativeModules, Dimensions, Platform, Pressable, Alert,TouchableOpacity ,StatusBar,Text, View} from 'react-native';
import React, { useEffect, useState,useCallback } from 'react';
// import { Box, Text, useColorModeValue } from 'native-base';
import { useSelector } from 'react-redux';
import { Styles } from '../styles/Styles';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';

const MapplsMapView = requireNativeComponent('MapplsMapView');
const { width, height } = Dimensions.get('window');


export default function MapScreen({route}) {
    console.log("CKECKINM=-=-=-=>",route.params.screeName)
    let regParams={}
    const currentTheme = useSelector(state => state.theme.theme);
    const styles = Styles(currentTheme);
    // const statusBarColor = useColorModeValue(currentTheme.themeRed, currentTheme.darkBackground);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [address, setAddress] = useState('');
    const navigation = useNavigation();
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    
    useFocusEffect(
        useCallback(() => {
            const eventEmitter = new NativeEventEmitter(NativeModules.MapplsMapViewManager);

            const subscription = eventEmitter.addListener('onLocationChange', (event) => {
                console.log('Location updated:', event);
                const { latitude, longitude, address } = event;
                regParams.latitude=latitude
                regParams.longitude=longitude
                regParams.address=address
                // You can update state or handle latitude, longitude, and address here
                setLatitude(latitude);
                setLongitude(longitude);
                setAddress(address);
            });
    
            return () => {
                subscription.remove();
            };

        }, [])
    );

    // return <MapplsMapView style={{ flex: 1 }} />;

    const handlePickLocation = () => {
        if (latitude && longitude) {
            navigation.navigate(route.params.screeName,{latitude,longitude,address});
        } else {
            Alert.alert(translate("Please_select_a_location_on_the_map"));
        }
    };

    return (
        <View style={[styles.full_height, styles.full_width]}>
            {Platform.OS === 'android' && (<StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />)}
            <View style={[styles.flexFull]}>
                <MapplsMapView style={{ flex: 1 }} />
            </View>

            <View style={[styles.height_45, styles.widthPct_90, styles.alignSelfCenter,{backgroundColor:dynamicStyles.primaryColor,borderRadius:8,overflow:"hidden"}]} >
                <TouchableOpacity style={[ styles.heightPct_100, styles.widthPct_100, styles.justifyContentCenter, styles.alignSelfCenter,{backgroundColor:dynamicStyles.primaryColor}]} onPress={handlePickLocation}>
                    <Text style={[styles.fontSize_14,  styles.textAlignCenter,{color:dynamicStyles.secondaryColor}]}>{translate('pickLocation')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}