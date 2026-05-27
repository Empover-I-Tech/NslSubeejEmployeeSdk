//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Platform, StatusBar, TouchableOpacity, Image, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../styles/colors';
import CustomButton from '../../components/CustomButton';
import { translate } from '../../Localization/Localisation';
import { EMP_DASHBOARD_SCREEN, ROLDID, SCREENNAME } from '../../utils';

const CompletedPaymentActivity = ({ route }) => {

    console.log("route?.params", JSON.stringify(route?.params))
    const decodeddJson = route?.params?.decodeddJson || null
    console.log("route?.params?.decodeddJson", JSON.stringify(decodeddJson))
    const navigateToPayment = route?.params?.navigateToPaymentOptions || null
    console.log("navigateToPaymentOptions====>", navigateToPayment)


    const navigation = useNavigation();
    const [decodeddJsonObject, setDecodeddJsonObject] = useState(null)
    const [dynamicStyles, setDynamicStyles] = useState({})



    useEffect(() => {
        setDecodeddJsonObject(decodeddJson)
        setDynamicStyles(navigateToPayment?.dynamicStyles || null)
    }, [decodeddJson, navigateToPayment])

    // ✅ Fixed BackHandler
    useEffect(() => {
        const handleBackButtonClick = () => {
            navigateToHome();
            return true;
        };

        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackButtonClick
        );

        return () => subscription.remove(); // ✅ Correct cleanup

    }, [navigateToHome]);


    // ✅ Wrapped in useCallback to avoid re-creating on every render
    const navigateToHome = useCallback(async () => {
        const screenName = await getFromAsyncStorage(SCREENNAME);
        const isEmployee = (screenName == EMP_DASHBOARD_SCREEN);
        if (isEmployee) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabsNavigatorEmp' }],
            });
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        }
    }, [navigation]);

    return (
        <View style={{ width: '100%', height: '100%', backgroundColor: dynamicStyles?.secondaryColor }}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles?.primaryColor} barStyle='dark-content' />}


            {/* Header tool bar Section */}
            <View style={[{ flexDirection: 'row', backgroundColor: dynamicStyles?.primaryColor, width: '100%', height: 60, alignItems: 'center', paddingLeft: 15 }]}>
                <Text style={[{ fontSize: 21, color: Colors.white, paddingLeft: 5, width: '85%' }]}>{translate('transfer')}</Text>
                <TouchableOpacity
                    style={[{ flexDirection: 'row', justifyContent: 'flex-end', width: '15%', paddingEnd: 15 }]}
                    onPress={() => {
                        navigateToHome()
                    }}>
                    <Image style={[{ width: 30, height: 30, top: 3, tintColor: Colors.white }]} source={require('../CashbackProgram/assets/ic_menu_home.png')} />
                </TouchableOpacity>
            </View>



            {/* Section */}
            <View style={[{ width: '100%', height: '90%' }]}>
                <View
                    style={[{ width: '85%', alignSelf: 'center', marginTop: 20, flexGrow: 1, marginBottom: 60, }]}>

                    <View style={[{ marginTop: 50 }]}>

                        {decodeddJsonObject?.succAndFailMsg &&
                            <Text style={[{ width: '100%', fontSize: 20, textAlign: 'center' }, { color: decodeddJsonObject?.succAndFailMsgColor ? decodeddJsonObject?.succAndFailMsgColor : "#000" }]}>
                                {decodeddJsonObject?.succAndFailMsg}
                            </Text>
                        }
                        {decodeddJsonObject?.succAndFailIcon &&
                            <Image style={[{ width: 100, height: 100, marginTop: 10, alignSelf: 'center', resizeMode: "contain" }]} source={{ uri: decodeddJsonObject?.succAndFailIcon }} />
                        }
                        {decodeddJsonObject?.secondaryMsg &&
                            <Text style={[{ width: '100%', fontSize: 16, textAlign: 'center', marginTop: 10, color: decodeddJsonObject?.secondaryMsgColor }]}>
                                {decodeddJsonObject?.secondaryMsg}
                            </Text>}

                        <View style={[{ flexDirection: 'row', marginTop: 10, alignItems: "center", width: "100%", justifyContent: "center" }]}>
                            {decodeddJsonObject?.succIcon &&
                                <Image style={[{ width: 50, height: 50, alignSelf: 'center', marginRight: 20 }]} source={{ uri: decodeddJsonObject?.succIcon }} />
                            }
                            {decodeddJsonObject?.amountRupess &&
                                <Text style={[{ fontSize: 24, color: decodeddJsonObject?.amountColor }]}>
                                    {decodeddJsonObject?.amountRupess}
                                </Text>
                            }
                        </View>
                        {decodeddJsonObject?.data?.txnReferenceId &&
                            <View style={{ flexDirection: "row", marginTop: 20, alignSelf: "center", }}>
                                <Text style={{ color: "#000", fontSize: 16, }}>{`${translate('referenceId')} : `}</Text>
                                <Text style={{ color: "#000", fontSize: 16, }}>{decodeddJsonObject?.data?.txnReferenceId}</Text>
                            </View>
                        }
                    </View>

                </View>



                <View style={{ marginBottom: 40 }}>
                    <CustomButton
                        title={translate('go_to_home').toUpperCase()}
                        buttonBg={dynamicStyles?.primaryColor}
                        btnWidth={'95%'}
                        buttonHeight={45}
                        titleTextColor={dynamicStyles?.secondaryColor}
                        onPress={() => {
                            navigateToHome()
                        }}
                    />

                </View>

            </View>
        </View>
    );
}

export default CompletedPaymentActivity;
