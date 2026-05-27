import {
    Text, 
    View, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    Modal, 
    TouchableWithoutFeedback,
    FlatList,
    Dimensions
} from "react-native"
import { RFValue } from "react-native-responsive-fontsize";
import { useFontStyles } from "../hooks/useFontStyles";
const { width, height } = Dimensions.get('window');

const CustomMeetingDropDown = ({validations ,dropVisibleValue, listLabels, valueHandle, name, data, label, inputValue, handleDropDown, dropDownVisible, closeDropDown }) => {
    const fonts=useFontStyles()
    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}<Text style={{color:"red"}}> *</Text></Text>
            <TouchableOpacity onPress={handleDropDown} style={[RnStyles.textInputContainer,{borderColor:validations?"red":"#D6D6D6"}]}>
                <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValue}</Text>
                <TouchableOpacity  onPress={handleDropDown}>
                    <Image source={require('../../assets/Images/dropDownIcon.png')} style={RnStyles.dropDownIcon} />
                </TouchableOpacity>
            </TouchableOpacity>
           

            {/* <Modal
                animationType="slide"
                transparent={true}
                visible={dropDownVisible}
            >
                <TouchableWithoutFeedback onPress={closeDropDown}>
                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer}>
                            <FlatList data={data} renderItem={renderList} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal> */}
        </View>
    )
}

export default CustomMeetingDropDown

const RnStyles = StyleSheet.create({
    labelText: {
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
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

    textInputContainer1: {
        borderColor: "#D6D6D6",
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 55,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10
    },

    selectCropTextInput: {
        fontSize:RFValue(12,680),
        // lineHeight: 16,
        width: "90%",
        paddingLeft: 10,
        color: "#000"
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
        fontSize:RFValue(14,680),
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

    labelContainer: {
        marginVertical: 15
    },
})