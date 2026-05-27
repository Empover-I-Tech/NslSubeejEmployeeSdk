import { Text,View,TouchableOpacity,StyleSheet,Image,Modal, Dimensions} from "react-native" 
import {useState} from "react"
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from 'react-redux';
import { RFValue } from "react-native-responsive-fontsize";
import { translate } from "../Localization/Localisation";
import { useFontStyles } from "../hooks/useFontStyles";
const {height}=Dimensions.get("window")


const CustomImagePicker = ({validation,label,inputValue,handleModal,onSelectDate,visible }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const fonts=useFontStyles()

    return (
        <TouchableOpacity onPress={handleModal}>
            <Text style={[RnStyles.labelText,{fontFamily:fonts.SemiBold}]}>{translate("Upload_Selfie_and_win_bonus_points")}<Text style={{fontFamily:fonts.Bold,color:"#000"}}> {translate("50")} </Text>{translate("bonus_points")}<Text style={{color:"red"}}> *</Text></Text>
            <View style={[RnStyles.textInputContainer,{borderColor:validation?"red":"#D6D6D6"}]}>
                <Text style={[RnStyles.selectCropTextInput,{fontFamily:fonts.Regular}]}>{inputValue}</Text>
                <TouchableOpacity onPress={handleModal}>
                    <Image source={require('../../assets/Images/camIcon.png')} style={[RnStyles.dropDownIcon,{tintColor:dynamicStyles.primaryColor}]} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

export default CustomImagePicker

const RnStyles = StyleSheet.create({
    labelText:{
        color: "#5D5D5D",
        fontSize:RFValue(14,height),
        lineHeight: 18,
        marginTop: 20
    },

    textInputContainer:{
        // borderColor:"#D6D6D6",
        backgroundColor:"#FBFBFB",
        borderWidth:1,
        height:55,
        // marginTop:15,
        borderRadius:8,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingRight:10
    },

    selectCropTextInput:{
        fontSize:14,
        // lineHeight:16,
        width:"90%",
        paddingLeft:10,
        color:"#8F8F8F"
    },

    dropDownIcon:{
        height: 20, 
        width: 20, 
        resizeMode: "contain"
    },

    modalMainContainer:{
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