import { Text,View,TextInput,StyleSheet, Dimensions} from "react-native" 
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
const {height}=Dimensions.get("window")



const CustomAddressTextInput = ({validationBorder,keyBoard,label,placeHolderValue,inputValue,handleValue,editable}) => {
    const fonts=useFontStyles()

    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}</Text>
            <View style={[RnStyles.textInputContainer,{borderColor:validationBorder?"#ED3237":"#D6D6D6",}]}>
                <TextInput
                value={inputValue}
                onChangeText={handleValue}
                placeholder={placeHolderValue}
                style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}
                keyboardType="default"
                placeholderTextColor={"#00000080"}
                editable={editable}
                multiline
                />
            </View>
        </View>
    )
}

export default CustomAddressTextInput

const RnStyles = StyleSheet.create({
    labelText:{
    color: "#5D5D5D",
    fontSize: RFValue(14, height),
    lineHeight: 25,
    marginTop:10
    },

    textInputContainer:{
        backgroundColor:"#FBFBFB",
        borderWidth:1,
        // height:55,
        minHeight: 55,
        paddingVertical: 5,
        // marginTop:10,
        borderRadius:8,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        fontSize:RFValue(13,height),
        color:"#00000080",
        paddingRight:8
    },

    selectCropTextInput:{
        fontSize:RFValue(14,height),
        lineHeight:25,
        width:"90%",
        paddingLeft:10,
        color:"#00000080",
        flex:1
        // height:50
    },
})