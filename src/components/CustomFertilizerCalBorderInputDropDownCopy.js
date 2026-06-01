import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    // AppState,
    // Appearance,
    Keyboard,
    Platform,
    Dimensions
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFontStyles } from '../hooks/useFontStyles';
const { width, height } = Dimensions.get('window');

// import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
// import { Styles } from '../assets/style/styles';
// import { Styles } from '../styles/Styles';
// import { Colors } from '../assets/Utils/Color';
// import { selectUser } from '../redux/store/slices/UserSlice';
// import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
// import { styles } from './Upgrade/components/CameraScanner/CameraScanner.styles';
// import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';

const CustomFertilizerCalBorderInputDropDownCopy = (props) => {
    const fonts=useFontStyles()
    // const [styles, setStyles] = useState(BuildStyleOverwrite(Styles));
    // const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
    // const [isActive, setIsActive] = useState(false);
    //  const getUserData = useSelector(selectUser);
    //   const companyStyle = useSelector(getCompanyStyles);
    //   const [dynamicStyles,setDynamicStyles] = useState(companyStyle.value);
    const dynamicStyles = useSelector((state) => state.companyStyles.companyStyles);
    // const currentTheme = useSelector((state) => state.theme.theme);
    // const styles = Styles(currentTheme);

    // const handleAppStateChange = useCallback((nextAppState) => {
    //     if (nextAppState === 'active') {
    //         // setStyles(BuildStyleOverwrite(Styles));
    //         setIsActive(false);
    //         setColorScheme(Appearance.getColorScheme());
    //     }
    // }, []);

    // const handleAppearanceChange = useCallback(({ colorScheme: newColorScheme }) => {
    //     if (global.isAndroid || global.colorScheme !== newColorScheme) {
    //         // setStyles(BuildStyleOverwrite(Styles));
    //         setIsActive(false);
    //         setColorScheme(newColorScheme);
    //     }
    // }, []);

    // useEffect(() => {
    //     const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    //     const appearanceListener = Appearance.addChangeListener(handleAppearanceChange);

    //     return () => {
    //         appStateListener.remove();
    //         appearanceListener.remove();
    //     };
    // }, [handleAppStateChange, handleAppearanceChange]);

    return (
        <View
            style={{width:"93%",alignSelf:"center", }}>
            <View style={{ marginBottom: 5 }}>
                {props.labelName !== undefined && (
                    <Text
                        style={{fontFamily:fonts.Regular,color:"#000",position:"absolute",zIndex:999,backgroundColor:"#FFF",padding:5,marginTop:-10,marginLeft:15,fontSize:RFValue(11,680)}
                            // [
                            // styles['text_color_black'],
                            // styles['absolute_position'],
                            // styles['margin_top_minus_10'],
                            // styles['margin_left_15'],
                            // styles['font_size_11_semibold'],
                            // styles['zindex_9999'],
                            // styles['bg_white'],
                            // styles['padding_5']
                            
                        // ]
                        }>
                            
                        {props.labelName}
                        {props.IsRequired && (
                            <Text style={[styles['text_color_red']]}> {"*"}</Text>
                        )}
                    </Text>
                )}
                {/* {props.labelName !== undefined && (
                    <Text style={[{backgroundColor:"#fff",color:"#fff" ,position: "absolute", marginTop: -10, marginLeft: 15, padding: 5 }]}
                    // style={[

                    //     styles['absolute_position'],
                    //     styles['margin_top_minus_10'],
                    //     styles['margin_left_15'],
                    //     styles['font_size_11_semibold'],
                    //     styles['zindex_9999'],
                    //     styles['bg_white'],
                    //     styles['padding_5']
                    // ]}
                    >
                        {props.labelName}

                        {props.IsRequired && (
                            <Text style={[{ color: "red" }]}> {"*"}</Text>
                        )}
                    </Text>
                )} */}

             {/* //olde one */}
                <View style={{ flexDirection: "row", width: "99%" }}>
                    <TouchableOpacity disabled={ props?.disabled?true:false}
                        style={[
                            // [
                            // styles['width_100%'],
                            // styles['flex_direction_row'],
                            // styles['button_height_45'],
                            // styles['bg_white'],
                            // styles['top_5'],
                            // styles['border_width_1'],
                            // styles['border_radius_6'],
                            // styles['border_color_light_grey'],
                            {backgroundColor:"#fff" ,width: "100%", flexDirection: "row", top: 5, borderWidth: 1, borderRadius: 6, borderColor: "grey", height: 45 },
                            props?.disabled && {backgroundColor:'#E9E9E9'},
                        // ]
                    ]}
                        onPress={() => {
                            props.onFocus();
                        }}>
                        {/* <TextInput 
                            style={[
                                props?.disabled && {backgroundColor:'rgba(0, 0, 0, 0.0)'},
                                // styles['font_size_14_Regular'],
                                // styles['text_color_black'],
                                // {},
                                // styles['padding_left_10'],
                                // Platform.OS === 'ios' && styles['top_3'],
                                // styles['width_92%'],
                                { color: dynamicStyles?.textColor ?? "black", paddingLeft: 10, width: "92%", fontSize: 14,}
                            ]}
                            // value={props.value}
                            placeholder={props.placeholder}
                            placeholderTextColor={
                                // props.placeholderTextColor !== undefined
                                //     ? props.placeholderTextColor
                                //     :
                                     '#B4B4B4'
                            }
                            defaultValue={props.defaultValue}
                            // editable={props.editable}
                            // selection={{ start: 0, end: 0 }}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            // multiline={false}
                            // autoCorrect={false}
                            // color="black"
                            // showSoftInputOnFocus={false}
                            onFocus={() => {
                                Keyboard.dismiss();
                                props.onFocus();
                            }}
                            // onEndEditing={(text) => {
                            //     props.onEndEditing && props.onEndEditing(text);
                            // }}
                        /> */}
                        <TextInput
                            style={[
                                // styles['font_size_14_Regular'],
                                // styles['text_color_black'],
                                { paddingLeft:10,width:"92%",color: dynamicStyles?.textColor ?? "#000",fontSize:RFValue(15,height) },
                                props?.disabled && { backgroundColor: 'E9E9E9' },
                                // styles['padding_left_10'],
                                // Platform.OS === 'ios' && styles['top_3'],
                                // styles['width_92%'],
                                { color:"grey", padding: 0,fontFamily:fonts.Regular }
                            ]}
                            value={props.value}
                            placeholder={props.placeholder}
                            placeholderTextColor={
                                props.placeholderTextColor !== undefined
                                    ? props.placeholderTextColor
                                    : '#B4B4B4'
                            }
                            defaultValue={props.defaultValue}
                            editable={props.editable}
                            selection={{ start: 0, end: 0 }}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            multiline={false}
                            autoCorrect={false}
                            color={"#000"}
                            showSoftInputOnFocus={false}
                            onFocus={() => {
                                Keyboard.dismiss();
                                props.onFocus();
                            }}
                            onEndEditing={(text) => {
                                props.onEndEditing && props.onEndEditing(text);
                            }}
                        />

                        {/* <Image
                            style={{
                                width: 14,
                                height: Platform.OS === 'android' ? 8 : 7,alignSelf:"center"

                            }}
                            source={require('../../assets/Images/DropDownImg.png')}
                        /> */}
                    </TouchableOpacity>
                </View>

                <View
                    style={[{right:10,alignItems:"flex-end",position:"absolute",marginTop:20}
                        // styles['right_10'],
                        // styles['align_items_flex_end'],
                        // styles['absolute_position'],
                        // styles['margin_top_22']
                    ]}>
                    {!props?.disabled && <Image
                        style={{
                            width: 14,
                            height: Platform.OS === 'android' ? 8 : 7
                        }}
                        source={require('../../assets/Images/DropDownImg.png')}                    />}
                </View>


                {/* <View
                    style={[{right:10,justifyContent:"flex-end",alignItems:"flex-end",position:"absolute",marginTop:"10"},
                        // styles['right_10'],
                        // styles['align_items_flex_end'],
                        // styles['absolute_position'],
                        // styles['margin_top_22']
                    ]}> */}
                {/* <Image
                        style={{
                            width: 14,
                            height: Platform.OS === 'android' ? 8 : 7,
                           
                        }}
                        source={require('../../assets/Images/DropDownImg.png')}
                    /> */}
                {/* </View> */}
            </View>
        </View>
    );
};

export default CustomFertilizerCalBorderInputDropDownCopy;