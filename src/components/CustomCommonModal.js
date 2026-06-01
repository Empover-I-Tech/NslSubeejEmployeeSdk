import { Text, View, TouchableOpacity, StyleSheet, Dimensions, Modal, TouchableWithoutFeedback, Image } from "react-native"
import { RFValue } from "react-native-responsive-fontsize"
import { useSelector } from "react-redux";
import { translate } from "../Localization/Localisation";
import { useFontStyles } from "../hooks/useFontStyles";
const { height } = Dimensions.get("window")


export const CustomCommonModal = ({ modalVisible, modalClose, ErrorText, ButtonText, ButtonFun, headerText, secondButton, secondButtonText }) => {
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const fonts=useFontStyles()

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
        >
            <TouchableWithoutFeedback>
                <View style={RnStyles.modalMainContainer}>
                    <View style={RnStyles.modalSubContainer}>
                        {modalClose != undefined &&
                            <TouchableOpacity onPress={() => modalClose()} style={RnStyles.crossIconContainer}>
                                <Image source={require('../../assets/Images/crossIcon.png')} style={RnStyles.crossIcon} />
                            </TouchableOpacity>}
                        {/* <Image source={require('../../assets/Images/successIconMssg.png')} style={RnStyles.successIcon} /> */}
                        <View style={RnStyles.textContainer}>
                            <Text style={[RnStyles.successText,{fontFamily:fonts.Bold}]}>{ErrorText}</Text>
                            {/* <Text style={{color:"#000", fontWeight:"500", fontSize:RFValue(9,680),}}>{"sai"}</Text>
                        <Text style={{color:"#000", fontWeight:"500", fontSize:RFValue(9,680),}}>{"sai"}</Text> */}
                        </View>
                        {/* <Text style={[RnStyles.bookNowButtonText, { color:"red" ,borderWidth:1}]}>{ButtonText}</Text> */}


                        <TouchableOpacity onPress={ButtonFun} style={[RnStyles.bookNowButtonContainer, { backgroundColor: dynamicStyles?.primaryColor ? dynamicStyles.primaryColor : "#845EF1" }]}>
                            <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles?.secondaryColor ? dynamicStyles?.secondaryColor : "#fff",fontFamily:fonts.SemiBold }]}>{ButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

    )
}

export const CustomCommonModalTwo = ({ modalVisible, modalClose, ErrorText, ButtonText, ButtonFun, headerText, secondButton, secondButtonText, buttonVisible }) => {
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const fonts=useFontStyles()

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
        >
            <TouchableWithoutFeedback>
                <View style={RnStyles.modalMainContainer}>
                    <View style={RnStyles.modalSubContainer1}>
                        {/* <TouchableOpacity onPress={()=>modalClose()} style={RnStyles.crossIconContainer}>
                        <Image source={require('../../assets/Images/crossIcon.png')} style={RnStyles.crossIcon} />
                    </TouchableOpacity> */}
                        {/* <Image source={require('../../assets/Images/successIconMssg.png')} style={RnStyles.successIcon} /> */}
                        <View style={RnStyles.textContainer}>
                            <Text style={[RnStyles.successText1,{fontFamily:fonts.Bold}]}>{headerText}</Text>

                            <Text style={[RnStyles.successText2,{fontFamily:fonts.SemiBold}]}>{ErrorText}</Text>
                            {/* <Text style={{color:"#000", fontWeight:"500", fontSize:RFValue(9,680),}}>{"sai"}</Text>
                        <Text style={{color:"#000", fontWeight:"500", fontSize:RFValue(9,680),}}>{"sai"}</Text> */}
                        </View>
                        {buttonVisible ?
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <TouchableOpacity onPress={ButtonFun} style={[RnStyles.bookNowButtonContainer3, { backgroundColor: dynamicStyles?.secondaryColor ? dynamicStyles?.secondaryColor : "845EF1", borderWidth: 1, borderColor: dynamicStyles.primaryColor ? dynamicStyles.primaryColor : "#845EF1" }]}>
                                    <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.primaryColor ? dynamicStyles.primaryColor : "#000",fontFamily:fonts.SemiBold }]}>{ButtonText}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={secondButton} style={[RnStyles.bookNowButtonContainer2, { backgroundColor: dynamicStyles?.primaryColor ? dynamicStyles?.primaryColor : "#845EF1" }]}>
                                    <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor ? dynamicStyles.secondaryColor : "#fff",fontFamily:fonts.SemiBold }]}>{secondButtonText}</Text>
                                </TouchableOpacity>
                            </View> :
                            <TouchableOpacity onPress={secondButton} style={[RnStyles.bookNowButtonContainer2, { backgroundColor: dynamicStyles?.primaryColor ? dynamicStyles?.primaryColor : "#845EF1" }]}>
                                <Text style={[RnStyles.bookNowButtonText, { color: dynamicStyles.secondaryColor ? dynamicStyles.secondaryColor : "#fff",fontFamily:fonts.SemiBold }]}>{secondButtonText}</Text>
                            </TouchableOpacity>
                        }



                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

    )
}


// export default CustomCommonModal

const RnStyles = StyleSheet.create({

    bookNowButtonContainer: {
        width: "100%",
        height: 50,
        // alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        // marginTop:10
    },

    bookNowButtonContainer2: {
        width: "45%",
        height: 50,
        // alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 10,
        alignSelf: "center"
    },

    bookNowButtonContainer3: {
        width: "45%",
        height: 50,
        // alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 10,
    },

    bookNowButtonText: {
        fontSize: RFValue(14, height),
        lineHeight: 35,
        width: "100%",
        // alignSelf:"center",
        includeFontPadding: false,
        textAlignVertical: 'top',
        textAlign: 'center',
    },


    modalMainContainer: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20
    },
    modalSubContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingTop: 15,
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
        minHeight: "5%",
        paddingBottom: 10
    },

    modalSubContainer1: {
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingTop: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 5,
        width: "95%",
        minHeight: "5%",
        paddingBottom: 10
    },

    crossIconContainer: {
        alignItems: "flex-end"
    },

    crossIcon: {
        height: 15,
        width: 15,
        resizeMode: "contain"
    },

    successIcon: {
        height: 50,
        width: 50,
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 20
    },

    textContainer: {
        alignItems: "center"
    },

    successText: {
        color: "#000",
        fontSize: RFValue(14, height),
        marginTop: 10,
        marginBottom: 5,
        lineHeight: 20

    },

    successText1: {
        color: "#000",
        fontSize: RFValue(16, height),
        marginTop: 10,
        marginBottom: 5
    },

    successText2: {
        color: "#000",
        fontSize: RFValue(15, height),
        marginTop: 10,
        marginBottom: 5,
        textAlign: "center"
    },

    successMainContainerText: {
        marginBottom: 10,
        alignItems: "center"
    },

    successSubText: {
        color: "#7A7A7A",
        fontWeight: "500",
        fontSize: RFValue(13, height),
        marginVertical: 10
    }
})