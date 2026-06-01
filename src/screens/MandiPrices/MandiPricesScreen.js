import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BuildStyleOverwrite } from '../../assets/style/BuildStyle';
import { Styles } from '../../assets/style/styles';
import { useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CustomListViewModal from '../../Modals/CustomListViewModal';
import { GetApiHeaders, isNullOrEmpty } from '../../utils/helpers';
import { filterObjects, sortObjectsAlphabetically } from '../../assets/Utils/Utils';
import { LineChart } from 'react-native-chart-kit';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import SimpleToast from 'react-native-simple-toast';
import {
    ActivityIndicator, Platform, StyleSheet, Dimensions, TouchableOpacity, View, Text, FlatList,
    Image, StatusBar, ScrollView, TextInput, Modal, Alert
} from 'react-native';
import moment from 'moment';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Colors } from '../../assets/Utils/Color';
import CustomInputDropDown from '../../components/CustomInputDropDown';
import { DISTRICT_ID, DISTRICT_NAME, STATE_ID, STATE_NAME } from '../../utils';
import { getFromAsyncStorage } from '../../utils/keychainUtils';
import APIConfig, { HTTP_OK } from '../../api/APIConfig';
import { GetRequestNVM, PostRequestNVM } from '../../api/NetworkUtils';
import { RFValue } from 'react-native-responsive-fontsize';
import { translate } from '../../Localization/Localisation';
import { CustomCommonModal } from '../../components/CustomCommonModal';
import axios from 'axios';
import { useFontStyles } from '../../hooks/useFontStyles';
const { width, height } = Dimensions.get('window');

const MandiPricesScreen = () => {
    const fonts = useFontStyles()
    const viewShotRef = useRef();
    const FILTERS = [translate("this_week"), translate("this_month"), translate("this_year")];
    const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
    let navigation = useNavigation()
    var styles = BuildStyleOverwrite(Styles);
    const [loading, setLoading] = useState(false)
    let [graphData, setGraphData] = useState(null)
    const [popup, setPopUp] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null)
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [districtListOriginal, setDistrictListOriginal] = useState([]);
    const [mandiSelected, setMandiSelected] = useState(true);
    const [pageNo, setPage] = useState(1);
    const [selectedState, setSelectedState] = useState({ id: "", name: 'select' });
    const [hasMoreData, setHasMoreData] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [mandiPricesList, setMandiPricesList] = useState([]);
    const [selectedCrops, setSelectedCrops] = useState({});
    const [loadingMessage, setLoadingMessage] = useState('')
    const [progress, setProgress] = useState(10)
    const [placeholderText, setPlaceholderText] = useState(translate("searchMandi"));
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [showNoDataAvailable, setShowNoDataAvaialble] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [dropDownType, setDropDownType] = useState("");
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [state, setState] = useState('')
    const [district, setDistrict] = useState('')

    const [stateID, setStateID] = useState('')
    const [districtID, setDistrictID] = useState('')
    const [alertModal, setAlertModal] = useState(false)
    const [alertTextContent, setAlertTextContent] = useState("")
    const isConnected = useSelector(state => state.network.isConnected);
    const [noMarketText, setNoMarketText] = useState("")

    const takeScreenshot = async () => {

        const uri = await viewShotRef.current.capture();
        const shareOptions = {
            title: 'Share via',
            message: ``,
            url: uri,
            // social: Share.Social.WHATSAPP,
        };

        try {
            await Share.open(shareOptions);
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error('Share Error:', error);
            }
        }

    };

    const alertCloseHandle = () => {
        setAlertModal(false)
    }

    const isFocused = useIsFocused();


    useEffect(() => {
        console.log("dynamicStyles1111", dynamicStyles)
        const initialize = async () => {
            let stateId = await getFromAsyncStorage(STATE_ID)
            let stateName = await getFromAsyncStorage(STATE_NAME)
            let districtId = await getFromAsyncStorage(DISTRICT_ID)
            let districtName = await getFromAsyncStorage(DISTRICT_NAME)
            console.log('Failed to capture screenshot:', stateId + "---" + stateName);
            console.log('Failed to capture screenshot:', districtId + "---" + districtName);
            await fetchStateAndDistrictMasters();
            setLoading(true)
            // await fetchMandiPrices(true); // Load initial mandi prices after masters
            // await fetchGraphData()
        };

        initialize();
    }, [isFocused]);

    useEffect(() => {
        if (!selectedFilter) return;

        setLoading(true)
        setGraphData(null);   // ✅ IMPORTANT
        fetchGraphData()
    }, [selectedFilter])

    useEffect(() => {
        if (popup) {
            setSelectedFilter(FILTERS[0]); // always "This Week"
        }
    }, [popup]);

    const onSelectedState = async (item) => {
        setShowDropDowns(false);
        setState(item.name)
        setStateID(item.id);
        setDistrict('')
        setDistrictID('');
        // setAlertModal(true)

        SimpleToast.show(translate("Please_Select_District"))
        // setAlertTextContent(translate("Please_Select_District"))
        var filterDistList = await filterObjects(districtListOriginal, "stateId", item.id)
        setDistrictsList(sortObjectsAlphabetically(filterDistList, 'name'))

        setFilteredData([])
        setShowNoDataAvaialble(false)
        setLoading(false)
    }

    const onSelectedDistrict = (item) => {
        setShowDropDowns(false);
        setDistrict(item.name);
        setDistrictID(item.id);
        setFilteredData([])
        setShowNoDataAvaialble(false)
    }

    const fetchStateAndDistrictMasters = async () => {
        let stateId = await getFromAsyncStorage(STATE_ID)
        let stateName = await getFromAsyncStorage(STATE_NAME)
        let districtId = await getFromAsyncStorage(DISTRICT_ID)
        let districtName = await getFromAsyncStorage(DISTRICT_NAME)
        setLoading(false)
        console.log("kaopsoap=-=-=->", stateID)
        if (isConnected)
            try {
                // var stateUrl = APIConfig.BASE_URL_NVM + APIConfig.MANDRIPRICES.GETSTATEDISTRICTDETAILS;
                var stateUrl = APIConfig.BASE_URL + APIConfig.getStateDistrictsDropDown;

                var getHeaders = await GetApiHeaders()
                var response = await GetRequestNVM(stateUrl, getHeaders);
                console.log("res=-0=-=-?>", response)
                if (response && response.statusCode == HTTP_OK) {
                    let orderedStates = sortObjectsAlphabetically(response?.response?.stateList, 'name')
                    setStatesList(orderedStates || []);
                    setDistrictListOriginal(sortObjectsAlphabetically(response?.response?.districtsList, 'name') || []);
                    var filterDistList = await filterObjects(response?.response?.districtsList, "stateId", stateId)
                    setDistrictsList(sortObjectsAlphabetically(filterDistList, 'name'))
                    setTimeout(() => {
                        setStateID(stateId)
                        setState(stateName)
                        setDistrict(districtName)
                        setDistrictID(districtId)
                        setLoading(false)
                    }, 1000)


                }
            } catch (error) {
                setAlertModal(false)
                setLoading(false)

                console.error('Error fetching state and district masters:', error);
            } else {
            setLoading(false)
            setAlertModal(false)

            // SimpleToast.show(translate("no_internet_conneccted"))
        }
    };

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        if (dropDownData != null && dropDownData.length > 0) {
            setShowDropDowns(true);
            setdropDownData(dropDownData);
            setDropDownType(type);
            setSelectedDropDownItem(selectedItem);
        }
        else {
            // Alert.alert(translate("No_data_available"))
            setAlertModal(true)
            setAlertTextContent(translate("No_data_available"))
        }

    }

    const isFetching = useRef(false);
    const fetchMandiPrices = async (resetData = false, page = 1) => {
        console.log("district !==", district !== '', district)
        if (isConnected) {
            try {
                const payload = {
                    page,
                    itemsPerPage,
                    filterValue: searchQuery.length > 3 ? searchQuery : '',
                    state: state !== '' ? state : '',
                    district: district !== '' ? district : ''
                };
                const headers = await GetApiHeaders();
                const url = APIConfig.BASE_URL_NVM + APIConfig.MANDRIPRICES.GETMANDIPRICES;
                const APIResponse = await PostRequestNVM(url, headers, payload);
                console.log("PAYLOAD=-=-=>", payload)
                console.log("headers=-=-=>", headers)
                console.log("APIResponse=-=-=>", JSON.stringify(APIResponse))

                if (APIResponse != undefined && APIResponse != null) {
                    // setTimeout(() => {
                    //     setLoadingMessage()
                    //     setLoading(false)
                    // }, 1000);

                    if (APIResponse.statusCode == HTTP_OK) {
                        var mandiPrices = APIResponse.response
                        console.log(JSON.stringify(mandiPrices), "mandipricessssssssssssssssssssssssssssssss")
                        setLoadingMessage()

                        if (resetData) {
                            setMandiPricesList(mandiPrices.mandiPricesList || []);
                            setFilteredData(mandiPrices.mandiPricesList || []);
                            setHasMoreData(mandiPrices?.mandiPricesList?.length == 10);
                            setShowNoDataAvaialble(false)
                        } else if (mandiPrices.mandiPricesList.length > 0) {
                            setMandiPricesList((prev) => [...prev, ...mandiPrices.mandiPricesList]);
                            setFilteredData((prev) => [...prev, ...mandiPrices.mandiPricesList]);
                            setHasMoreData(mandiPrices?.mandiPricesList?.length == 10);
                            setShowNoDataAvaialble(false)
                        }
                        else {
                            setHasMoreData(false);
                        }
                        if (resetData && mandiPrices?.mandiPricesList?.length == 0) {
                            setNoMarketText(translate("no_markets_available"))
                            setShowNoDataAvaialble(true)
                            setHasMoreData(false);
                        }

                    }
                    else {
                        setShowNoDataAvaialble(false)
                        setLoadingMessage(APIResponse?.message ?? "")
                        setLoading(false)
                        setAlertModal(true)
                        setAlertTextContent(APIResponse?.message)
                    }

                } else {
                    setAlertModal(false)

                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            } catch (error) {
                setAlertModal(false)

                setProgress(100)
                setLoading(false)

                console.error('Error fetching mandi prices:', error);
            } finally {
                setProgress(100)
                setAlertModal(false)
                setLoading(false)

                isFetching.current = false;
            }
        } else {
            setLoading(false)
            setAlertModal(false)

            // SimpleToast.show(translate("no_internet_conneccted"))
        }

    };
    let fetchGraphData = async () => {
        if (isConnected) {
            try {
                const payload = {
                    "state": "",
                    "district": "",
                    "crop": "",
                    "type": selectedFilter === translate("this_week") ? "W" : selectedFilter === translate("this_month") ? 'M' : 'Y'
                };
                const headers = await GetApiHeaders();
                // const url = APIConfig.SUBEEJ_KISAN_MANDI_PRICES_DUMMY_URL;
                const url = APIConfig.BASE_URL_NVM + APIConfig.MANDI_PRICE_GET_MANDI_PRICE_AReport_V1;
                const APIResponse = await PostRequestNVM(url, headers, payload);
                if (APIResponse != undefined && APIResponse != null) {
                    if (APIResponse.statusCode == HTTP_OK) {
                        // setGraphData(null)
                        var mandiPrices = APIResponse.response
                        console.log("graph dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", JSON.stringify(mandiPrices), "graph dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                        setLoadingMessage()
                        setGraphData(mandiPrices)
                    }
                    else {
                        setLoadingMessage(APIResponse?.message ?? "")
                        setLoading(false)
                        // Alert.alert(APIResponse?.message)
                        setAlertModal(true)
                        setAlertTextContent(APIResponse?.message)
                    }


                } else {
                    setAlertModal(false)

                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            } catch (error) {
                setAlertModal(false)
                setLoading(false)

                setProgress(100)
                console.error('Error fetching mandi prices:', error);
            } finally {
                setLoading(false)

                setProgress(100)
                isFetching.current = false;
            }
        } else {
            setAlertModal(false)

            setLoading(false)
            SimpleToast.show(translate("no_internet_conneccted"))
        }

    };
    console.log("selectedCrop?.maxPrice)/100=-=->", parseInt(selectedCrop?.maxPrice?.replace("₹", "")) / 100)

    useEffect(() => {
        if (isNullOrEmpty(district)) {
            setPage(1);
            fetchMandiPrices(true, 1);
            setLoading(true)
            setSearchQuery('')
        }
    }, [district]);


    const filteredDistricts = useMemo(() => {
        return districtsList.filter(district => district.stateId === selectedState.id);
    }, [districtsList, selectedState]);

    const handleLoadMore = () => {

        if (hasMoreData && !isFetching.current) {
            //  setPage((prev) => prev + 1);
            const tempPage = pageNo + 1;
            setLoading(true);
            setPage(tempPage)
            fetchMandiPrices(false, tempPage);
        }
    };

    // useEffect(() => {
    //     if (page > 1) {
    //         setLoading(true)
    //         fetchMandiPrices(false,1);
    //     }
    // }, [page]);

    useEffect(() => {
        if (searchQuery.length >= 3) {
            const filtered = mandiPricesList.filter((item) =>
                item.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.crops.some((crop) => crop.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(mandiPricesList);
        }
    }, [searchQuery, mandiPricesList]);


    const renderMenuController = ({ item }) => {
        return (
            <View style={{
                padding: 10,
                width: '65%',
                marginLeft: 5,
                marginRight: 5,
                marginTop: 10
            }}>
                <View style={{
                    padding: 10,
                    backgroundColor: '#f0f0f0',
                    height: 40,
                    width: 40,
                    borderRadius: 25
                }} />

                <View style={{
                    height: '100%',
                    position: 'absolute',
                    top: 12,
                    right: 19,
                    bottom: 20
                }}>
                    <Image
                        source={{ uri: item.vectorImage }}
                        style={{
                            height: 30,
                            width: 30
                        }}
                        accessibilityLabel={item?.name}
                    />
                </View>

                <Text
                    style={{
                        marginTop: 5,
                        fontWeight: "400",
                        fontSize: 12,
                        color: 'black',
                        textAlign: 'center'
                    }}
                    numberOfLines={1}
                >
                    {item?.name}
                </Text>
            </View>
        )
    }
    console.log("k=-=-=-=->", selectedCrop?.image)

    const renderCropChildData = ({ item, index }) => {
        return (
            <TouchableOpacity
                key={`${item?.name}${index}`}
                style={[
                    { width: '100%', marginTop: 5, marginBottom: 5 }]}
                onPress={() => {
                    navigation.navigate('CropDetailsScreen', {
                        minPrice: item.minPrice,
                        maxPrice: item.maxPrice,
                        name: item.name,
                        marketName: mandiPricesList[index]?.location,
                        cropImage: item?.image
                    });
                }}
            >
                <View style={[{ borderRadius: 10, backgroundColor: "white", padding: 5 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ padding: 5, width: '33%' }}>
                            <Text style={{ fontFamily: fonts.Regular, color: 'black', fontSize: 12, textAlign: 'center' }}>{translate("min_price")}</Text>
                            <Text style={{ fontFamily: fonts.Bold, fontSize: 16, color: 'black', textAlign: 'center' }} numberOfLines={1}>
                                {item?.minPrice}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Assuming 'styles.divider' refers to a divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={{ fontFamily: fonts.Regular, color: 'black', fontSize: 12, textAlign: 'center' }}>{translate("max_price")}</Text>
                            <Text style={{ fontFamily: fonts.Bold, fontSize: 16, color: 'black', textAlign: 'center' }} numberOfLines={1}>
                                {item?.maxPrice}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Assuming 'styles.divider' refers to a divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={{ fontFamily: fonts.Regular, color: 'black', fontSize: 12, textAlign: 'center' }}>{translate("market_prices")}</Text>
                            <Text style={{ fontFamily: fonts.Bold, fontSize: 16, color: 'green', textAlign: 'center' }} numberOfLines={1}>
                                {item?.maxPrice}
                            </Text>
                        </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Assuming 'styles.divider' refers to a divider */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={{ fontFamily: fonts.Regular, color: 'black', fontSize: 12, textAlign: 'center' }}>{translate("commodity")}</Text>
                            <Text style={{ fontFamily: fonts.SemiBold, fontSize: 16, color: 'black', textAlign: 'center' }} numberOfLines={1}>
                                {item?.name}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={{ fontFamily: fonts.Regular, color: 'black', fontSize: 12, textAlign: 'center' }}>{translate("variety")}</Text>
                            <Text style={{ fontFamily: fonts.SemiBold, fontSize: 16, color: 'black', textAlign: 'center' }} numberOfLines={1}>
                                {item?.name}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={{ fontFamily: fonts.Regular, color: 'black', fontSize: 12, textAlign: 'center' }}>{translate("Arrival_Date")}</Text>
                            <Text style={{ fontFamily: fonts.SemiBold, fontSize: 16, color: 'black', textAlign: 'center' }} numberOfLines={1}>
                                {moment().format('DD-MM-YYYY')}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderCropsData = ({ item, index }) => {
        const cropKey = `${item.name}-${item.maxPrice}`;
        return (
            <Center style={{ width: '100%' }} key={`${item?.name}_${index}`}>
                <View style={{
                    backgroundColor: 'white',
                    marginTop: 15,
                    marginBottom: 10,
                    padding: 5,
                    width: '100%',
                    borderRadius: 15
                }}>
                    <View style={{
                        marginLeft: 10,
                        marginRight: 10,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: 'black', fontSize: 16, fontFamily: fonts.SemiBold }}>{item?.location}</Text>
                        {/* <TouchableOpacity
                        onPress={() => bookmarkDetails(item, index)}
                        >
                            <View>
                                {bookmarkedMarkets[cropKey] ?
                                    <Image source={require('../../src/assets/images/saved.png')} style={{ height: 30, width: 30, resizeMode: "contain" }} />
                                    :
                                    <Image source={require('../../src/assets/images/unsaved.png')} style={{ height: 30, width: 30, resizeMode: "contain" }} />
                                }
                            </View>
                        </TouchableOpacity> */}
                    </View>

                    <FlatList
                        data={item?.crops}
                        renderItem={({ item, index }) => renderCropChildData({ item, index })}
                        keyExtractor={(item, index) => `${item?.name}${index}`} />
                </View>
            </Center>
        );
    };

    const viewDetailsBUtton = async (items) => {
        const headers = await GetApiHeaders();
        headers.authType = "JSONREQUEST";
        setSelectedCrop(items)
        setPopUp(true)
        const url = APIConfig.BASE_URL + APIConfig.mandiPrices_saveCropViewedHistory
        const payload = { cropName: items.commodity, farmerId: headers.userId };
        const response = await axios.post(url, payload, { headers });
        console.log("respTes-=->", response.data)

    }

    const renderCropItem = ({ item, marketName, action, location, commodity }) => {
        console.log("action----", action)
        // item,
        //  marketName: item?.marketName, action: actionNAME,location:item?.location
        const cropKey = `${item.name}-${marketName}-${item.maxPrice}-${commodity}-${item.lastUpdated}`;
        item.marketName = marketName;
        item.location = location;
        // item.commodity = commodity;
        const priceUnit = parseInt(item?.maxPrice?.replace("₹", "")) / 100
        return (
            <TouchableOpacity activeOpacity={0.8}
                onPress={() => viewDetailsBUtton(item)}
                key={cropKey}
            >
                <View
                    style={[
                        {
                            width: width * 0.30,
                            minHeight: Platform.OS == 'android' ? height * 0.17 : height * 0.12,
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            alignItems: 'center',
                            marginRight: 10,
                            backgroundColor: 'rgba(0,0,0,0.82)',
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,0.82)',
                            borderRadius: 8,
                            position: 'relative'
                        }]}
                >
                    <>

                        <Text
                            style={{ fontSize: 10, fontFamily: fonts.SemiBold, color: dynamicStyles.textColor, marginTop: 3 }}
                            numberOfLines={1}
                            ellipsizeMode='tail'
                        >
                            {item?.name}
                        </Text>
                        {/* {selectedCrops === cropKey && ( */}
                        <View style={styleSheetStyles.overlay}>
                            <Text style={[styleSheetStyles.overlayTitle, { fontFamily: fonts.Bold }]} numberOfLines={1} ellipsizeMode='tail'> {item?.name}</Text>
                            <Image source={require('../../assets/images/horizontalLine.png')} style={{ width: "100%", height: 1 }} />
                            <Text style={[styleSheetStyles.detail, { marginTop: 2.5, fontFamily: fonts.Regular }]}>{translate("quantity")}</Text>
                            <Text style={[styleSheetStyles.detail, { fontFamily: fonts.Regular }]}>1 {translate("Quintal")}</Text>
                            <Text style={[styleSheetStyles.detail, { fontFamily: fonts.Regular }]}>{translate("rate")} (1{translate("kg")} = ₹{priceUnit})</Text>
                            <Text style={[styleSheetStyles.price, { fontFamily: fonts.Regular }]}>{item.maxPrice ? `${item?.maxPrice}Rs` : 'N/A'}</Text>
                            <TouchableOpacity disabled={true} style={styleSheetStyles.button}
                            >
                                <Text allowFontScaling={false} style={[styleSheetStyles.buttonText, { fontFamily: fonts.Bold }]}>{translate("View_Details")}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                </View>
            </TouchableOpacity>
        )
    };

    const renderMandiPrices = ({ item, index }) => {
        const selectedChild = item[index] ?? 0;
        console.log("item---", item)
        // const selectedCrop = item.crops[selectedChild];
        let actionNAME = item.action
        // console.log(item?.action,":::")
        let marketName = item?.marketName;
        let location = item?.location;
        let commodity = item?.commodity;
        return (
            <View key={`${item}_${index}`} style={{
                padding: 15,
                marginBottom: 10,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: 'white',
                borderRadius: 15
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Text
                        style={{ fontSize: 14, fontFamily: fonts.SemiBold, color: dynamicStyles.textColor }}
                        numberOfLines={1}
                    >
                        {item.marketName.length > 20
                            ? `${item.marketName.substring(0, 20)}...`
                            : item.marketName}
                    </Text>

                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        ...(isExpanded ? { marginRight: 10 } : {})
                    }}>
                    </View>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 2
                }}>
                    <Text style={{
                        fontSize: 13,
                        fontFamily: fonts.Regular,
                        color: 'black',
                        marginTop: 2,
                    }}>{translate("available_crops")}</Text>
                </View>

                {/* Crops List */}
                <FlatList
                    data={item.crops}
                    nestedScrollEnable={true}
                    initialNumToRender={3}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    renderItem={({ item }) => renderCropItem({
                        item, marketName, action: actionNAME, location, commodity
                    })}
                    keyExtractor={(crop, index) => `${crop.id}_${index}`}
                    horizontal
                    style={{ width: '98%' }}
                    showsHorizontalScrollIndicator={false}
                    mt={2}
                />
            </View>
        );
    };

    const perKg = selectedCrop?.maxPrice ? selectedCrop?.maxPrice.includes("₹") ? parseInt(selectedCrop?.maxPrice.replace("₹", "0")) / 100 : "0" : "0"
    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            {Platform.OS === 'android' && (
                <StatusBar backgroundColor={popup ? "#000000d6" : dynamicStyles.primaryColor} barStyle={popup ? 'light-content' : 'dark-content'} />
            )}

            <View style={{
                paddingTop: Platform.OS == "ios" ? 40 : 20,
                paddingHorizontal: 20,
                height: Platform.OS == "ios" ? 100 : 80,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                // height: 60,
                backgroundColor: dynamicStyles.primaryColor
            }}>
                <View style={{
                    // flexDirection: "row", 
                    alignItems: "center",
                    // justifyContent: "space-between" 
                }}>

                    {/* <TouchableOpacity
                            style={{ height: 50, width: 50, resizeMode: "contain", marginRight: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <Image
                                source={require('../../../src/assets/images/weatherScreen/newBackButton.png')}
                                style={{
                                    height: 20,
                                    width: 34,
                                    tintColor: dynamicStyles.secondaryColor,
                                    marginTop: 15,
                                    marginLeft: 10
                                }}
                            />
                        </TouchableOpacity> */}
                    <Text style={{
                        fontSize: RFValue(16, height),
                        fontFamily: fonts.SemiBold,
                        alignSelf: "center",
                        lineHeight: 30,
                        color: dynamicStyles.secondaryColor,
                    }}>
                        {translate("Mandi_Prices")}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

            </View>


            <View style={{ flex: 1 }}>
                {/* <View>
                    {!mandiSelected && (
                        <FlatList
                            horizontal
                            data={showProducts}
                            renderItem={renderMenuController}
                            keyExtractor={(item) => item?.id.toString()}
                            showsHorizontalScrollIndicator={false}
                        />
                    )}
                </View> */}

                <View style={{}}>
                    <View style={{
                        elevation: 1,
                        width: "100%", backgroundColor: "white", marginBottom: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20
                    }}>
                        {/* <View style={{
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "90%",
                            flexDirection: "row",
                            marginTop: 15,
                            marginBottom: 5
                        }}>
                            <View style={{
                                alignItems: "center",
                                alignSelf: "center",
                                width: "50%",
                                marginLeft: 20
                            }}>
                                <Text style={{
                                    fontWeight: "500",
                                    fontSize: 14,
                                    // textAlign: "left",
                                    alignSelf: "flex-start",
                                    // marginBottom: 10,
                                    color: 'rgba(93,93,93,1)'
                                }}>
                                    Select State
                                </Text>
                            </View>

                            <View style={{
                                alignItems: "center",
                                alignSelf: "center",
                                width: "50%",
                                alignSelf: "flex-start",
                                marginLeft: -22

                            }}>
                                <Text style={{
                                    fontWeight: "500",
                                    fontSize: 14,
                                    textAlign: "center",
                                    // marginBottom: 10,
                                    color: 'rgba(93,93,93,1)'
                                }}>
                                    Select District
                                </Text>
                            </View>
                        </View> */}
                        <View style={{
                            alignItems: "center",
                            // justifyContent: "space-between",
                            width: "100%",
                            flexDirection: "row",
                            marginBottom: 20
                        }}>
                            <View style={[styles['margin_top_5'], styles['centerItems'], { width: '45%', marginLeft: 15 }]}>
                                <CustomInputDropDown
                                    width={[styles['width_150%']]}
                                    defaultValue={state != undefined && state != translate("select") ? state : translate("select")}
                                    labelName={translate("select_state")}
                                    IsRequired={false}
                                    placeholder={translate("State")}
                                    onEndEditing={async event => {
                                        // calculateTotalOrderValue()
                                    }}
                                    onFocus={() => {
                                        changeDropDownData(statesList, "State", state)
                                    }}
                                />
                            </View>

                            <View style={[styles['margin_top_5'], styles['centerItems'], { width: '45%', marginLeft: 15 }]}>
                                <CustomInputDropDown
                                    width={[styles['width_100%']]}
                                    defaultValue={district != undefined && district != translate("select") ? district : translate("select")}
                                    labelName={translate("select_dict")}
                                    IsRequired={false}
                                    placeholder={translate("District")}
                                    onEndEditing={async event => {
                                        // calculateTotalOrderValue()
                                    }}
                                    onFocus={() => {
                                        changeDropDownData(districtsList, "District", district)
                                    }}
                                />
                            </View>
                            {/* States DropDown */}
                            {/* <TouchableOpacity 

                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40%",
                                marginHorizontal: 20,
                                marginLeft: 20,
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "rgba(242,242,242,1)",
                                padding: 5,
                                paddingHorizontal: 10,
                                flexDirection: "row"
                            }}>
                                <Text style={{
                                    fontWeight: "500",
                                    fontSize: 14,
                                    textAlign: "center",
                                    color: 'rgba(93,93,93,0.5)'
                                }}>
                                    Select
                                </Text>
                                <Image source={require('../../src/assets/images/dropdownArrow.png')} style={{ height: 12, width: 12, resizeMode: "contain", marginLeft: "auto" }} />

                            </TouchableOpacity>

                            <TouchableOpacity style={{
                                alignItems: "center",
                                justifyContent: "center",
                                // alignSelf: "center",
                                width: "40%",
                                marginHorizontal: 20,
                                marginLeft: 20,
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "rgba(242,242,242,1)",
                                padding: 5,
                                paddingHorizontal: 10,
                                flexDirection: "row"
                            }}>
                                <Text style={{
                                    fontWeight: "500",
                                    fontSize: 14,
                                    textAlign: "center",
                                    color: 'rgba(93,93,93,0.5)'
                                }}>
                                    Select
                                </Text>
                                <Image source={require('../../src/assets/images/dropdownArrow.png')} style={{ height: 12, width: 12, resizeMode: "contain", marginLeft: "auto" }} />

                            </TouchableOpacity> */}
                        </View>
                        {
                            showDropDowns &&
                            <CustomListViewModal
                                dropDownType={dropDownType}
                                listItems={dropDownData}
                                selectedItem={selectedDropDownItem}
                                onSelectedState={(item) => onSelectedState(item)}
                                onSelectedDistrict={(item) => onSelectedDistrict(item)}

                                closeModal={() => setShowDropDowns(false)}
                            />
                        }
                    </View>

                    {/* Search Functionality */}
                    <View style={{ alignItems: "center", justifyContent: "center" }}>

                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",   // ✅ vertical center for all devices
                            width: "90%",
                            borderRadius: 8,
                            backgroundColor: "white",
                            paddingHorizontal: 10,
                            elevation: 3
                        }}>

                            <TextInput
                                placeholder={placeholderText}
                                value={searchQuery}
                                onChangeText={text => setSearchQuery(text)}
                                placeholderTextColor={'rgba(93,93,93,0.5)'}
                                style={{
                                    flex: 1,                  // ✅ takes full space properly
                                    height: 40,
                                    color: dynamicStyles.textColor,
                                    fontFamily: fonts.Regular,

                                    // 🔥 FIX FOR PERFECT CENTER ALIGNMENT
                                    textAlignVertical: 'center',
                                    paddingVertical: 0,
                                    includeFontPadding: false,
                                }}
                            />

                            <Image
                                style={{
                                    height: 20,
                                    width: 20,
                                    resizeMode: "contain",
                                    marginLeft: 5
                                }}
                                source={require('../../../src/assets/images/searchh.png')}
                            />

                        </View>
                    </View>

                    {/* No Data Found */}
                    {
                        searchQuery.length > 0 && filteredData.length === 0
                            ? (
                                <View style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 20
                                }}>
                                    <Text style={{
                                        fontFamily: fonts.SemiBold,
                                        fontSize: 16,
                                        color: "red"
                                    }}>
                                        {translate("No_data_available")}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {
                                        mandiSelected
                                        && (
                                            <View style={{ width: '100%', marginTop: 15 }}>

                                                {showNoDataAvailable && filteredData.length == 0 &&
                                                    <View style={{
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginTop: 20,
                                                        height: responsiveHeight(60)
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.SemiBold,
                                                            fontSize: 16,
                                                            color: "red"
                                                        }}>
                                                            {noMarketText}
                                                        </Text>
                                                    </View>

                                                }



                                                {
                                                    loading && !showNoDataAvailable && filteredData.length == 0
                                                        ? (
                                                            <View style={{
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                marginTop: 20,
                                                                height: responsiveHeight(60)
                                                            }}>
                                                                <ActivityIndicator size="large" color="gray" />

                                                            </View>
                                                        ) : (
                                                            <FlatList
                                                                style={{ marginBottom: 200 }}
                                                                data={filteredData}
                                                                initialNumToRender={3}
                                                                nestedScrollEnable={true}
                                                                removeClippedSubviews={true}
                                                                maxToRenderPerBatch={10}
                                                                windowSize={5}
                                                                renderItem={renderMandiPrices}
                                                                keyExtractor={(item, index) => `${item?.id || index}`}
                                                                contentContainerStyle={{ paddingBottom: 150 }}
                                                                onEndReached={handleLoadMore}
                                                                onEndReachedThreshold={0.5} // Adjust threshold if needed
                                                                showsVerticalScrollIndicator={false}
                                                                ListFooterComponent={<View style={{ height: responsiveHeight(8) }} />}
                                                            />
                                                        )}
                                            </View>
                                        )}

                                    {
                                        popup &&
                                        <Modal
                                            animationType="fade"
                                            transparent={true}
                                            visible={popup}
                                            onRequestClose={() => {
                                                // alert('Modal has been closed.');
                                                setPopUp(!popup);
                                            }}>

                                            <View style={styleSheetStyles.centeredView}>
                                                <ViewShot
                                                    ref={viewShotRef} style={styles.viewShot}
                                                    captureMode="mount"
                                                    onCapture={() => {
                                                        console.log("do something with ");
                                                    }}
                                                    options={{ format: 'jpg', quality: 0.9 }}>
                                                    <View style={styleSheetStyles.modalView}>
                                                        <View style={{
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            width: "100%"
                                                        }}>
                                                            <Text ellipsizeMode='tail' numberOfLines={2} style={[styleSheetStyles.modalText, { fontFamily: fonts.SemiBold }]}>{selectedCrop?.name}</Text>
                                                            <TouchableOpacity
                                                                onPress={() => setPopUp(!popup)}>
                                                                <Image source={require('../../../src/assets/images/crossMark.png')} style={{ tintColor: "#000", height: 20, width: 20, resizeMode: "contain" }} />
                                                            </TouchableOpacity>
                                                        </View>
                                                        {selectedCrop?.image &&
                                                            <View style={{
                                                                borderWidth: 4, borderColor: "rgba(46, 41, 41, 0.28)", borderRadius: 15, backgroundColor: "rgba(237, 50, 55, 0.28)", marginTop: 25
                                                            }}>
                                                                <Image source={{ uri: selectedCrop?.image }}
                                                                    accessibilityLabel={selectedCrop?.name}
                                                                    style={{ height: 150, width: 300, resizeMode: "cover", borderRadius: 10, }} />
                                                            </View>
                                                        }

                                                        <View style={{
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            width: "100%",
                                                            marginTop: 10, padding: 10
                                                        }}>
                                                            <Text style={[styleSheetStyles.modalText, { fontFamily: fonts.SemiBold }]}>{selectedCrop?.marketName}</Text>
                                                            <View style={
                                                                {
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                }
                                                            }>
                                                                <TouchableOpacity onPress={() => takeScreenshot()}>
                                                                    <Image source={require('../../../src/assets/images/share.png')} style={{ height: 30, width: 30, resizeMode: "contain", marginRight: 10, tintColor: dynamicStyles.primaryColor }} />
                                                                </TouchableOpacity>
                                                            </View>

                                                        </View>
                                                        <Text style={
                                                            {
                                                                fontFamily: fonts.Regular,
                                                                fontSize: 18,
                                                                textAlign: "left",
                                                                color: "rgba(137, 137, 137, 1)",
                                                                width: "100%",
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                paddingHorizontal: 15
                                                            }}>{selectedCrop?.location}</Text>
                                                        <ScrollView style={{ width: '100%', backgroundColor: Colors.white }}>
                                                            <View style={[styleSheetStyles.center]}>
                                                                <View style={[styleSheetStyles.marginTop_10, styleSheetStyles.widthPct_90, styleSheetStyles.bgF2F6F9, styleSheetStyles.shadow]}>
                                                                    <View style={[styleSheetStyles.padding_5]}>
                                                                        <View style={styleSheetStyles.row}>
                                                                            <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                <Text style={[styleSheetStyles.fontSize_12, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]}>{(translate("quantity"))}</Text>
                                                                                <Text style={[styleSheetStyles.fontSize_16, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.Bold }]} numberOfLines={1}>{'1'}{' '}
                                                                                    <Text style={[styleSheetStyles.fontSize_14, styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)', fontFamily: fonts.Bold }]} numberOfLines={1}>{translate("Quintal")}
                                                                                    </Text>
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styleSheetStyles.divider} />
                                                                            <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                <Text style={[styleSheetStyles.fontSize_12, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{`${translate("rate")}(1kg-₹${perKg})`}</Text>
                                                                                {/* translate(`Rate(1kg-₹58)`) */}
                                                                                <Text style={[styleSheetStyles.fontSize_16, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]} numberOfLines={1}>{selectedCrop?.maxPrice}{' '}
                                                                                    <Text style={[styleSheetStyles.fontSize_14, styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)', fontFamily: fonts.SemiBold }]} numberOfLines={1}>{translate("Quintal")}
                                                                                    </Text></Text>
                                                                            </View>
                                                                            <View style={styleSheetStyles.divider} />
                                                                            <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                <Text style={[styleSheetStyles.fontSize_12, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{(translate("market_price"))}</Text>
                                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                    <Image source={require('../../../src/assets/images/dropdownArrow.png')} style={{ height: 10, width: 10, resizeMode: "contain", marginRight: 2.5, tintColor: "rgba(9, 176, 43, 1)", marginTop: -2, transform: [{ rotate: '180deg' }] }} />
                                                                                    <Text style={[styleSheetStyles.fontSize_16, styleSheetStyles.textColorGreen, styleSheetStyles.textAlignCenter, { fontFamily: fonts.SemiBold }]} numberOfLines={1}>{selectedCrop?.maxPrice}{' '}
                                                                                        <Text style={[styleSheetStyles.fontSize_14, styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)', fontFamily: fonts.SemiBold }]} numberOfLines={1}>{translate("Quintal")}
                                                                                        </Text></Text>
                                                                                </View>
                                                                            </View>
                                                                        </View>

                                                                        <View style={styleSheetStyles.dividerMy2} />
                                                                        <View style={styleSheetStyles.row}>
                                                                            <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                <Text style={[styleSheetStyles.fontSize_12, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{(translate("commodity"))}</Text>
                                                                                <Text style={[styleSheetStyles.fontSize_16, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]} numberOfLines={1}>{selectedCrop?.commodity}</Text>
                                                                            </View>
                                                                            <View style={styleSheetStyles.divider} />
                                                                            <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                <Text style={[styleSheetStyles.fontSize_12, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{(translate("variety"))}</Text>
                                                                                <Text style={[styleSheetStyles.fontSize_16, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]} numberOfLines={1}>{selectedCrop?.variety}</Text>
                                                                            </View>
                                                                            <View style={styleSheetStyles.divider} />
                                                                            <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                <Text style={[styleSheetStyles.fontSize_12, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}>{(translate("Arrival_Date"))}</Text>
                                                                                <Text style={[styleSheetStyles.fontSize_16, styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor, fontFamily: fonts.SemiBold }]} numberOfLines={1}>{moment().format('DD-MM-YYYY')}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <View style={[styleSheetStyles.dividerMy2, { marginVertical: 0, marginTop: responsiveHeight(2), marginBottom: responsiveHeight(1) }]} />
                                                            <FlatList
                                                                data={FILTERS}
                                                                horizontal
                                                                style={{ marginVertical: 5, width: "100%", paddingHorizontal: 20 }}
                                                                keyExtractor={(item) => item}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => setSelectedFilter(item)} style={styleSheetStyles.tab}>
                                                                        <Text style={[styleSheetStyles.text, selectedFilter === item && styleSheetStyles.selectedText, { fontFamily: fonts.SemiBold }]}>
                                                                            {item}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                )}
                                                                showsHorizontalScrollIndicator={false}
                                                            />
                                                            {loading ? (
                                                                <ActivityIndicator size="large" color="#000" />
                                                            )
                                                                : graphData !== null &&
                                                                <View style={styleSheetStyles.container}>

                                                                    <LineChart
                                                                        data={{
                                                                            labels: graphData?.labels?.reverse(),
                                                                            datasets: [
                                                                                {
                                                                                    data: graphData?.maxPrices?.reverse(), // Maximum Price
                                                                                    color: () => 'rgba(17, 172, 53, 1)',
                                                                                    strokeWidth: 2,
                                                                                },
                                                                                {
                                                                                    data: graphData?.minPrices?.reverse(), // Minimum Price
                                                                                    color: () => 'rgba(216, 193, 27, 1)',
                                                                                    strokeWidth: 2,
                                                                                },
                                                                            ],
                                                                        }}
                                                                        width={responsiveWidth(85)}
                                                                        height={300}
                                                                        yAxisLabel="₹"
                                                                        yAxisSuffix=""
                                                                        chartConfig={{
                                                                            backgroundGradientFrom: '#fff',
                                                                            backgroundGradientTo: '#fff',
                                                                            decimalPlaces: 0,
                                                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                            // color: (opacity = 1) => `rgba(211, 21, 10, ${opacity})`,
                                                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                            propsForDots: {
                                                                                r: '5',
                                                                                strokeWidth: '2',
                                                                                // stroke: 'red',
                                                                            },
                                                                            // propsForBackgroundLines: {
                                                                            //     strokeWidth: 0, 
                                                                            // },

                                                                        }}
                                                                        style={styleSheetStyles.chart}
                                                                    />
                                                                    <View style={styleSheetStyles.legendContainer}>
                                                                        <View style={[styleSheetStyles.legendItem, { backgroundColor: 'rgba(17, 172, 53, 1)' }]} />
                                                                        <Text style={[styleSheetStyles.legendText, { fontFamily: fonts.SemiBold }]}>{translate("Maximum_Price")}</Text>
                                                                        <View style={[styleSheetStyles.legendItem, { backgroundColor: 'rgba(216, 193, 27, 1)' }]} />
                                                                        <Text style={[styleSheetStyles.legendText, { fontFamily: fonts.SemiBold }]}>{translate("Minimum_Price")}</Text>
                                                                    </View>
                                                                </View>}
                                                        </ScrollView>
                                                    </View>
                                                </ViewShot>
                                            </View>
                                        </Modal>
                                    }
                                    {/* Render Crops Data */}
                                    {!mandiSelected && (
                                        <View style={{ marginBottom: 200, flex: 1, backgroundColor: 'red' }}>
                                            {loading && pageNo === 1 ? (
                                                <ActivityIndicator size="large" color="gray" />
                                            ) : (
                                                <FlatList
                                                    data={filteredData}
                                                    keyExtractor={(item, index) => `${item.name || index}`}
                                                    renderItem={renderCropsData}
                                                    onEndReachedThreshold={0.5}
                                                    onEndReached={handleLoadMore}
                                                    showsVerticalScrollIndicator={false}
                                                    ListFooterComponent={
                                                        loading && hasMoreData && pageNo > 1 ? (
                                                            <ActivityIndicator size="small" color="gray" />
                                                        ) : !hasMoreData && pageNo > 1 ? (
                                                            <Text style={{ textAlign: 'center', color: 'gray' }}>{translate("No_More_Data")}</Text>
                                                        ) : null
                                                    }
                                                    contentContainerStyle={{ paddingBottom: 90 }}
                                                    style={{
                                                        width: '95%',
                                                        alignSelf: 'center',
                                                        marginBottom: 90
                                                    }}
                                                />
                                            )}
                                        </View>

                                    )}
                                    {/* {loading && <PreLoginCustomLoader />} */}
                                    {/* {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />} */}
                                </>
                            )}
                </View>
            </View>
            <CustomCommonModal
                modalVisible={alertModal}
                modalClose={alertCloseHandle}
                ErrorText={alertTextContent}
                ButtonText={translate("ok")}
                ButtonFun={alertCloseHandle}
            />
        </View>
    );
}

let styleSheetStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: "center",
    },
    tab: {
        marginHorizontal: 7,
        // backgroundColor:"red"
    },
    text: {
        fontSize: 16,
        color: 'rgba(137, 137, 137, 1)',
        fontWeight: '400',
    },
    selectedText: {
        color: 'rgba(0, 0, 0, 1)',
    },
    chart: {
        marginTop: 8,
        borderRadius: 16,
        alignSelf: "center",
    },
    viewShot: {
        width: '100%',
        height: '100%',
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 10,
    },
    legendItem: {
        width: 10,
        height: 10,
        borderRadius: 50,
        marginHorizontal: 5,
    },
    legendText: {
        fontSize: RFValue(13, height),
        color: '#000',
        marginRight: 10,
        lineHeight: 20
    },

    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    marginTop_10: {
        marginTop: 10,
    },
    widthPct_90: {
        width: '100%',
    },
    bgF2F6F9: {
        backgroundColor: 'rgba(242, 246, 249, 1)',
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderRadius: 10
    },
    widthPct_33: {
        width: '33%',
    },
    padding_5: {
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    divider: {
        borderWidth: 0.5,
        borderColor: '#D1D5DB',
        height: 50,
        marginVertical: 3
    },

    fontSize_12: {
        fontSize: 11,
    },
    fontSize_16: {
        fontSize: 10,
    },
    fontSize_14: {
        fontSize: 8,
    },
    textAlignCenter: {
        textAlign: 'center',
    },
    textColorGreen: {
        color: 'rgba(9, 176, 43, 1)',
    },
    textColor: {
        color: '#000',
    },
    dividerMy2: {
        marginVertical: 6,
        borderBottomWidth: 0.5,
        borderColor: '#D1D5DB',
    },

    card: {
        width: 160,
        height: 230,
        borderRadius: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        position: "relative",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        position: "absolute",
    },
    nameContainer: {
        position: "absolute",
        bottom: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)", // Semi-transparent black
        // justifyContent: "center",
        // alignItems: "center",
        borderRadius: 8,
        // paddingLeft:5
        // padding: 10,
        paddingHorizontal: 4,
        // paddingBottom: 5,
    },
    overlayTitle: {
        fontSize: RFValue(10, height),
        color: "#fff",
        marginBottom: 1,
    },
    detail: {
        fontSize: RFValue(6, height),
        marginBottom: 2.5,
        color: "#ccc",
    },
    price: {
        fontSize: RFValue(9, height),
        // fontWeight: "bold",
        color: "#fff",
        // marginVertical: 3.5,
    },
    button: {
        backgroundColor: "red",
        // padding: 5, //old change
        borderRadius: 50,
        //new changes
        width: "100%",
        height: '25%',
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 10
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000000d6"
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 20,
        textAlign: "center",
        color: "rgba(0, 0, 0, 1)",
        // backgroundColor:"red",
        // width:"50%"
    },
    modalView: {
        height: responsiveHeight(90),
        width: responsiveWidth(90),
        // margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 8,
    },
});


export default MandiPricesScreen;