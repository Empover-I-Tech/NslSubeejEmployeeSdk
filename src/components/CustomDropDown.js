import {
    Text, View, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback,
    FlatList,
    Dimensions
} from "react-native"
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
import { translate } from "../Localization/Localisation"
const {height}=Dimensions.get("window")


const CustomDropDown = ({validationsBorder,valueHandle ,name, data, label, inputValue, handleDropDown, dropDownVisible, closeDropDown }) => {
    const fonts=useFontStyles()
    const renderList = (item) => {
        return (
            <TouchableOpacity onPress={()=>valueHandle(item.item.name,item.item.hybridList)} style={RnStyles.labelContainer}>
            <Text style={[RnStyles.labeTextContainer,{fontFamily:fonts.SemiBold}]}>{item.item.name}</Text>
        </TouchableOpacity> 
            // <>

            //     {name === "cropsList" ?
            //         <TouchableOpacity onPress={()=>valueHandle(item.item.name)} style={RnStyles.labelContainer}>
            //             <Text style={RnStyles.labeTextContainer}>{item.item.name}</Text>
            //         </TouchableOpacity> :
            //         <TouchableOpacity onPress={()=>valueHandle(item.item.productName)} style={RnStyles.labelContainer}>
            //             <Text style={RnStyles.labeTextContainer}>{item?.item?.name}</Text>
            //         </TouchableOpacity>
            //     }

            // </>
        )
    }

    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}<Text style={{color:"red"}}> *</Text></Text>
            <TouchableOpacity onPress={handleDropDown} style={[RnStyles.textInputContainer,{borderColor:validationsBorder?"#ED3237":"#D6D6D6"}]}>
                <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValue}</Text>
                <TouchableOpacity onPress={handleDropDown}>
                    <Image source={require('../../assets/Images/dropDownIcon.png')} style={RnStyles.dropDownIcon} />
                </TouchableOpacity>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={dropDownVisible}
            >
                <TouchableWithoutFeedback onPress={closeDropDown}>
                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer}>
                            <FlatList ListEmptyComponent={()=><Text style={{color:"#000",fontSize:15,fontFamily:fonts.SemiBold,alignSelf:"center",marginBottom:20}}>{translate("No_data_available")}</Text>} data={data} renderItem={renderList} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default CustomDropDown

const RnStyles = StyleSheet.create({
    labelText: {
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
        fontWeight: "500",
        lineHeight: 18,
        marginTop: 20
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
        paddingRight: 10
    },

    selectCropTextInput: {
        fontSize:RFValue(14,height),
        // lineHeight: 16,
        width: "90%",
        paddingLeft: 10,
        color:"#00000080"
    },

    dropDownIcon: {
        height: 20,
        width: 20,
        tintColor: "#000",
        resizeMode: "contain"
    },

    bookNowButtonContainer: {
        width: "100%",
        height: 50,
        backgroundColor: "#ED3237",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },

    bookNowButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
        lineHeight: 20
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

    labelContainer:{
        marginVertical:15
    },

    labeTextContainer:{
        color:"#000",
        fontSize:16,
    }
})