import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Platform,
    TouchableOpacity,
    Image,
    Text,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomButton from "./CustomButton";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import MapplsGL from 'mappls-map-react-native';
import CustomLoader from "./CustomLoader";
import { translate } from "../Localization/Localisation";
import { MAP_MY_INDIA_URL } from "../api/APIConfig";
import Geolocation from "react-native-geolocation-service";
import { useFontStyles } from "../hooks/useFontStyles";

MapplsGL.setMapSDKKey("hgxmpb6gldoe2jb2r3upyje5rej6v72p");
MapplsGL.setRestAPIKey("5zf2txekry89tciw19sgmjpo7w133ioj");
MapplsGL.setAtlasClientId("qwj3TMxdzY7SIXZq8s3A4xDzY3LBjO3xAepnlJFBOjA_DQ7xzJWYtgfi1mKTFeTCLePMnWjzcGfP3PeOP6QozA==");
MapplsGL.setAtlasClientSecret("NdJUAD9O1c0LyinGBY0q0A17p-U96zMmvmehrrw4OVI91FWsWwBD2VCd3HVpTBawIi_g0BxxNireuLAJZpwie4283oO0mRYf");
const styles = BuildStyleOverwrite(Styles);
const Location = ({ route }) => {
    const fonts = useFontStyles()
    console.log("checkingRoutes=-=-=->", route?.params?.coordinates)
    const getCompanyStyles = useSelector(state => state.companyStyles.companyStyles);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [locallatitudes, setLocalLatitudes] = useState(route?.params?.coordinates?.latitude ? route?.params?.coordinates?.latitude : 0);
    const [locallongitudes, setLocalLongitudes] = useState(route?.params?.coordinates?.longitude ? route?.params?.coordinates?.longitude : 0);
    let [addLoader, setAddLoader] = useState(false)
    const [address, setAddress] = useState(route?.params?.coordinates?.address ? route?.params?.coordinates?.address : "");
    const [screen, setScreen] = useState(route?.params?.coordinates?.screenName ? route?.params?.coordinates?.screenName : "");
    const [isMap, setIsMap] = useState(!route?.params?.coordinates?.address);
    const [isComingFrom, setIsComingFrom] = useState(route?.params?.isComingFrom)
    const [pinDance, setPinDance] = useState(false);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef(null);
    const { width, height } = Dimensions.get('window');
    const companyStyle = getCompanyStyles;
    const navigation = useNavigation();
    const [hasCentered, setHasCentered] = useState(false);
    const [primaryColor, setPrimaryColor] = useState(route?.params?.primaryColor ?? companyStyle?.value?.primaryColor);
    const [dynamicStyles, setDynamicStyles] = useState(getCompanyStyles);
    const [newLat, setNewLat] = useState(null)
    const [newLong, setNewLong] = useState(null)
    const [zoomingPick, setZoomingPick] = useState(route?.params?.coordinates?.zoom ? route?.params?.coordinates?.zoom : 0)

    const centerMap = (longi, lati, zoom) => {
        cameraRef.current?.setCamera({
            centerCoordinate: [longi, lati],
            zoomLevel: zoom,
            animationDuration: 1000,
        });
    };

    useEffect(() => {
        setLoading(true)
        onMapLoad();
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            console.log('screen focused', route?.params);
            setHasCentered(false); // reset on screen focus

            if (route?.params?.coordinates?.address) {
                setIsMap(false);

            } else {
                setIsMap(true);

            }
            fetchCurrentLocation()
            // if (route?.params?.address && route?.params?.coordinates?.latitude && route?.params?.coordinates?.longitude) {
            //     setIsMap(false);
            //     setAddress(route.params.address);
            //     setLoading(false);
            // } else {
            //     setIsMap(true);
            //     setLoading(false);
            // }

            return () => {
                console.log('Screen is no longer focused!');
            };
            // }, [isConnected, route?.params])
        }, [])

    );


    const goSignup = () => {
        navigation.goBack();
    };

    const onMapLoad = () => {
        setIsMapReady(true);
        if (hasCentered) return;
        centerMap(route?.params?.coordinates?.longitude, route?.params?.coordinates?.latitude, route?.params?.coordinates?.zoom);
        // centerMap(route.params.latitude, route.params.longitude);
        setLoading(false);
        setHasCentered(true);
        // console.log(latitude, longitude, "from on map load");

        // if (hasCentered) return;

        // if (route.params?.latitude && route.params?.longitude) {
        //     console.log("calledOne=-=-=1")
        //     centerMap( "78.386162","17.4492756");
        //     // centerMap(route.params.latitude, route.params.longitude);
        //     setLoading(false);
        // } else if (latitude && longitude) {
        //     console.log("calledOne=-=-=2")
        //     centerMap(longitude,latitude);
        //     setLoading(false);
        // }
    };





    const fetchCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setNewLat(latitude);
                setNewLong(longitude);
            },
            error => {
                console.error('Error fetching location:', error);
                if (error.code === 3 || error.code === 2) {
                    Geolocation.getCurrentPosition(
                        position => {
                            const { latitude, longitude } = position.coords;
                            setNewLat(latitude);
                            setNewLong(longitude);
                        },
                        fallbackError => {
                            console.error('Fallback location error:', fallbackError);
                        },
                        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
                    );
                } else {
                }
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 5000 }
        );
    }

    const onMapError = (error) => {
        console.log('Map error:', error);
    };

    const onMapRegionChange = (event) => {
        if (event?.properties?.isUserInteraction === false) {
            return
        };
        const [longitude, latitude] = event?.geometry?.coordinates || [];
        setLocalLatitudes(latitude);
        setLocalLongitudes(longitude);
    };

    const onRegionWillChange = () => {
        setIsUserInteracting(true);
    };

    const onRegionDidChange = (region) => {
        setZoomingPick(region.properties.zoomLevel)
        setIsUserInteracting(false);
        console.log(locallatitudes, locallongitudes, "marker updated on map");
    };

    const handleBackToCurrentLocation = () => {
        setPinDance(false);
        setLocalLatitudes(newLat);
        setLocalLongitudes(newLong);
        cameraRef.current?.setCamera({
            centerCoordinate: [newLong, newLat],
            zoomLevel: 40,
            animationDuration: 1000,
        });
    };

    const reverseGeocode = async (latitude, longitude) => {
        const url = MAP_MY_INDIA_URL;
        setAddLoader(true)
        try {
            let urll = `${url}?lat=${latitude}&lng=${longitude}`
            const res = await fetch(urll);
            const response = await res.json();
            setAddLoader(false)
            return response;
        } catch (err) {
            console.error('Reverse geocode error:', err);
            return null;
        }
    };

    const handlePickLocation = async () => {
        if (!isMap) {
            setIsMap(true);
            return;
        }

        const data = await reverseGeocode(locallatitudes, locallongitudes);
        if (data?.results?.length > 0) {
            const place = data.results[0];

            if (place?.formatted_address) {
                console.log('✅ Valid place selected:', place?.formatted_address);
                setAddress(place?.formatted_address);
                if (locallatitudes && locallongitudes && place?.formatted_address) {
                    navigation.navigate(screen, {
                        backScreen: {
                            latitude: locallatitudes,
                            longitude: locallongitudes,
                            address: place.formatted_address,
                            zoom: zoomingPick,
                            enablePestForecast: isComingFrom
                        }
                    });
                }
            } else {
                Alert.alert(translate('Invalid_Selection'), translate('valid_location'));
            }
        } else {
            Alert.alert("Error", "Failed to get address from location.");
        }
    };
    return (
        <>
            <View
                style={{
                    backgroundColor: dynamicStyles?.primaryColor,
                    paddingStart: 20,
                    paddingEnd: 20,
                    paddingBottom: 20,
                    borderBottomStartRadius: 10,
                    borderBottomEndRadius: 10,
                    paddingTop: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <TouchableOpacity style={styles['flex_direction_row']} onPress={goSignup}>
                    <Image
                        style={{
                            tintColor: dynamicStyles?.secondaryColor,
                            height: 15,
                            width: 20,
                            top: 5,
                        }}
                        source={require('../../assets/Images/BackIcon.png')}
                    />

                </TouchableOpacity>
                <Text
                    style={[
                        styles['margin_left_10'],
                        {
                            color: dynamicStyles?.secondaryColor,
                            fontFamily: fonts.Bold,
                            fontSize: 16
                        },]}
                >
                    {translate('Map')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <MapplsGL.MapView
                        style={{ flex: 1 }}
                        onDidFinishLoadingMap={onMapLoad}
                        onMapError={onMapError}
                        onRegionIsChanging={onMapRegionChange}
                        onRegionWillChange={onRegionWillChange}
                        onRegionDidChange={onRegionDidChange}
                        zoomEnabled={isMap}
                        scrollEnabled={isMap}
                        rotateEnabled={isMap}
                    >
                        <MapplsGL.Camera
                            ref={cameraRef}
                            zoomLevel={route?.params?.coordinates?.zoom ? route?.params?.coordinates?.zoom : 20}
                            animationDuration={1000}
                        // centerCoordinate={[route?.params?.coordinates?.longitude ? route?.params?.coordinates?.longitude : 0,route?.params?.coordinates?.latitude?route?.params?.coordinates?.latitude:0]}
                        />
                        {!route?.params?.coordinates && (
                            <MapplsGL.UserLocation
                                visible={true}
                                showsUserHeadingIndicator={true}
                            />
                        )}

                        {/* <MapplsGL.UserLocation visible={true} showsUserHeadingIndicator={true} /> */}
                    </MapplsGL.MapView>
                )}
            </View>

            {isMapReady && !loading && newLat !== null && newLong !== null && (
                <TouchableOpacity
                    disabled={!isMap}
                    onPress={() => {
                        handleBackToCurrentLocation();
                        setPinDance(true);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 100,
                        right: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: dynamicStyles?.primaryColor,
                        height: 60,
                        width: 60,
                        borderRadius: 60,
                    }}
                >
                    <Image
                        tintColor={dynamicStyles.secondaryColor}
                        source={require('../../assets/Images/gps.png')}
                        style={{ height: 30, width: 30, resizeMode: "contain" }}
                    />
                </TouchableOpacity>
            )}

            {!isMapReady &&
                <CustomLoader
                    loading={!isMapReady}
                    uriSent={true}
                    message={translate('please_wait_location_data')}
                    loaderImage={route.params.loaderPath}
                />
            }
            {!loading && (
                <View style={[
                    sheetStyles.centeredView,
                    {
                        left: (width - 40) / 2,
                        top: (height - (Platform.OS == 'ios' ? 0 : 20)) / 2,
                    }
                ]}>
                    <Image
                        source={require('../../assets/Images/locationImgIcon.png')}
                        style={{ height: 40, width: 40, resizeMode: "contain" }}
                    />
                </View>
            )}

            {isMapReady && !loading &&
                <View style={[styles['width_100%'], { position: "absolute", bottom: 20, zIndex: 100 }]}>
                    <CustomButton
                        title={isMap ? translate('save') : translate('edit')}
                        buttonBg={dynamicStyles?.primaryColor}
                        btnWidth={'90%'}
                        enableLoader={addLoader}
                        titleTextColor={dynamicStyles?.secondaryColor}
                        onPress={handlePickLocation}
                    />
                </View>}
        </>
    );
};

const sheetStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Location;