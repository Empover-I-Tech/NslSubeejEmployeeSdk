import { Text, View, TouchableOpacity, StyleSheet,Dimensions,Image, Modal, TouchableWithoutFeedback } from "react-native"
import { useState } from "react"
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from 'react-redux';
import { RFValue } from "react-native-responsive-fontsize";
import DatePicker from 'react-native-date-picker';
import moment from "moment";
import { useFontStyles } from "../hooks/useFontStyles";
const { width, height } = Dimensions.get("window")


const CustomDateFarmerMeet = ({ closeDate, validationBorder, label, inputValue, handleModal, onSelectDate, visible,
         labelTim,validationBorderTime,inputValueTime,visibleTime,handleModalTime,onSelectDatTimee,closeDateTime
 }) => {
    const [selectedDate, setSelectedDate] = useState(null);

    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const today = new Date().toISOString().split("T")[0];
    const fonts=useFontStyles()

    // Generate time slots (5-minute intervals)
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const time = moment().set({ hour, minute, second: 0, millisecond: 0 });
      const isToday = inputValue === today;
      timeSlots.push({
        time: time.format('HH:mm:ss'),
        display: time.format('hh:mm A'),
        disabled: isToday && time.isBefore(currentTime),
      });
    }
  }

  const handleTimeSelect = (item) => {
    if (!item.disabled) {
      onSelectDatTimee(item.time);
      closeDateTime();
    }
  };

    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}<Text style={{color:"red"}}> *</Text></Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={handleModal} style={[RnStyles.textInputContainer, { borderColor: validationBorder ? "#ED3237" : "#D6D6D6", }]}>
                    <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValue}</Text>
                    {/* <TouchableOpacity onPress={handleModal}> */}
                        <Image source={require('../../assets/Images/calendarIcon.png')} style={[RnStyles.dropDownIcon, { tintColor: dynamicStyles.primaryColor }]} />
                    {/* </TouchableOpacity> */}
                </TouchableOpacity>
                {/* <View style={[RnStyles.textInputContainer, { borderColor: validationBorder ? "#ED3237" : "#D6D6D6", }]}>
                    <Text style={RnStyles.selectCropTextInput}>{inputValue}</Text>
                    <TouchableOpacity onPress={handleModal}>
                        <Image source={require('../../assets/Images/calendarIcon.png')} style={[RnStyles.dropDownIcon, { tintColor: dynamicStyles.primaryColor }]} />
                    </TouchableOpacity>
                </View> */}


                {/* <Text style={RnStyles.labelText}>{label}<Text style={{ color: "red" }}> *</Text></Text> */}
                <TouchableOpacity onPress={handleModalTime} style={[RnStyles.textInputContainer, { borderColor: validationBorderTime ? "#ED3237" : "#D6D6D6", }]}>
                    <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValueTime}</Text>
                    {/* <TouchableOpacity onPress={handleModalTime}> */}
                        <Image source={require('../../assets/Images/timeIcon.png')} style={[RnStyles.dropDownIcon, { tintColor: dynamicStyles.primaryColor }]} />
                    {/* </TouchableOpacity> */}
                </TouchableOpacity>
            </View>

            <Modal visible={visible} transparent animationType="slide">
                <TouchableWithoutFeedback>

                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer}>
                            <TouchableOpacity onPress={closeDate} style={{ position: "absolute", right: -8, top: -10, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                            </TouchableOpacity>
                            <Calendar
                                theme={{
                                    textDayFontFamily: fonts.Regular,     // Font for days
                                    textMonthFontFamily: fonts.Bold,      // Font for month title
                                    textDayHeaderFontFamily: fonts.Regular, // Font for week day labels (e.g., Mon, Tue)

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


            {/* <Modal visible={isTimeVisible} transparent animationType="slide">
                <TouchableWithoutFeedback>

                    <View style={RnStyles.modalMainContainer}>
                        <View style={RnStyles.modalSubContainer1}>
                            <TouchableOpacity onPress={closeTimeModal} style={{ position: "absolute", right: -8, top: -10, borderRadius: 40, height: 25, width: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
                                <Image source={require("../../assets/Images/crossIcon.png")} style={{ height: 10, width: 10, resizeMode: "contain", tintColor: "#fff" }} />
                            </TouchableOpacity>
                            <View style={{ alignItems: "center" }}>
                                <DatePicker
                                    // date={tempTime}
                                    date={tempTime || new Date()}
                                    mode="time"
                                    is24Hour={true}
                                    // minimumDate={new Date()}
                                    onDateChange={setTempTime}
                                    maximumDate={selectedDate === today ? currentTime : undefined}

                                // date={tempTime}
                                // mode="time"
                                // is24Hour={false}
                                // maximumDate={selectedDate === today ? new Date() : undefined} // Disable future time if today is selected
                                // onDateChange={setTempTime}

                                />

                            </View>

                            <TouchableOpacity style={{
                                marginTop: 20, backgroundColor: dynamicStyles.primaryColor, justifyContent: "center", alignItems: "center",
                                height: height * 0.05, borderRadius: 10
                            }} onPress={() => {
                                setSelectedTime(tempTime);
                                setTimeVisible(false);
                                setSelectTimeValidation(false)
                            }}>
                                <Text style={{ color: dynamicStyles.secondaryColor, fontSize: RFValue(16, height), fontWeight: "600" }}>{translate("Set_Time")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal> */}
        </View>
    )
}

export default CustomDateFarmerMeet

const RnStyles = StyleSheet.create({
    labelText: {
        color: "#5D5D5D",
        fontSize: RFValue(14, height),
        marginVertical:8
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
        width:"48%"
    },

    selectCropTextInput: {
        fontSize: 14,
        // lineHeight: 16,
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
        alignItems: "center",
        height:400
    }
})