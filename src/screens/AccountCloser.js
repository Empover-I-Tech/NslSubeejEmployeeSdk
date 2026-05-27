import React, { useEffect, useState } from 'react';
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
// import CustomLoader from '../Components/CustomLoader';
// import CustomSuccessLoader from '../Components/CustomSuccessLoader';
// import CustomErrorLoader from '../Components/CustomErrorLoader';
import { useSelector } from 'react-redux';
import { useFontStyles } from '../hooks/useFontStyles';

var styles = BuildStyleOverwrite(Styles);

const AccountCloser = ({ route }) => {
    const navigation = useNavigation();
    const fonts=useFontStyles()
    
    // const companyStyle = useSelector(route?.params.dynamicStyles);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const [title,setTitle] = useState(route?.params.title || "")
    const accountCloseLink = route.params.accountCloseLink;
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(route?.params?.loaderGif || "")


    useEffect(() => {
        console.log(accountCloseLink);
    }, [])

    goBack = () => {
        navigation.goBack();
    }

    return (
        <View style={[styles['full_screen'], styles['flex_1'], { backgroundColor: Colors.imageUploadBackColor }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{flexDirection:"row",alignItems:"center",justifyContent:"space-around", backgroundColor:dynamicStyles.primaryColor, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20,paddingBottom:10 }]}>
                <TouchableOpacity  onPress={() => { goBack() }}>
                    <Image source={require('../../assets/Images/BackIcon.png')} style={[{
                        height: 40,
                        width: 40,
                        resizeMode: "contain", tintColor: dynamicStyles.secondaryColor
                    }]} />
                    
                    
                </TouchableOpacity>
                <Text style={[{color:dynamicStyles.secondaryColor,fontSize:18,fontFamily:fonts.SemiBold}]}>{title}</Text>
                    <View style={{width:40}}/>
            </View>

            <View style={[{marginTop:10,width:"90%",alignItems:"center", alignSelf:"center"},Platform.OS === 'android' ? {flex:1} : [styles['height_100%']]]}>

                <WebView
                    onLoadStart={() => {
                         setLoading(true)
                        // setLoadingMessage(translate('please_wait_getting_data'))
                    }}
                    onLoad={() => {
                        setLoading(false)
                        setLoadingMessage()
                    }}
                    source={{ uri: accountCloseLink }}
                    style={[styles['centerItems'], styles['border_radius_6'], { height: '100%', width: '100%' }]}
                    containerStyle={[styles['centerItems'], { flex: 1, width: '100%', height: '90%' }]}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    // onScroll={handleWebViewScroll}
                    onMessage={(event) => {
                        if (event.nativeEvent.data === 'success') {
                            setTimeout(() => {
                                if (route.params?.onClose) {
                                    route.params.onClose(); // callback to previous screen
                                } 
                            }, 500);
                        }
                    }}
                />
            </View>
            {/* {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />} */}
        </View>
    )
};

export default AccountCloser;
