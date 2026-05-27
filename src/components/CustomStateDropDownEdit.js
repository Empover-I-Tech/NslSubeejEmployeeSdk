import {
    Text, View, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback,
    FlatList
} from "react-native"


const CustomStateDropDown = ({validationsBorder,valueHandle ,name, data, label, inputValue, handleDropDown, dropDownVisible, closeDropDown }) => {

    const renderList = (item) => {
        return (
            <TouchableOpacity onPress={()=>valueHandle(item.item.name,item.item.id)}  style={RnStyles.labelContainer}>
            <Text style={RnStyles.labeTextContainer}>{item.item.name}</Text>
        </TouchableOpacity>
        )
    }
      
    return (
        <TouchableOpacity disabled={true} onPress={()=>handleDropDown(true)}>
            <Text style={RnStyles.labelText}>{label}</Text>
            <View style={[RnStyles.textInputContainer,{borderColor:validationsBorder?"#ED3237":"#D6D6D6"}]}>
                <Text style={RnStyles.selectCropTextInput}>{inputValue}</Text>
                <TouchableOpacity disabled={true} onPress={()=>handleDropDown(true)}>
                    <Image source={require('../../assets/Images/dropDownIcon.png')} style={RnStyles.dropDownIcon} />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={dropDownVisible}
            >
                <TouchableWithoutFeedback onPress={closeDropDown}>
                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer}>
                            <FlatList ListEmptyComponent={()=><Text style={RnStyles.noDataText}>No Data</Text>} data={data} renderItem={renderList} />
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
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 18,
        marginTop: 20
    },

    textInputContainer: {
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

    selectCropTextInput: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 16,
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
        fontWeight:"500"
    },

    noDataText:{
        color:"#000",
        fontSize:16,
        fontWeight:"600",
        alignSelf:"center",marginTop:40
    }
})