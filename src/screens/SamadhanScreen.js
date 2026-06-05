import { Linking, Platform, Dimensions, Modal, FlatList, Text, View, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Pressable } from "react-native"
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GetApiHeaders } from '../utils/helpers';
import { useFocusEffect, useNavigation, useNavigationState } from '@react-navigation/native';
import APIConfig from '../api/APIConfig';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from "react-native-responsive-fontsize";
import { translate } from "../Localization/Localisation";
import SimpleToast from 'react-native-simple-toast';
import realm from "./realmOffline/realmConfig";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { mergeComplaintData, processComplaintImages } from "../assets/Utils/Utils";
import { helpDeskRaiseCRUD } from "./realmOffline/helpDeskRaiseCRUD";
import { useFontStyles } from "../hooks/useFontStyles";


const { width, height } = Dimensions.get('window');


const SamadhanScreen = ({ route }) => {
    console.log("hhheight", height)
    const fonts = useFontStyles()
    const isConnected = useSelector(state => state?.network?.isConnected);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [samadhanInfoDetails, setSamadhanInfoDetails] = useState("")
    const [samadhanContactNum, setSamadhanContactNum] = useState("")
    const [complaintList, setComplaintList] = useState([])
    const [loader, setLoader] = useState(false)
    const [issuesDuplicateList, setIssuesDuplicateList] = useState([])
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
    const navigation = useNavigation();
    const routeNames = useNavigationState(state => state?.routeNames ?? []);
    // BottomTabsEmp has HomeScreenEmp; BottomTabs (farmer) does not
    const isEmpNavigator = routeNames.includes('HomeScreenEmp');
    const listFooterPadding = isEmpNavigator ? 90 : 65;
    const cachedSamadhanHistory = realm.objects('SAMADHANHISTORY');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    console.log("sama=-=-?>", cachedSamadhanHistory.length)

    console.log("isConnected", isConnected)

    const {
        getAllHelpDesk,
    } = helpDeskRaiseCRUD();

    const navigateComplaintScreen = () => {
        navigation.navigate("RaiseComplaintScreen")
    }

    useFocusEffect(
        useCallback(() => {
            setLoader(true)
            fetchDataBasedOnDate()
        }, [])
    );

    useEffect(() => {
        if (route?.params?.screenName === "raiseComplaint") {
            fetchHelpCenterList()
            console.log("called=-=-=->route")
        }

    }, [route?.params?.screenName])

    const makeCall = () => {
        const cleanNumber = samadhanContactNum?.replace(/[^\d+]/g, ""); // keeps only digits and +
        const phoneUrl = `tel:${cleanNumber}`;

        Linking.openURL(phoneUrl).catch(() => {
            SimpleToast.show(translate("Failed_to_open_dialer"));
        });
    };


    const fetchDataBasedOnDate = async () => {
        const newDataArray = getAllHelpDesk(); // Local offline data

        if (cachedSamadhanHistory && cachedSamadhanHistory.length > 0) {
            const parseCacheSamadhanHistory = JSON.parse(cachedSamadhanHistory[0].ticketsHistory);

            setSamadhanInfoDetails(parseCacheSamadhanHistory.samadhanAvailableInfo);
            setSamadhanContactNum(parseCacheSamadhanHistory.samadhanContactNum);
            setLoader(false);

            const serverData = parseCacheSamadhanHistory.complaintList || [];

            if (serverData.length > 0 && newDataArray.length > 0) {
                const mergedData = await mergeComplaintData(serverData, newDataArray);
                setComplaintList(mergedData);
            } else if (serverData.length === 0 && newDataArray.length > 0) {
                // Server data empty, only use local
                const mergedData = await mergeComplaintData([], newDataArray);
                setComplaintList(mergedData);
            } else {
                setComplaintList(serverData); // Even if empty
            }

        } else if (cachedSamadhanHistory.length === 0 && newDataArray.length > 0) {
            const mergedData = await mergeComplaintData([], newDataArray);
            setComplaintList(mergedData);
        } else if (isConnected) {
            fetchHelpCenterList();
        } else {
            setLoader(false);
            SimpleToast.show(translate("no_internet_conneccted"));
        }
    };

    const fetchHelpCenterList = async () => {
        if (isConnected) {
            try {

                const headers = await GetApiHeaders();
                const payload = {
                    "farmerId": headers.userId,
                    'companyCode': dynamicStyles.companyCode
                };
                console.log("checking=-=-=-=headers,", headers)

                const url = APIConfig.BASE_URL_NVM + APIConfig.getRaisedComplaints_v1
                const response = await axios.post(url, payload, { headers });
                console.log("resposneapoop=-=->", response.data)

                if (response?.data?.statusCode === "200") {
                    console.log("apitesting=-=-=->", response.data)
                    const parseData = response.data;

                    setSamadhanInfoDetails(response.data.samadhanAvailableInfo)
                    setSamadhanContactNum(response.data.samadhanContactNum)
                    setLoader(false)
                    setComplaintList(response.data.complaintList)
                    let samadhanHistoryId;
                    const maxAttempts = 3;
                    let attempts = 0;
                    while (attempts < maxAttempts) {
                        try {
                            samadhanHistoryId = uuidv4();
                            console.log('Generated samadhanHistoryId:', samadhanHistoryId);
                            const existingKnowledgeCenter = realm.objects('SAMADHANHISTORY').filtered('_id == $0', samadhanHistoryId);
                            if (existingKnowledgeCenter.length === 0) {
                                break;
                            }
                            console.warn(`UUID collision detected for ${samadhanHistoryId}, attempt ${attempts + 1}`);
                            attempts++;
                        } catch (uuidError) {
                            console.error('Error generating UUID for samadhanHistory:', uuidError);
                            setLoader(false)
                            return;
                        }
                        if (attempts >= maxAttempts) {
                            console.error('Failed to generate unique UUID after', maxAttempts, 'attempts');
                            setLoader(false)
                            return;
                        }
                    }

                    // Try to download and update complaint images
                    let finalJsonToStore = parseData;

                    try {
                        const updatedJson = await processComplaintImages(parseData);
                        finalJsonToStore = updatedJson;
                        console.log('✅ Images processed, updated JSON ready for Realm.');
                    } catch (downloadErr) {
                        console.error('⚠️ Failed to process images, storing original JSON:', downloadErr);
                        // finalJsonToStore already points to parseData
                    }

                    try {
                        realm.write(() => {
                            realm.delete(cachedSamadhanHistory);
                            realm.create('SAMADHANHISTORY', {
                                _id: samadhanHistoryId,
                                ticketsHistory: JSON.stringify(finalJsonToStore),
                                timestamp: new Date(),
                            });
                        });
                        console.log('Successfully created samadhanhistory with _id:', samadhanHistoryId);
                    } catch (realmError) {
                        console.error('Error creating samadhanHistory object in Realm:', realmError);
                    }
                } else {
                    setLoader(false)
                    SimpleToast.show(translate("Unable_to_fetch_issue_details"))
                    // Alert.alert(translate("Error"), translate("Unable_to_fetch_issue_details"));
                }
            } catch (error) {
                setLoader(false)

                // console.error("Error fetching data:", error);
                SimpleToast.show(translate("An_unexpected_error_occurred_Please_try_again"))

                // Alert.alert(translate("Error"), translate("An_unexpected_error_occurred_Please_try_again"));
            }
        } else {
            setLoader(false)
            // SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    const handleDuplicatesItemsModal = (duplicateCount, duplicatesList) => {
        if (duplicateCount > 0) {
            setDuplicateModalOpen(true)
            setIssuesDuplicateList(duplicatesList)
        }

    }

    const closeHandleDuplicatesItemsModal = () => {
        setDuplicateModalOpen(false)
    }

    const renderComplaintsList = (item) => {
        return (
            <TouchableOpacity onPress={() => handleDuplicatesItemsModal(item.item.dupicateCount, item.item.relatedDuplicates)} style={RnStyle.couponContainer}>
                <View style={RnStyle.subTextContainer}>
                    <Text style={[RnStyle.couponIssueText, { fontFamily: fonts.SemiBold }]}>{`${item.item.categoryName} - ${item.item.subcategoryName}`}</Text>
                    <View style={RnStyle.duplicateCountBackground}>
                        <Text style={[RnStyle.duplicateCountText, { fontFamily: fonts.SemiBold }]}>{item.item.dupicateCount}</Text>
                    </View>
                </View>

                {item?.item?.coupon &&
                    <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{`${item.item.coupon} - ${translate("Got_coupons_which_are_invalid")}`}</Text>
                }
                <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{item.item.raisedBy}</Text>
                <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{translate("status")} - <Text style={{ color: "#DB710E" }}>{item.item.complaintStatus}</Text></Text>
            </TouchableOpacity>
        )
    }

    const onRefresh = useCallback(async () => {
        if (isConnected) {
            setLoader(true);
            await fetchHelpCenterList()
            setLoader(false);
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
            setLoader(false);
        }
    }, [isConnected]);

    const getImageUri = (item) => {
        if (item?.complaintImageLocal) {
            let path = item.complaintImageLocal;

            // ✅ Add file:// only if missing (works for BOTH platforms)
            if (!path.startsWith('file://') && !path.startsWith('http')) {
                path = `file://${path}`;
            }

            return path;
        }

        if (item?.complaintImage) {
            return item.complaintImage;
        }

        return null;
    };

    return (
        <>
            <View style={RnStyle.samadhanMainContainer}>

                <View style={RnStyle.headerContainer}>
                    <Text style={[RnStyle.samadhanText, { fontFamily: fonts.SemiBold }]}>{translate("samadhan")}</Text>
                    <TouchableOpacity onPress={onRefresh} style={{
                        alignSelf: "flex-start", marginLeft: 10, marginRight: 5, right: 0, position: "absolute"
                    }}>
                        <Image source={require("../../assets/Images/RefreshIcon.png")} style={{ height: 30, width: 30, tintColor: "#000" }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[RnStyle.headerMssgText, { fontFamily: fonts.SemiBold }]}>{translate("how_can_we_help")}</Text>
                    <View style={RnStyle.line} />
                    <View style={RnStyle.supportMssgTextContainer}>
                        <Text style={[RnStyle.supportMssgText, { fontFamily: fonts.Regular }]}>{translate("samadan_text")}</Text>
                        <Text style={[RnStyle.supportMssgText, { fontFamily: fonts.Regular }]}>{translate("contact_our_support_center")}</Text>
                    </View>
                    <View style={RnStyle.contactSamadhanContainer}>
                        <View style={RnStyle.imgContainer}>
                            <Image style={RnStyle.companyLogoIcon} source={require("../../assets/Images/samadhanIconImg.png")} />
                        </View>
                        <View style={RnStyle.contactSamadhanContentContainer}>
                            <Text style={[RnStyle.samandhanContactHeader, { fontFamily: fonts.SemiBold }]}>{translate("samadhan")}</Text>
                            <Text style={[RnStyle.phoneNumberText, { fontFamily: fonts.Regular }]}>{samadhanContactNum}</Text>
                            <Text style={[RnStyle.phoneNumberText, { fontFamily: fonts.Regular }]}>{samadhanInfoDetails}</Text>
                        </View>
                        <TouchableOpacity onPress={makeCall} >
                            <Image style={[RnStyle.callIcon]}
                                source={require("../../assets/Images/CallingIcon.png")} />
                        </TouchableOpacity>
                    </View>
                    <View style={[RnStyle.supportTicketBtnContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                        <Image style={[RnStyle.supportTicketIcon, { tintColor: dynamicStyles.secondaryColor }]} source={require("../../assets/Images/supportTicketIcon.png")} />
                        <Text style={[RnStyle.supportTicketText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.Regular }]}>{translate("Support_Tickets")}</Text>
                    </View>

                    <FlatList
                        style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={() => <Text style={{ color: "#000", fontWeight: "bold", fontSize: RFValue(17, height), alignSelf: "center", marginTop: 15 }}>{translate("No_data_available")}</Text>}
                        data={complaintList}
                        renderItem={renderComplaintsList}
                        ListFooterComponent={<View style={{ height: 10 }} />}
                    />
                </View>

                <TouchableOpacity onPress={navigateComplaintScreen} style={[RnStyle.supportTicketBtnContainer1, { backgroundColor: dynamicStyles.primaryColor, marginBottom: listFooterPadding }]}>
                    <Image style={[RnStyle.supportTicketIcon1, { tintColor: dynamicStyles.secondaryColor }]} source={require("../../assets/Images/plusIconImg.png")} />
                    <Text style={[RnStyle.supportTicketText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.Regular }]}>{translate("Raise_Complaints")} </Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={duplicateModalOpen}
                >
                    <TouchableWithoutFeedback>
                        <View
                            style={{
                                backgroundColor: "rgba(0,0,0,0.3)",
                                flex: 1,
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: "#fff",
                                    // padding:13,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    borderRadius: 5,
                                    width: "90%",
                                    // minHeight: "50%",
                                    paddingHorizontal: 12,
                                    paddingBottom: 20,
                                    borderRadius: 10
                                }}
                            >
                                <TouchableOpacity onPress={closeHandleDuplicatesItemsModal} style={{ marginVertical: 10, alignSelf: "flex-end", height: 30, width: 30, borderRadius: 30, borderWidth: 1, borderColor: dynamicStyles.primaryColor, justifyContent: "center", alignItems: "center" }}>
                                    <Image source={require("../../assets/Images/crossIcon.png")} style={{ resizeMode: "contain", height: 15, width: 15, tintColor: dynamicStyles.primaryColor }} />
                                </TouchableOpacity>

                                <View style={{ height: height * 0.5, paddingBottom: 10 }}>
                                    <FlatList showsVerticalScrollIndicator={false} data={issuesDuplicateList} renderItem={(item) => {
                                        console.log("coupons=-=->", item.item)
                                        return (

                                            <Pressable style={RnStyle.couponContainer1}>
                                                <View style={RnStyle.subTextContainer}>
                                                    <Text style={[RnStyle.couponIssueText, { fontFamily: fonts.SemiBold }]}>{`${item.item.categoryName} - ${item.item.subcategoryName}`}</Text>
                                                </View>
                                                {item?.item?.scanCouponLabel[0]?.couponName &&
                                                    <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{`${item?.item?.scanCouponLabel[0].couponName} - ${translate("Got_coupons_which_are_invalid")}`}</Text>
                                                }
                                                {item?.item?.remarks &&
                                                    <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{`${translate("Remarks")} : ${item.item.remarks}`}</Text>
                                                }

                                                {/* <Text style={[RnStyle.gotCouponsInvalidText,{fontFamily:fonts.Regular}]}>{`${item.item.coupon} - Got coupons which are invalid`}</Text> */}
                                                <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{item.item.raisedBy}</Text>

                                                <Text style={[RnStyle.gotCouponsInvalidText, { fontFamily: fonts.Regular }]}>{translate("status")} - <Text style={{ color: "#DB710E" }}>{item.item.complaintStatus}</Text></Text>
                                                {(item?.item?.complaintImage || item?.item?.complaintImageLocal) &&

                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setSelectedImage(getImageUri(item.item));
                                                            setPreviewVisible(true);
                                                            Platform.OS === 'ios' && setDuplicateModalOpen(false);
                                                        }}
                                                    >
                                                        <Image
                                                            source={{ uri: getImageUri(item.item) }}
                                                            style={{
                                                                height: height * 0.1,
                                                                width: width * 0.2,
                                                                borderRadius: 15,
                                                                alignSelf: "flex-end",
                                                            }}
                                                            resizeMode="cover"
                                                            progressiveRenderingEnabled={true}
                                                            fadeDuration={200}
                                                        />
                                                    </TouchableOpacity>

                                                }
                                            </Pressable>
                                        )
                                    }} />
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

            </View>
            {loader && <PreLoginCustomLoader />}
            {previewVisible &&
                <Modal
                    visible={previewVisible}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.9)",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setPreviewVisible(false)}
                            style={{
                                position: "absolute",
                                top: 40,
                                right: 20,
                                zIndex: 10,
                                height: 35,
                                width: 35,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: dynamicStyles.primaryColor,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#fff"
                            }}
                        >
                            <Image
                                source={require("../../assets/Images/crossIcon.png")}
                                style={{
                                    height: 15,
                                    width: 15,
                                    resizeMode: "contain",
                                    tintColor: dynamicStyles.primaryColor
                                }}
                            />
                        </TouchableOpacity>

                        {/* Full Image */}
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{
                                    width: width * 0.95,
                                    height: height * 0.7,
                                }}
                                resizeMode="contain"
                            />
                        )}

                    </View>
                </Modal>}
        </>
    )
}

export default SamadhanScreen

const RnStyle = StyleSheet.create({
    samadhanMainContainer: {
        padding: 20,
        backgroundColor: "#F2F6F9",
        flex: 1
    },

    backIcon: {
        height: 30,
        width: 40,
        resizeMode: "contain"
    },

    samadhanText: {
        color: "#000",
        fontSize: RFValue(16, height),
        marginLeft: 20
    },

    headerContainer: {
        flexDirection: "row",
        alignItems: "center"
    },

    headerMssgText: {
        color: "#000",
        fontSize: 23,
        textAlign: "center",
        marginTop: 2
    },

    line: {
        marginVertical: 10,
        height: 1,
        width: "100%",
        backgroundColor: "#0000001A",
        borderRadius: 30
    },

    supportMssgTextContainer: {
        alignItems: "center"
    },

    supportMssgText: {
        color: "#000",
        fontSize: 13,
        lineHeight: 20
    },

    contactSamadhanContainer: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#0000001A",
        borderRadius: 8,
        marginTop: 6,
        padding: 2,
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        paddingVertical: 6,
        paddingLeft: 10
    },

    imgContainer: {
        backgroundColor: "#F6F6F6",
        width: 80,
        height: 80,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },

    companyLogoIcon: {
        width: 50,
        height: 20,
        // resizeMode:"contain"
    },

    contactSamadhanContentContainer: {
        marginLeft: 15,
        width: "58%"
    },

    samandhanContactHeader: {
        color: "#000",
        fontSize: RFValue(14, 680),
    },

    phoneNumberText: {
        color: "#000",
        fontSize: RFValue(11, 680),
        // width: 190,
        marginTop: 2
    },

    callIcon: {
        height: 29, width: 28,
        resizeMode: "contain"
    },

    supportTicketBtnContainer: {
        height: 40,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    supportTicketBtnContainer1: {
        height: 45,
        marginTop: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    supportTicketIcon: {
        height: 20,
        width: 20,
        resizeMode: "contain",
        marginRight: 10
    },

    supportTicketIcon1: {
        height: 15,
        width: 15,
        resizeMode: "contain",
        marginRight: 10
    },

    supportTicketText: {
        fontSize: RFValue(14, height),
        lineHeight: 30
    },

    couponContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginTop: 5
    },

    couponContainer1: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        elevation: 5,
        borderRadius: 15,
        width: "95%",
        alignSelf: "center",
        marginBottom: 10
    },

    couponIssueText: {
        color: "#000",
        fontSize: 14
    },

    gotCouponsInvalidText: {
        color: "#000",
        fontSize: RFValue(13, height),
        marginTop: 10,
        lineHeight: 20
    },

    subTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    duplicateCountBackground: {
        backgroundColor: "#DB710E",
        minHeight: 20,
        minWidth:30,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40,
        padding:5
    },


    duplicateCountText: {
        color: "#fff",
        fontSize: 12,
    },

    fixedButton: {
        position: 'absolute',
        bottom: 80, // move above tab bar height
        alignSelf: 'center',
    }
})