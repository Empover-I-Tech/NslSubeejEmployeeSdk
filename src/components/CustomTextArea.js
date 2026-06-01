import { Text,View,TextInput,StyleSheet, Pressable,Dimensions} from "react-native" 
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
const {height}=Dimensions.get("window")


const CustomTextArea = ({keyBoard,label,placeHolderValue,inputValue,handleValue}) => {
    const fonts=useFontStyles()

    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}</Text>
            <Pressable style={RnStyles.textInputContainer}>
                <TextInput
                value={inputValue}
                onChangeText={handleValue}
                placeholder={placeHolderValue}
                multiline
                style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}
                placeholderTextColor={"#00000080"}
                // keyboardType="decimal-pad"
                />
            </Pressable>
        </View>
    )
}

export default CustomTextArea

const RnStyles = StyleSheet.create({
    labelText:{
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
        lineHeight: 18,
        marginTop: 20
    },

    textInputContainer:{
        borderColor:"#D6D6D6",
        backgroundColor:"#FBFBFB",
        borderWidth:1,
        height:100,
        marginTop:15,
        borderRadius:8,
        justifyContent:"flex-start",
        alignItems:"flex-start"

    },

    selectCropTextInput:{
        fontSize:14,
        width:"100%",
        paddingLeft:10,
        color: "#000"
        // height:"100%",
    },
})