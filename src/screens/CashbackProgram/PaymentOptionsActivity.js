//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, Platform, StatusBar, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { translate } from '../../Localization/Localisation';
import { Colors } from '../../styles/colors';
import { useSelector } from 'react-redux';
import { AMAZON_PAY_GIFT_CARD, BANK_DETAILS_M, BANK_TRANSFER_M, PAYTM_M, UPI_M } from '../../assets/Utils/Utils';
import SimpleToast from 'react-native-simple-toast';


const PaymentOptionsActivity = ({ route }) => {
    console.log("route?.params", route?.params)
    const navigateToPayment = route?.params?.navigateToPaymentOptions || null
    console.log("navigateToPayment", navigateToPayment)
    const navigation = useNavigation();
    const [paymentOptionsList, setPaymentOptionsList] = useState([])
    const [claimRupeeTotal, setClaimRupeeTotal] = useState('')
    const [dynamicStyles, setDynamicStyles] = useState({})
    const [bankAccount, setBankAccount] = useState(false)
    const [upi, setUPI] = useState(false)
    const [paytm, setPaytm] = useState(false)
    const [amazonPay, setAmazonPay] = useState(false)
    const isConnected = useSelector(state => state.network.isConnected);

    useEffect(() => {

        console.log("claimRupeeTotal", claimRupeeTotal)
        console.log("paymentOptionsList", paymentOptionsList)
        setDynamicStyles(navigateToPayment?.dynamicStyles || {})
        setClaimRupeeTotal(navigateToPayment?.claimRupeeTotal || '')
        setPaymentOptionsList(navigateToPayment?.paymentOptionsList || [])

    }, [navigateToPayment])

    useEffect(() => {

        if (paymentOptionsList != null && paymentOptionsList.length > 0) {
            for (var i = 0; i < paymentOptionsList.length; i++) {
                if ((paymentOptionsList[i]?.toLowerCase().replace(/\s/g, '') == BANK_DETAILS_M.toLowerCase().replace(/\s/g, '')) || (paymentOptionsList[i]?.toLowerCase().replace(/\s/g, '') == BANK_TRANSFER_M.toLowerCase().replace(/\s/g, ''))) {
                    setBankAccount(true)
                }
                else if (paymentOptionsList[i] == UPI_M) {
                    setUPI(true)
                }
                else if (paymentOptionsList[i] == PAYTM_M) {
                    setPaytm(true)
                }
                else if (paymentOptionsList[i].toLowerCase().replace(/\s/g, '') == AMAZON_PAY_GIFT_CARD.toLowerCase().replace(/\s/g, '')) {
                    setAmazonPay(true)
                }
            }
        }

    }, [paymentOptionsList])

    const navigateToPatmentOption = (selectedPaymentMode, selectedTitle) => {
        console.log("selectedPaymentMode", selectedPaymentMode)
        console.log("selectedTitle", selectedTitle)
        var selectedPaymentModeItem = {
            selectedClickItem: selectedPaymentMode,
            selectedTitle: selectedTitle,

        }
        navigation.navigate('SelectedPaymentOptionActivity', { selectedPaymentModeItem: selectedPaymentModeItem, navigateToPaymentOptions: navigateToPayment })
    }


    return (
        <View style={[{width:'100%', height:'100%', backgroundColor: Colors.white}]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}


            {/* Header tool bar Section */}
            <View style={[{flexDirection:'row', width:'100%', height : 60, backgroundColor: dynamicStyles.primaryColor, alignItems: 'center', paddingLeft: 15,paddingRight:20}]}>
                <TouchableOpacity
                    style={[{flexDirection:'row', alignItems: 'center', width: '82%' }]}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <Image style={[{width: 20, height: 20, marginTop: 3, tintColor: Colors.white}]} source={require('../CashbackProgram/assets/previous.png')} />
                    <Text style={[{fontSize: 21, color: Colors.white, paddingLeft: 5}]}>{translate('transfer')}</Text>
                </TouchableOpacity>
                {claimRupeeTotal!=null &&
                    <View style={{ borderWidth: 0.5, borderColor: dynamicStyles.secondaryColor ,marginRight:10}}>
                        <Text
                            style={[{fontSize: 16, color: Colors.white, padding: 2,}]}>{claimRupeeTotal}</Text>
                    </View>}
            </View>



            {/* Reward Strip Section */}
            <View style={[{ flex: 1 }]}>
                <View
                    style={[{ width: '85%', alignSelf: 'center', marginTop: 20, marginBottom: 20, flexGrow: 1, }]}>
                    <Text style={[{ color: "#555555", fontSize: 17, fontWeight: '400' }]}>{translate('select_payment_mode')}</Text>
                    <View style={[{ width: "100%", borderWidth: 0.75, marginTop: 2, borderColor: "#F3B08F" }]} />

                    {bankAccount &&
                        <TouchableOpacity
                            onPress={() => {isConnected?navigateToPatmentOption(BANK_TRANSFER_M, translate('bank_details')):SimpleToast.show(translate("no_internet_conneccted"))}}
                            style={[{ width: "100%", alignSelf: 'center', marginTop: 50 }]}>
                            <Image style={[{ alignSelf: 'center' }]} source={require('../CashbackProgram/assets/ic_bank.png')} />
                            <View style={[{ width: "100%", borderWidth: 0.75, marginTop: 5, borderColor: Colors.light_grey_line }]} />
                        </TouchableOpacity>}

                    {upi &&
                        <TouchableOpacity
                            onPress={() => {isConnected?navigateToPatmentOption(UPI_M, translate('upi_caps')):SimpleToast.show(translate("no_internet_conneccted"))}}
                            style={[{ width: "100%", alignSelf: 'center', marginTop: 10 }]}>
                            <Image style={[{ alignSelf: 'center' }]} source={require('../CashbackProgram/assets/ic_upi.png')} />
                            <View style={[{ width: "100%", borderWidth: 0.75, marginTop: 5, borderColor: Colors.light_grey_line }]} />
                        </TouchableOpacity>}

                    {paytm &&
                        <TouchableOpacity
                            onPress={() => {
                                navigateToPatmentOption(PAYTM_M, translate('paytm_title'));
                            }}
                            style={[{ width: "100%", alignSelf: 'center', marginTop: 10 }]}>
                            <Image style={[{ alignSelf: 'center' }]} source={require('../CashbackProgram/assets/ic_paytm.png')} />
                            <View style={[{ width: "100%", borderWidth: 0.75, marginTop: 5, borderColor: Colors.light_grey_line }]} />
                        </TouchableOpacity>}

                    {amazonPay &&
                        <TouchableOpacity
                            onPress={() => {
                                navigateToPatmentOption(AMAZON_PAY_GIFT_CARD, translate('amazon_pay_gift_card'));
                            }}
                            style={[{ width: "100%", alignSelf: 'center', marginTop: 10 }]}>
                            <Image style={[{ alignSelf: 'center' }]} source={require('../CashbackProgram/assets/ic_amazon.png')} />
                        </TouchableOpacity>}

                </View>
            </View>
        </View>
    );
}



export default PaymentOptionsActivity;
