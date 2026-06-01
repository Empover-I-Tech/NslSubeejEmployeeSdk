import { View, TouchableOpacity, Dimensions, Pressable, FlatList, Text, StyleSheet, Alert, BackHandler, Platform, Image as RnImg, useWindowDimensions, StatusBar, Image } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { getFromAsyncStorage, storeInAsyncStorage } from '../utils/keychainUtils';
import { EMP_DASHBOARD_SCREEN, LANGUAGECODE, LANGUAGEID, LANGUAGENAME, ROLDID, SCREENNAME } from '../utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { changeLanguage } from '../Localization/Localisation';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import PreLoginCustomLoader from "../components/PreLoginCustomLoader";
import SimpleToast from 'react-native-simple-toast';
import { setSelectedCompanyAct } from '../state/actions/selectedCompanyActions';
import { useFontStyles } from '../hooks/useFontStyles';

const { width, height } = Dimensions.get('window');

const LanguageScreenRn = ({ route }) => {
    const fonts = useFontStyles()
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const isConnected = useSelector(state => state.network.isConnected);
    const [data, setData] = useState([])
    const currentTheme = useSelector(state => state.theme.theme);
    const url = APIConfig.BASE_URL + APIConfig.masters_getAllLanguagesForMobile_V1
    const [languageIndex, setLanguageIndex] = useState(-1)
    const [loaderApi, setLoaderApi] = useState(false)
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [languageCode, setLanguageCode] = useState("")
    const [languageName, setLanguageName] = useState("")
    const [languageId, setLanguageId] = useState("")
    const selectedCompanyData = useSelector(state => state.selectedCompnayAct.selectedCompanyAct)


    useFocusEffect(
        useCallback(() => {
            const fetchDataAsync = async () => {
                // setLoaderApi(true);
                const checkingLang = await getFromAsyncStorage(LANGUAGECODE);
                const checkingLangId = await getFromAsyncStorage(LANGUAGEID);
                const checkingLangName = await getFromAsyncStorage(LANGUAGENAME);
                setLanguageCode(checkingLang || "en");
                setLanguageId(checkingLangId || "1");
                setLanguageName(checkingLangName || "English");
                getAllLanguages()

            };
            fetchDataAsync();
        }, [])
    );

    const getAllLanguages = async () => {
        if (isConnected) {
            setLoaderApi(true);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (data.statusCode === HTTP_OK) {
                    chooseLanguageHandle(data.response.languageList);
                    setLoaderApi(false);
                } else {
                    setLoaderApi(false);
                }
            } catch (error) {
                setLoaderApi(false);
                console.error('Error fetching languages:', error);
            }
        } else {
            setLoaderApi(false);
            SimpleToast.show(translate('no_internet_conneccted'));
        }
    };

    chooseLanguageHandle = async (response) => {
        const checkingLang = await getFromAsyncStorage(LANGUAGECODE);
        const languageCode = checkingLang ? checkingLang : "en"
        const retrievedData = response
        if (retrievedData) {
            const sortedList = [...retrievedData].sort((a, b) => a.displayOrder - b.displayOrder);
            setData(sortedList);
            const defaultLanguage = sortedList.find(lang => lang.languageCode === languageCode);
            if (defaultLanguage) {
                setLanguageIndex(sortedList.indexOf(defaultLanguage));
                setLoaderApi(false)
            }
        } else if (error) {
            setLoaderApi(false)
        }
        changeLanguage(languageCode);
    }

    useEffect(() => {
        const backAction = async () => {
            const checkingLang = await getFromAsyncStorage(LANGUAGECODE);
            changeLanguage(checkingLang)
            navigation.goBack();
            return true;
        };

        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => subscription.remove();
    }, []);


    const handleContinue = async () => {
        await storeInAsyncStorage(LANGUAGECODE, languageCode)
        await storeInAsyncStorage(LANGUAGENAME, languageName)
        await storeInAsyncStorage(LANGUAGEID, `${languageId}`)
        const screenName = await getFromAsyncStorage(SCREENNAME)
        await changeLanguage(languageCode)
        const newStore = selectedCompanyData
        newStore.languageId = languageId
        dispatch(setSelectedCompanyAct(newStore));
        (screenName==EMP_DASHBOARD_SCREEN) ? navigation.navigate("BottomTabsNavigatorEmp") : navigation.navigate("MainTabs")
    };

    const handleLanGuageSelection = (item) => {
        changeLanguage(item?.languageCode)
        setLanguageCode(item?.languageCode)
        setLanguageName(item?.languageName)
        setLanguageId(item?.id)
    }

    const renderLanguageItem = ({ item, index }) => {
        const isSelected = index === languageIndex;
        return (
            <Pressable onPress={() => {
                setLanguageIndex(index)
                handleLanGuageSelection(item)
            }} style={[RnStyles.flatListItem, { backgroundColor: isSelected ? dynamicStyles.primaryColor : 'transparent', borderColor: isSelected ? dynamicStyles.primaryColor : currentTheme.lightGrey }]}>

                {isSelected && (
                    <View style={[RnStyles.tickContainer, { backgroundColor: dynamicStyles.secondaryColor }]}>
                        <RnImg
                            source={require("../../assets/Images/correctTickIcon.png")}
                            style={[RnStyles.tickIcon, { tintColor: dynamicStyles.primaryColor }]}
                        />
                    </View>
                )}

                {/* <VStack> */}
                <View>
                    <Text style={[RnStyles.localLanguageNameText, { color: isSelected ? dynamicStyles.secondaryColor : dynamicStyles.textColor, fontFamily: fonts.SemiBold }]}>
                        {item.localLanguageName}
                    </Text>

                    <Text style={[RnStyles.languageNameText, { color: isSelected ? dynamicStyles.secondaryColor : dynamicStyles.textColor, fontFamily: fonts.Regular }]}>
                        {item.languageName}
                    </Text>
                </View>
                {/* </VStack> */}
            </Pressable>
        )
    }

    const backHandle = async () => {
        const checkingLang = await getFromAsyncStorage(LANGUAGECODE);
        changeLanguage(checkingLang)
        navigation.goBack()

    }

    return (
        <View style={RnStyles.mainContainer}>
            {Platform.OS === 'android' && (
                <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle={currentTheme.statusBar} />
            )}

            <View style={RnStyles.headerContainer}>
                <View edges={['top']}>
                    <TouchableOpacity onPress={() => backHandle()}>
                        <Image source={require("../../assets/Images/samadhanBackIcon.png")} style={[{ height: 40, width: 40, resizeMode: "contain", tintColor: dynamicStyles.primaryColor, alignSelf: "flex-start", marginLeft: 10 }]} />
                    </TouchableOpacity>
                </View>
                <RnImg source={{ uri: dynamicStyles.programLogo }} style={RnStyles.companyLogo} />
            </View>
            <View style={RnStyles.chooseLanguageTextContainer}>
                <Text style={[RnStyles.chooseLanguageText, { fontFamily: fonts.Bold }]}>{translate('choose_lag')}</Text>
                <Text style={[RnStyles.chooseLanguageSubText, { fontFamily: fonts.Regular }]}>{translate('preferred_lang')}</Text>
            </View>

            <FlatList
                style={RnStyles.flatListContainer}
                data={data}
                numColumns={3}
                renderItem={renderLanguageItem}
                keyExtractor={(item) => item.id.toString()}
            />

            <View style={RnStyles.getStartedBtnConatiner}>
                <TouchableOpacity style={[RnStyles.getStartBtn, { backgroundColor: dynamicStyles.primaryColor }]}
                    onPress={handleContinue}
                >
                    <Text style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(16, 680), fontFamily: fonts.Bold }}>{translate('get_started')}</Text>
                </TouchableOpacity>
            </View>
            {loaderApi && <PreLoginCustomLoader />}
        </View>
    );

};

export default LanguageScreenRn;

const RnStyles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
        width: "100%"
    },

    headerContainer: {
        width: "100%",
        backgroundColor: "#F7F7F7",
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        // alignItems: "center",
        minHeight: height * 0.25,
        paddingBottom: 10
        // justifyContent: "center",
    },

    companyLogo: {
        height: height * 0.2,
        width: width * 0.4,
        resizeMode: "contain",
        alignSelf: "center"
    },

    headerText: {
        fontSize: RFValue(19, 680),
        color: "#000",
        fontWeight: "bold",
        marginTop: height * 0.02,
        textAlign: "center"
    },

    chooseLanguageTextContainer: {
        paddingLeft: 15,
        marginTop: 15
    },

    chooseLanguageText: {
        fontSize: RFValue(19, 680),
        color: "#5D5D5D",
    },

    chooseLanguageSubText: {
        fontSize: RFValue(12, 680),
        color: "#5D5D5D",
        marginVertical: height * 0.005,
    },

    getStartedBtnConatiner: {
        alignItems: "center"
    },

    getStartBtn: {
        borderRadius: 8, alignItems: "center",
        justifyContent: "center",
        height: height * 0.06,
        width: "85%",
        marginBottom: Platform.OS == "ios" ? height * 0.03 : height * 0.018
    },

    getStartedText: {
        fontSize: RFValue(16, 680),
    },

    flatListContainer: {
        width: "95%",
        alignSelf: "center"
    },

    flatListItem: {
        width: "30%",
        padding: 15,
        alignSelf: "center",
        margin: 5,
        borderRadius: 8,
        borderWidth: 1
    },

    tickContainer: {
        padding: 3,
        borderRadius: 40,
        position: "absolute",
        top: 5,
        right: 10,
        width: 15, height: 15,
    },

    tickIcon: {
        resizeMode: "contain",
        height: 10,
        width: 10,
    },

    localLanguageNameText: {
        textAlign: "center",
        fontSize: RFValue(14, 680),
        marginTop: 15
    },

    languageNameText: {
        textAlign: "center",
        fontSize: RFValue(12, 680),
        marginTop: 5,
        marginBottom: 10
    },

})
