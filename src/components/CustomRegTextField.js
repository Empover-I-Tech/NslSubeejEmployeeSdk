import { Text, View, TextInput, StyleSheet, Dimensions } from "react-native"
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
const { width, height } = Dimensions.get("window")



const CustomRegTextField = ({ validationBorder, keyBoard, label, placeHolderValue, inputValue, handleValue, mandatory }) => {
    const fonts=useFontStyles()

    return (
        <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}{mandatory && <Text style={{ color: "red" }}> *</Text>}</Text>
            <View style={[RnStyles.textInputContainer, { borderColor: validationBorder ? "#ED3237" : "#D6D6D6", }]}>
                <TextInput
                    value={inputValue}
                    onChangeText={handleValue}
                    placeholder={placeHolderValue}
                    style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}
                    keyboardType="default"
                    maxLength={25}
                    placeholderTextColor={"#00000080"}
                />
            </View>
        </View>
    )
}

export default CustomRegTextField

const RnStyles = StyleSheet.create({
    labelText: {
        color: "#5D5D5D",
        fontSize: RFValue(14, height),
        lineHeight: 25,
    },

    textInputContainer: {
        backgroundColor: "#FBFBFB",
        borderWidth: 1,
        height: 55,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10,
        marginBottom: 3,
        color: "#00000080"
    },

    selectCropTextInput: {
        fontSize: RFValue(14, height),
        lineHeight: 25,
        width: "90%",
        paddingLeft: 10,
        color: "#00000080"
    },
})