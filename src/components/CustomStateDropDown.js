import {
    Text, View, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback,
    FlatList,
    TextInput,
    Pressable,
    Dimensions
} from "react-native"
import { translate } from "../Localization/Localisation"
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
const {height}=Dimensions.get("window")


const CustomStateDropDown = ({validationsBorder,valueHandle ,name, data, label, inputValue, handleDropDown, dropDownVisible, closeDropDown,searchFilterHandle, searchStateValue}) => {
    const fonts=useFontStyles()

    const renderList = (item) => {
        return (
            <Pressable onPress={()=>valueHandle(item.item.name,item.item.id)}  style={RnStyles.labelContainer}>
            <Text style={[RnStyles.labeTextContainer,{fontFamily:fonts.SemiBold}]}>{item.item.name}</Text>
        </Pressable>
        )
    }
      
    return (
        <TouchableOpacity onPress={()=>handleDropDown(true)}>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}</Text>
            <View style={[RnStyles.textInputContainer,{borderColor:validationsBorder?"#ED3237":"#D6D6D6"}]}>
                <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValue}</Text>
                <TouchableOpacity onPress={()=>handleDropDown(true)}>
                    <Image source={require('../../assets/Images/dropDownIcon.png')} style={RnStyles.dropDownIcon} />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={dropDownVisible}
            >
                <TouchableWithoutFeedback >
                    <View style={RnStyles.modalMainContainer}>
                     
                        <View style={RnStyles.modalSubContainer}>
                            <TouchableOpacity onPress={closeDropDown}>
                                <Image source={require('../../assets/Images/crossIcon.png')} style={{
                                    height: 15,
                                    width: 15,
                                    resizeMode: "contain", alignSelf: "flex-end",marginVertical:10
                                }} />
                            </TouchableOpacity>
                            <TextInput placeholderTextColor={"#D6D6D6"} onChangeText={searchFilterHandle} value={searchStateValue} placeholder={translate("Search")} style={{color:"#000",borderWidth:1,height:45,borderRadius:10,marginVertical:10,paddingHorizontal:5,borderColor:"#D6D6D6",width:"95%",alignSelf:"center",paddingHorizontal:15,fontFamily:fonts.Regular}}/>
                            <FlatList ListEmptyComponent={()=><Text style={[RnStyles.noDataText,{fontFamily:fonts.SemiBold}]}>{translate("No_Items_Available")}</Text>} data={data} renderItem={renderList} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </TouchableOpacity>
    )
}

export default CustomStateDropDown

const RnStyles = StyleSheet.create({
    labelText: {
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
        lineHeight:25,
        marginTop:10
        // marginTop: 20
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
        fontSize:RFValue(14,height),
        color:"#D6D6D6"
    },

    selectCropTextInput: {
        fontSize:RFValue(14,height),
        lineHeight:30,
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
        fontSize: RFValue(14,height),
        lineHeight: 25
    },

    modalMainContainer: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
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
        width: "90%",
        height: "70%"
    },

    labelContainer:{
        marginVertical:15
    },

    labeTextContainer:{
        color:"#000",
        fontSize:RFValue(14,height),
        lineHeight:25
    },

    noDataText:{
        color:"#000",
        fontSize:RFValue(16,height),
        alignSelf:"center",marginTop:40,
        lineHeight:25
    }
})