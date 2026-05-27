import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, FlatList, Dimensions } from "react-native"
import { useState, useCallback } from "react"
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { translate } from '../Localization/Localisation';
import { GetApiHeaders } from '../utils/helpers'
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import { RFValue } from "react-native-responsive-fontsize";
import moment from "moment";
import { useFontStyles } from "../hooks/useFontStyles";
const { width, height } = Dimensions.get('window');

const BookingHistory = () => {
    const [bookHistoryData, setBookHistoryData] = useState([])
    const [bookHistoryDataOriginal, setBookHistoryDataOriginal] = useState([])
    const [searchValue, setSearchValue] = useState("")
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const navigation = useNavigation();
    const fonts = useFontStyles()

    useFocusEffect(
        useCallback(() => {
            handleSubmit();
        }, [])
    );

    const historyItems = (item, index) => {
        const formattedDate = moment(item.item.requiredBy, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY");
        return (
            <TouchableOpacity disabled={item.item.dateOfPlanting ? true : false} onPress={() => handleNavigationSampleFeedback(item.item)} style={[RnStyles.contentHistoryMainContainer, { backgroundColor: item.item.dateOfPlanting ? "#D6D6D6" : "#FBFBFB", }]}>
                <View style={RnStyles.labelsHistoryContainer}>
                    <Text style={[RnStyles.labelHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("Crop_text")}</Text>
                    <Text style={[RnStyles.labelValuesHistory, { fontFamily: fonts.Regular }]}>: {item.item.cropName}</Text>
                </View>
                <View style={RnStyles.labelsHistoryContainer}>
                    <Text style={[RnStyles.labelHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("Hybrid/Variety")}</Text>
                    <Text style={[RnStyles.labelValuesHistory, { fontFamily: fonts.Regular }]}>: {item.item.hybridName}</Text>
                </View>
                <View style={RnStyles.labelsHistoryContainer}>
                    <Text style={[RnStyles.labelHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("quantity")}</Text>
                    <Text style={[RnStyles.labelValuesHistory, { fontFamily: fonts.Regular }]}>: {`${item.item.quantity} ${item.item.cropName === "Cotton" ? translate("Pkts") : translate("kgs")}`}</Text>
                </View>
                <View style={RnStyles.labelsHistoryContainer}>
                    <Text style={[RnStyles.labelHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("Booking_Date")}</Text>
                    <Text style={[RnStyles.labelValuesHistory, { fontFamily: fonts.Regular }]}>: {formattedDate}</Text>
                </View>
                {item.item.dateOfPlanting &&
                    <>
                        <View style={RnStyles.labelsHistoryContainer}>
                            <Text style={[RnStyles.labelHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("Date_of_Planting")}</Text>
                            <Text style={[RnStyles.labelValuesHistory, { fontFamily: fonts.Regular }]}>: {moment(item.item.dateOfPlanting, "YYYY-MM-DD HH:mm:ss.S").format("DD-MMM-YYYY")}</Text>
                        </View>
                        <View style={RnStyles.labelsHistoryContainer}>
                            <Text style={[RnStyles.labelHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("harvest_yield")}</Text>
                            <Text style={[RnStyles.labelValuesHistory, { fontFamily: fonts.Regular }]}>: {item.item.harvestYield}</Text>
                        </View>
                    </>
                }
            </TouchableOpacity>
        )
    }

    const handleNavigationGoBack = () => {
        navigation.goBack()
    }

    const handleNavigationSampleFeedback = (value) => {
        navigation.navigate("SampleFeedBack", value)
    }


    const handleSubmit = async () => {
        const headers = await GetApiHeaders();
        const url = APIConfig.BASE_URL + APIConfig.GETSEEDBOOKINGHISTORY + `${headers.userId}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': APIConfig.FORMDATAHEADER,
                },
            });

            const data = await response.json();
            if (data.statusCode === 200) {
                setBookHistoryData(data.response.bookingList)
                setBookHistoryDataOriginal(data.response.bookingList)
            }
        } catch (error) {
            console.error('Error fetching data:', error);

        }
    };


    const handleSearchvalue = (value) => {
        setSearchValue(value.replace(/\s/g, ""))
        const filterValue = bookHistoryDataOriginal.filter((item) =>
            item.cropName.toLowerCase().includes(value.replace(/\s/g, "").toLowerCase())
        );

        if (value.length == 0) {
            setBookHistoryData(bookHistoryDataOriginal)
        }
        else if (filterValue.length > 0) {
            setBookHistoryData(filterValue)
        } else if(value?.length !== 0 && filterValue?.length == 0){
            setBookHistoryData([])
        }
        else {
            handleSubmit()
        }
    }

    return (
        <View style={RnStyles.booksSeedsMainContainer}>
            <View style={[RnStyles.headerMainContainer, { backgroundColor: dynamicStyles.primaryColor }]}>
                <View style={RnStyles.headerContentContainer}>
                    <TouchableOpacity onPress={handleNavigationGoBack}>
                        <Image source={require('../../assets/Images/BackIcon.png')} style={[RnStyles.backArrowImg, { tintColor: dynamicStyles.secondaryColor }]} />
                    </TouchableOpacity>
                    <Text style={[RnStyles.bookSeedsText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>{translate("Booking_History")}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Image source={require('../../assets/Images/flowerIcon.png')} style={RnStyles.flowerImg} />
            </View>
            <View style={RnStyles.contentMainContainer}>
                <View style={RnStyles.textFieldsMainContainer}>
                    <View style={RnStyles.searchFieldMainContainer}>
                        <Image source={require('../../assets/Images/SearchingImg.png')} style={RnStyles.searchImg} />
                        <TextInput value={searchValue} onChangeText={handleSearchvalue} placeholder={translate("Search_here")}
                            style={[RnStyles.searchInputContainer, { fontFamily: fonts.Regular }]} placeholderTextColor={"#00000080"} />
                    </View>
                    <FlatList ListEmptyComponent={() => <Text
                        style={[RnStyles.noBookingHistoryText, { fontFamily: fonts.SemiBold }]}>{translate("No_Booking_History")}</Text>} showsVerticalScrollIndicator={false} data={bookHistoryData} renderItem={historyItems} />
                </View>
            </View>
        </View>
    )
}

export default BookingHistory

const RnStyles = StyleSheet.create({
    booksSeedsMainContainer: {
        backgroundColor: "#F2F6F9",
        flex: 1,
        width: "100%"
    },
    headerMainContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
        height: 80
    },
    headerContentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // width: "62%",
        // paddingLeft:20
    },
    backArrowImg: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    bookSeedsText: {
        fontSize: RFValue(16, height),
        alignSelf: "center",
        // lineHeight: 30
    },
    flowerImg: {
        position: "absolute",
        top: 30,
        right: 20,
        height: 50,
        width: 100,
        tintColor: "#000",
        resizeMode: "contain"
    },

    contentMainContainer: {
        padding: 20
    },

    textFieldsMainContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 20,
        marginBottom: 15,
        paddingBottom: 20,
        maxHeight: height * 0.8
    },
    textInputContainer: {
        borderColor: "#D6D6D6",
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 55,
        marginTop: 15,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10
    },

    searchImg: {
        height: 20,
        width: 20,
        tintColor: "#000",
        resizeMode: "contain",
    },

    searchFieldMainContainer: {
        paddingLeft: 15,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ED323712",
        borderRadius: 10,
        marginVertical: 15
    },

    searchInputContainer: {
        paddingLeft: 20,
        width: "90%",
        fontSize: RFValue(14, height),
        color: "#00000066"
    },

    contentHistoryMainContainer: {
        borderWidth: 1,
        paddingLeft: 20,
        borderColor: "#D6D6D6",
        borderRadius: 10,
        paddingTop: 15,
        paddingBottom: 10,
        marginBottom: 10
    },

    labelsHistoryContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 3
    },

    labelHistoryText: {
        width: 130,
        fontSize: RFValue(14, height),
        color: "#000000",
        lineHeight: 18
    },

    labelValuesHistory: {
        fontSize: RFValue(14, height),
        color: "#000000",
        lineHeight: 18,
        width: 130
    },

    noBookingHistoryText: {
        textAlign: "center",
        marginTop: 20, color: "#000",
        fontSize: 15
    }


})