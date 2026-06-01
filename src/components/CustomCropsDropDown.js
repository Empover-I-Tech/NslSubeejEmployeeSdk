import { FlatList,Modal, TouchableWithoutFeedback, Image, Text, View, TextInput, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { translate } from "../Localization/Localisation"
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
const {height}=Dimensions.get("window")



const CustomCropsDropDown = ({closeModalHandle,cropListValidation,primaryColor,secondaryColor,validationContentAcres,validationEnterAcres,handleAcrAddingListItems,closeIconCropAcres,acrsValue,handleAcrValue,cropNameSelected,cropNameModalOpen,selectedCropNameHandlCustom,listCropsDropDown, openDropModalValue, openDropModalHandle, validationBorder, keyBoard, label, placeHolderValue, inputValue, handleValue }) => {
    const fonts=useFontStyles()

    const renderList = (item) => {
        return (
            <TouchableOpacity onPress={()=>selectedCropNameHandlCustom(item.item.name)} style={RnStyles.labelContainer}>
                <Text style={[RnStyles.labeTextContainer,{fontFamily:fonts.SemiBold}]}>{item.item.name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}</Text>
            <TouchableOpacity onPress={() => openDropModalHandle(true)} style={[RnStyles.textInputContainer, { borderColor: validationBorder ? "#ED3237" : "#D6D6D6", }]}>
                <TextInput
                    editable={false}
                    value={inputValue}
                    onChangeText={handleValue}
                    placeholder={placeHolderValue}
                    style={[RnStyles.selectCropTextInput,{fontFamily:fonts.SemiBold}]}
                    keyboardType="default"
                    maxLength={25}
                    placeholderTextColor={"#00000080"}
                />
                <TouchableOpacity activeOpacity={10} onPress={() => openDropModalHandle(true)} style={RnStyles.addCropContainer}>
                    <View style={[RnStyles.plusContainer,{backgroundColor:primaryColor}]}>
                        <Image style={[RnStyles.addIcon,{tintColor:secondaryColor}]} source={require("../../assets/Images/plusIconImg.png")} />
                    </View>
                    <Text style={[RnStyles.addCropText,{color:primaryColor,fontFamily:fonts.Regular}]}>{translate("Add_Crop")}</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={openDropModalValue}
            >
                <TouchableWithoutFeedback onPress={() => closeModalHandle(false)}>
                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer}>
                            <FlatList data={listCropsDropDown} renderItem={renderList} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={cropNameModalOpen}
            >
                <TouchableWithoutFeedback>
                    <View
                        style={RnStyles.cropSubmitModalContainer}
                    >
                        <View style={RnStyles.cropSubmitSubModalContainer}>
                            <View style={RnStyles.modalCropHeaderContainer}>
                                <Text style={[RnStyles.cropLabelText,{fontFamily:fonts.SemiBold}]}>{cropNameSelected}</Text>
                                <TouchableOpacity onPress={closeIconCropAcres} style={RnStyles.crossIconContainer}>
                                    <Image source={require("../../assets/Images/crossIcon.png")} style={RnStyles.crossCancelIcon} />
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={[RnStyles.enterAcrsText,{fontFamily:fonts.SemiBold}]}>{translate("Enter_Acres")}</Text>
                                <TextInput placeholderTextColor={"#00000080"} keyboardType="decimal-pad" maxLength={5} value={acrsValue} onChangeText={handleAcrValue} placeholder={translate("Enter_Acres")} style={[RnStyles.acrsTextInput,{borderColor:validationEnterAcres?"red":"#D6D6D6",fontFamily:fonts.Regular}]} />
                            </View>
                            {validationEnterAcres&&<Text style={[RnStyles.firstNameValidationText,{fontFamily:fonts.Regular}]}>{validationContentAcres}</Text>}
                            <TouchableOpacity onPress={()=>handleAcrAddingListItems({cropsItemDetails:`${cropNameSelected}:${acrsValue}`})} style={[RnStyles.submitBtnContainer,{backgroundColor:primaryColor}]}>
                                <Text style={[RnStyles.submitText,{color:secondaryColor,fontFamily:fonts.SemiBold}]}>{translate("submit")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default CustomCropsDropDown

const RnStyles = StyleSheet.create({
    labelText: {
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
        lineHeight:25,
        marginTop:5
    },

    textInputContainer: {
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 55,
        // marginTop: 15,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10,
        marginBottom: 3
    },

    selectCropTextInput: {
        fontSize:RFValue(14,height),
        lineHeight: 16,
        width: "60%",
        paddingLeft: 10,
        color:"#00000080"
    },

    plusContainer: {
        height: 15, width: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40
    },

    addIcon: {
        resizeMode: "contain",
        height: 10,
        width: 10
    },

    modalMainContainer: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end"
    },

    modalSubContainer: {
        backgroundColor: "#fff",
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 5,
        width: "100%",
        height: "70%"
    },

    labelContainer: {
        marginVertical: 15
    },

    labeTextContainer: {
        color: "#000",
        fontSize: 16,
    },

    addCropContainer: {
        paddingRight: 5,
        flexDirection: "row",
        alignItems: "center"
    },

    addCropText: {
        color: "#ED3237",
        fontSize:RFValue(14,height),
        marginLeft: 5,
        lineHeight:25
    },

    cropSubmitModalContainer: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },

    cropSubmitSubModalContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 15,
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
    },

    modalCropHeaderContainer: {
        flexDirection: "row",
        // justifyContent: "flex-end",
        // width: "70%",
        // justifyContent: "space-between",
        // alignSelf: "flex-end"
        alignItems:"center",
        justifyContent:"center"
    },

    cropLabelText: {
        color: "#5D5D5D",
        fontSize:RFValue(18,height),
    },

    crossCancelIcon: {
        height: 15,
        width: 15
    },

    enterAcrsText: {
        color: "#5D5D5D",
        fontSize: RFValue(14,height),
        marginTop: 20,
        marginBottom: 15,
        lineHeight:25
    },

    acrsTextInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft:10,
        color:"#00000080",
        fontSize:RFValue(14,height),
        lineHeight:25,
        height:45
    },

    submitBtnContainer: {
        marginTop: 25,
        borderRadius: 10,
        marginVertical: 10,
        height: 50,
        alignItems: "center",
        justifyContent: "center"
    },

    submitText: {
        fontSize:RFValue(14,height),
        lineHeight: 32,
    },

    crossIconContainer:{
        position:"absolute",
        right:10
    },

    firstNameValidationText: {
        color: "#ED3237",
        fontSize:RFValue(14,height),
        lineHeight:25
    },


})