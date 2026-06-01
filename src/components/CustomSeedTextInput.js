import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { View, Text, TextInput, Platform,StyleSheet } from 'react-native';
import { strings } from '../Localization/StringsCopy';
// import { Styles } from '../assets/style/styles';
// import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
// import { Colors } from '../assets/Utils/Color';
// import { selectUser } from '../redux/store/slices/UserSlice';
// import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
// import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
 
// var styles = BuildStyleOverwrite(Styles);
 
function CustomSeedTextInput({ props, 
    labelName, 
    IsRequired, 
    defaultValue,
    value, 
    placeholder, 
    editable, 
    contextMenuHidden, 
    maxLength,
    onFocus, 
    onChangeText, 
    onEndEditing, 
    keyboardType, 
    textFiledWidth, 
    leftSpace, 
    autoCapitalize,
    addSpace 
}) {
    // const getUserData = useSelector(selectUser);
    // const companyStyle = useSelector(getCompanyStyles);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    return (
        <View style={[textFiledWidth == undefined || textFiledWidth == "" ? { width: '91.5%' } : { width: textFiledWidth, top: 10, marginBottom: 8 },
            addSpace && {},
        ]}>
            <View style={leftSpace == undefined || (leftSpace == "" && leftSpace != 0) ? { left: Platform.OS == 'android' ? 8 : 10 } : { left: leftSpace }} removeClippedSubviews={true}>
                <Text style={[{fontSize:14,color:dynamicStyles?.textColor ?? "#000"},
                addSpace && {left:-7,marginBottom:5,marginTop:10, marginLeft: 15}]}>{labelName} {IsRequired && <Text style={{color:"red"}}>*</Text>}</Text>
 
                <View
                    style={RnStyles.subContainer
                    //     [styles['flex_direction_row'], styles['flexGrow_1'], styles['centerItems'], styles['top_5'], styles['border_radius_6'],
                    // {
                    //     borderColor: Colors.lightish_grey, borderWidth: 1, justifyContent: 'space-around', width: "100%",
                    //     marginLeft: 15
                    // }]
                    }>
                    {labelName == strings.mobile_number ? <Text style={[RnStyles.countryCodeText,{color:dynamicStyles.secondaryColor}]}>{strings.countery_code}</Text> : undefined}
                    {/* styles['bg_white'], */}
                    <TextInput 
                        style=
                        {[{color:dynamicStyles?.textColor ??"#000"},
                        // styles['font_size_14_Regular'],styles['text_align_left'],styles['width_10']
                        ,
                        {fontSize:14,textAlign:"left",width:"100%" ,padding: 0, paddingLeft: 0, width: labelName == strings.mobile_number ? "85%" : "95%", height: labelName == strings.address && value?.length > 50 ? 60 : 40, paddingEnd: labelName == strings.address ? 15 : 0 }]}
                        defaultValue={defaultValue}
                        value={value}
                        keyboardType={keyboardType}
                        placeholder={placeholder}
                        placeholderTextColor={"grey"}
                        underlineColorAndroid="transparent"
                        editable={editable}
                        contextMenuHidden={contextMenuHidden}
                        multiline={labelName == strings.address ? true : false}
                        autoCapitalize={autoCapitalize}
                        scrollEnabled={labelName == strings.address}
                        onFocus={() => {
                            onFocus()
                        }}
                        onChangeText={(text) => {
                            onChangeText(text)
                        }}
                        onEndEditing={(text) => {
                            onEndEditing(text)
                        }}
                        maxLength={maxLength}
                        allowFontScaling={true}>
                    </TextInput>
                </View>
            </View>
        </View>
    )
}
export default CustomSeedTextInput;

const RnStyles=StyleSheet.create({
    subContainer:{
        flexDirection:"row",
        flexGrow:1,
        // alignItems:"center",
        // justifyContent:"center",
        // alignSelf:"center",
        top:5,
        borderRadius:6,
        borderColor:"grey", 
        borderWidth: 1, 
        justifyContent: 'space-around', 
        width: "100%",
        marginLeft: 15,
        textAlign: 'center', 
        // width: '10%',
        marginLeft: 5, 
    },

    countryCodeText:{
        fontSize:14,
        alignSelf:"center",
        textAlign: 'center', 
        width: '10%',
         marginLeft: 5, 
        // [styles['font_size_14_Regular'], 
        // styles['align_self_center'], 
        // { textAlign: 'center', width: '10%', marginLeft: 5, 
        //     color:dynamicStyles?.textColor ?? Colors.black 
        // }]
    }

})
 