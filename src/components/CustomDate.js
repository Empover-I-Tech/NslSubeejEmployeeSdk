import { Text, View, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback,Dimensions } from "react-native"
import { useState } from "react"
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from 'react-redux';
import { RFValue } from "react-native-responsive-fontsize";
import { useFontStyles } from "../hooks/useFontStyles";
const {height}=Dimensions.get("window")


const CustomDate = ({ closeDate, validationBorder, label, inputValue, handleModal, onSelectDate, visible }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const fonts=useFontStyles()
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const today = new Date().toISOString().split("T")[0];
    return (
        <TouchableOpacity onPress={handleModal}>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}<Text style={{color:"red"}}> *</Text></Text>
            <View style={[RnStyles.textInputContainer, { borderColor: validationBorder ? "#ED3237" : "#D6D6D6", }]}>
                <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValue}</Text>
                <TouchableOpacity onPress={handleModal}>
                    <Image source={require('../../assets/Images/calendarIcon.png')} style={[RnStyles.dropDownIcon, { tintColor: dynamicStyles.primaryColor }]} />
                </TouchableOpacity>
            </View>
            <Modal visible={visible} transparent animationType="slide">
                <TouchableWithoutFeedback>

                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer}>
                            <TouchableOpacity onPress={closeDate} style={{ position: "absolute", right: -8, top:-10, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                            </TouchableOpacity>
                            <Calendar
                                              theme={{
                    textDayFontFamily:fonts.Regular,     // Font for days
                    textMonthFontFamily:fonts.Bold,      // Font for month title
                    textDayHeaderFontFamily:fonts.Regular, // Font for week day labels (e.g., Mon, Tue)

                    // Optional: size and color overrides
                  
                  }}
                                minDate={today}
                                onDayPress={(day) => onSelectDate(day.dateString)}
                                markedDates={
                                    selectedDate ? { [selectedDate]: { selected: true, marked: true, selectedColor: "#ED3237" } } : {}
                                }
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </TouchableOpacity>
    )
}

export default CustomDate

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

    selectCropTextInput: {
        fontSize:RFValue(14,height),
        lineHeight: 30,
        width: "90%",
        paddingLeft: 10,
        color: "#00000080"
    },

    dropDownIcon: {
        height: 20,
        width: 20,
        resizeMode: "contain"
    },

    modalMainContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },

    modalSubContainer: {
        width: 320,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center"
    }
})