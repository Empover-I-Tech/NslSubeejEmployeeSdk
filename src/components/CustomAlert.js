import React from 'react';
// import { Box, Center, HStack, IconButton } from 'native-base';
// import { CloseIcon } from 'native-base';
import { useSelector } from 'react-redux';
import { Styles } from '../styles/Styles';
import { Pressable, View,Text, Image } from 'react-native';
import { useFontStyles } from '../hooks/useFontStyles';


const CustomAlert = ({ visible, onPressClose, title, showHeader, showHeaderText, message, onPressOkButton, onPressNoButton, showYesButton, showNoButton, yesButtonText, noButtonText, showCloseIcon, showSuccessFailureImage, isSuccess }) => {
    const currentTheme = useSelector(state => state.theme.theme);
    const styles = Styles(currentTheme);
    const fonts = useFontStyles();
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    
    

    if (!visible) return null;

    return (
        // <Center position="absolute" top={0} right={0} left={0} bottom={0} backgroundColor="rgba(0, 0, 0, 0.5)" zIndex={1}>
            // <Box style={[styles.widthPct_85, styles.white_bg, styles.padding_10, styles.alignSelfCenter]} borderRadius={8} shadow={2}>
        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1, position: "absolute", width: "100%", height: "100%", justifyContent: "center", alignItems: "center",paddingHorizontal:20 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 10 }}>
                {showSuccessFailureImage && <View style={[styles.alignSelfCenter, styles.padding_10]}>
                    <Image source={require('../../assets/Images/successIconMssg.png')} style={{
                        height: 50,
                        width: 50,
                        resizeMode: "contain",
                        alignSelf: "center",
                        // marginTop: 20
                    }} />
                </View>}
                {/* Header Section */}
                {showHeader && (
                    // <HStack style={[styles.justifyContentSpaceBetween, styles.alignItemsCenter, styles.widthPct_100]}>
                    <View style={{flexDirection:"row",width:"100%"}}>
                        {showHeaderText && (
                            <Text style={[styles.textColorBlack, styles.fontSize_18, styles.textAlignCenter, { lineHeight: 30,fontFamily:fonts.SemiBold }]} flex={1}>
                                {title}
                            </Text>
                        )}
                        {/* {showCloseIcon && (<IconButton icon={<CloseIcon size="4" color="red.600" />}
                            onPress={onPressClose} position="absolute" right={0} />
                        )} */}
                    </View>

                    // </HStack>
                )}

                {/* Message Section */}
                <Text style={[styles.textAlignCenter,styles.fontSize_14, styles.marginTop_10, styles.marginBottom_10, styles.textColorBlack,{fontFamily:fonts.SemiBold}]}>
                    {message}
                </Text>

                {/* Button Section */}
                {/* <HStack marginTop={4} space={4} justifyContent="center"> */}
                <View style={[showYesButton&&showNoButton&&{flexDirection:"row",justifyContent:"space-between"},{alignItems:"center",marginTop:4}]}>
                    {showYesButton && (
                        <Pressable style={[styles.alignItemsCenter, styles.justifyContentCenter]} onPress={onPressOkButton} borderRadius={8} borderWidth={1} width={showYesButton ? "45%" : '95%'} borderColor={dynamicStyles?.primaryColor?dynamicStyles.primaryColor:"#845EF1"}>
                            <Text style={[ styles.textAlignCenter, styles.fontSize_14, {fontFamily:fonts.SemiBold,color:dynamicStyles?.primaryColor?dynamicStyles.primaryColor:"#845EF1"},styles.padding_10]}>{yesButtonText}</Text>
                        </Pressable>
                    )}
                    {showNoButton && (
                        <Pressable style={[styles.alignItemsCenter, styles.justifyContentCenter,{backgroundColor:dynamicStyles?.primaryColor?dynamicStyles.primaryColor:"#845EF1"}]} onPress={onPressNoButton} borderRadius={8} width={showYesButton ? "45%" : '95%'} borderColor={currentTheme.themeRed}>
                            <Text style={[ styles.textAlignCenter, styles.fontSize_14, {fontFamily:fonts.SemiBold,color:dynamicStyles?.secondaryColor?dynamicStyles?.secondaryColor:"#fff"},styles.padding_10]}>{noButtonText}</Text>
                        </Pressable>
                    )}
                </View>

                {/* </HStack> */}
            </View>
        </View>


            // </Box>
        // </Center>
    );
};

export default CustomAlert;
