import { Text,View,TextInput,StyleSheet,Dimensions} from "react-native" 
import { RFValue } from "react-native-responsive-fontsize"
import { useFontStyles } from "../hooks/useFontStyles"
const {height}=Dimensions.get("window")



const CustomTextInput = ({validationBorder,keyBoard,label,placeHolderValue,inputValue,handleValue}) => {
    const fonts=useFontStyles()

    return (
        <View>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{label}<Text style={{color:"red"}}> *</Text></Text>
            <View style={[RnStyles.textInputContainer,{borderColor:validationBorder?"#ED3237":"#D6D6D6",}]}>
                <TextInput
                value={inputValue}
                onChangeText={handleValue}
                placeholder={placeHolderValue}
                style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}
                keyboardType="decimal-pad"
                placeHolderValue="#00000080"
                maxLength={5}
                placeholderTextColor={"#00000080"}
                />
            </View>
        </View>
    )
}

export default CustomTextInput

const RnStyles = StyleSheet.create({
    labelText:{
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
        lineHeight: 18,
        marginTop: 20
    },

    textInputContainer:{
        backgroundColor:"#FBFBFB",
        borderWidth:1,
        height:55,
        // marginTop:10,
        borderRadius:8,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingRight:10
    },

    selectCropTextInput:{
        fontSize:RFValue(14,height),        
        lineHeight:16,
        width:"90%",
        paddingLeft:10,
        color:"#00000080"
    },
})