import { LayoutAnimation, UIManager, ActivityIndicator,StatusBar ,Dimensions, TouchableOpacity, Pressable, StyleSheet, Text, View, Image, useWindowDimensions, FlatList, Animated, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from "react";
import { Styles } from '../styles/Styles'
import { useSelector,useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import { decodeJwt, GetApiHeaders } from '../utils/helpers';
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { translate } from '../Localization/Localisation';
import RenderHTML from 'react-native-render-html';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomLoader from '../components/CustomLoader';
import { setSelectedCompanyAct } from '../state/actions/selectedCompanyActions';

const { width, height } = Dimensions.get('window');

const SelectCompanyScreenRn = ({ route }) => {
    const navigation = useNavigation()
    const { width } = useWindowDimensions();
    const dispatch = useDispatch();
    const currentTheme = useSelector(state => state.theme.theme);
    const selectedCompanyData=useSelector(state=>state.selectedCompnayAct.selectedCompanyAct)
    console.log("capmaylangiaps[a====>",selectedCompanyData)

    const styles = Styles(currentTheme);
    // const statusBarColor = useColorModeValue("#845EF1", currentTheme.darkBackground);
    const { getData, getLoading, error, statusCode, fetchData } = useGetRequestWithJwt();
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [companyData, setCompanyData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [companyInformation, setCompanyInfo] = useState("")
    const {
         userId, 
         mobileNumber } = route.params;
    // console.log(mobileNumber,userId,"kiaopaos=-=-=->")
    const [loaderApi, setLoaderApi] = useState(false)
    const [loaderImage, setLoaderImage] = useState(require('../../assets/Images/SubeejLoader.gif'))

    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const url =APIConfig.BASE_URL+APIConfig.GETALLCOMPANIES

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoaderApi(true)
            try {
                const headers = await GetApiHeaders();
                console.log("Headers used:", headers);
                const rawData = await fetchData(url, headers, true);
                console.log("Raw response:", rawData);
                if (!rawData || !rawData.data) {
                    setLoaderApi(false)
                    console.error("Invalid response data");
                    return;
                }
                const res = JSON.parse(rawData?.data);
                console.log("Parsed response:", res);
                if (rawData?.statusCode === HTTP_OK) {
                    setLoaderApi(false)
                    if (res?.CompanyList?.length > 0) {
                        setLoaderApi(false)
                        setCompanyData(res.CompanyList);
                        console.log("Companies fetched successfully:", res.CompanyList);
                    } else {
                        setLoaderApi(false)
                        console.log("No companies found in the response.");
                    }
                } else {
                    setLoaderApi(false)
                    console.error("Failed to fetch companies:", res?.message || "Unknown error");
                }
            } catch (error) {
                setLoaderApi(false)
                console.error("Error fetching company data:", error);
            }
        };
        fetchCompanies();
    }, []);

    const renderCompany = ({ item, index }) => {
        const isSelected = index === selectedIndex;
        const handlePress = () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSelectedIndex(index);
            setCompanyInfo(item.companyInfo);
        };
        console.log("compnay[ap=-=->",item)
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[RnStyles.selectCompanyBtnContainer, {
                    backgroundColor: isSelected ? item.primaryColor : "transparent",
                    borderColor: isSelected ? item.primaryColor : "lightgrey",
                }]}
                onPress={handlePress}
            >
                {isSelected && (
                    <View style={[RnStyles.tickContainer, { backgroundColor: item.secondaryColor }]}>
                        <Image
                            source={require("../../assets/Images/correctTickIcon.png")}
                            style={[RnStyles.tickIcon, { tintColor: item.primaryColor }]}
                        />
                    </View>
                )}
                <View
                    style={[
                        RnStyles.logonContainer,
                        {
                            transform: [{ scale: isSelected ? 1.2 : 1 }],
                            height: isSelected ? height * 0.1 : height * 0.09,
                            width: isSelected ? width * 0.2 : width * 0.18,
                            backgroundColor: isSelected ? "#FFFFFF" : "#EDEDED",
                        },
                    ]}
                >
                    <Image
                        source={{ uri: item?.companyLogo }}
                        style={[
                            RnStyles.logoIcon,
                            {
                                width: isSelected ? width * 0.15 : width * 0.1,
                                height: isSelected ? width * 0.15 : width * 0.1,
                            },
                        ]}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    // if (getLoading) {
    //     return (
    //         <Center>
    //             <ActivityIndicator size="large" color={"#845EF1"} />
    //             <Text>{translate('Loading_companies')}</Text>
    //         </Center>
    //     );
    // }

    // if (error) {
    //     return (
    //         <Center>
    //             <Text style={{ color: 'red' }}>Error: {error.message}</Text>
    //         </Center>
    //     );
    // }
    console.log("lolpopo=-=-=->",companyData[selectedIndex])

    const handleProceed = () => {
        if (selectedIndex === null) {
            // setShowModal(true);
            Alert.alert(translate("please_select_company_to_proceed"))
        } else {
            const selectedCompany = companyData[selectedIndex];
            // console.log("kuiran=-=-=>",selectedCompany)
            if (selectedCompany) {
                // const selectedCompany={
                //     selectedCompany: selectedCompany,
                //     // userId: userId,
                //     // mobileNumber: mobileNumber,
                // }
                const selectedCompnayDetails=selectedCompanyData
                console.log("kioiaosioa=-=-=->",selectedCompnayDetails)
                selectedCompnayDetails.selectedCompanyDet=selectedCompany
                // console.log(selectedCompnayDetails,"kiranlkalsk")
                dispatch(setSelectedCompanyAct(selectedCompnayDetails));
                navigation.navigate('RegistrationRn');
                // navigation.navigate('LanguageScreenRn', {
                //     selectedCompany: selectedCompany,
                //     userId: userId,
                //     mobileNumber: mobileNumber,
                // });
            } else {
                console.error("Selected company is invalid");
            }
        }
    };


  const statusBarHeight = Platform.OS === 'ios' ?0 : StatusBar.currentHeight || 0;

    return (
        <View style={RnStyles.mainContainer}>
            {Platform.OS === 'android' && (<StatusBar backgroundColor={"#845EF1"} barStyle={currentTheme.statusBar} />)}
            <View style={[RnStyles.headerMainContainer,{height: height * 0.1,}]}>
                <Text style={RnStyles.headerText}> {translate('Select_Company_Enroll')} </Text>
                <Image source={require('../../assets/Images/flowerIcon.png')} style={[RnStyles.flowerImg,{top: height * 0.03,}]} />
            </View>
            {!loaderApi &&
                <View style={RnStyles.companySelectionMainContainer}>
                    <FlatList
                        data={companyData}
                        numColumns={2}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCompany}
                        ListEmptyComponent={() => <Text style={RnStyles.noDataText}>{translate("No_data_available")}</Text>}
                    />
                    <View>
                        <RenderHTML contentWidth={width} source={{ html: companyInformation }}
                        enableCSSInlineProcessing={true} />
                        <View style={RnStyles.center}>
                            <TouchableOpacity style={RnStyles.proceedButtonContainer} onPress={handleProceed}>
                                <Text style={RnStyles.buttonText}>{translate('Proceed')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
            {/* <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
                <Modal.Content>
                    <Modal.CloseButton />
                    <Modal.Header>Confirmation</Modal.Header>
                    <Modal.Body>
                        <Text>{translate('Please_select_company_to_proceed')}</Text>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" colorScheme="coolGray" onPress={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button onPress={() => setShowModal(false)}>
                                OK
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal> */}
            {/* {loaderApi && <CustomLoader loading={loaderApi} loaderImage={loaderImage} />} */}
                {loaderApi && <View style={{position:"absolute",alignSelf:"center",flex:1,justifyContent:"center",top:height*0.5}}>
                  <ActivityIndicator  size="large" color="#0000ff" />
                  </View>}
        </View>
    )
}

export default SelectCompanyScreenRn

const RnStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: "#F2F6F9",
        height: "100%",
        width: "100%",
    },

    headerMainContainer: {
        backgroundColor: "#845EF1",
        borderBottomRightRadius: 40,
        borderBottomLeftRadius: 40,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },

    headerText: {
        fontSize: RFValue(17, 680),
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center"
    },

    flowerImg: {
        position: "absolute",
        right: width * 0.01,
        height: height * 0.07,
        width: width * 0.3,
        tintColor: "#000",
        resizeMode: "contain"
    },

    companySelectionMainContainer: {
        backgroundColor: "#fff",
        width: "95%",
        borderRadius: 10,
        marginTop: 15,
        alignSelf: "center"
    },

    selectCompanyBtnContainer: {
        height: height * 0.17,
        padding: 15,
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
        width: "45%",
        borderRadius: 8,
        borderWidth: 0.5,
    },

    tickContainer: {
        padding: 3,
        borderRadius: 30,
        position: "absolute",
        top: height * 0.009,
        left: width * 0.33,
    },

    tickIcon: {
        resizeMode: "contain",
        height: 10,
        width: 10,
    },

    logonContainer: {
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },

    logoIcon: {
        overflow: "hidden",
        resizeMode: "contain",
    },

    center: {
        alignItems: "center",
        marginTop: 10,
    },

    proceedButtonContainer: {
        marginTop: 10,
        width: "85%",
        height: height * 0.06,
        marginBottom: 10,
        backgroundColor: "#845EF1",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },

    buttonText: {
        fontSize: RFValue(16, 680),
        fontWeight: "bold",
        color: "#fff",
    },

    noDataText:{
        fontSize:RFValue(16,680), 
        fontWeight: "bold",
        color: "#000",
        alignSelf: "center", 
        marginTop: 30 
    }
})