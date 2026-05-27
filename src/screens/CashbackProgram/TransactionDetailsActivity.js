//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, Platform, StatusBar, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FAILED_st, isDigitOnly, isNullOrEmpty, isNullOrEmptyNOTTrim, PENDING_st, strYMMDhmsSToDMMMYhms, SUCCESS_st } from '../../assets/Utils/Utils';
import CustomLabelValue from './CustomLabelValue';
import { translate } from '../../Localization/Localisation';

const TransactionDetailsActivity = ({ route }) => {
    console.log("TransactionDetailsActivity=-=--=>",route?.params)

    const navigation = useNavigation();
    const [transactionList, setTransactionList] = useState(route?.params?.detailsList || [])
    const [onSelectedItem, setOnSelectedItem] = useState(route?.params?.onSelectedItem || {})
    const [dynamicStyles, setDynamicStyles] = useState(route?.params?.dynamicStyles || null)

    useEffect(() => {
        console.log("transactionList", JSON.stringify(transactionList))
        console.log("onSelectedItem", onSelectedItem)
    }, [])

    const renderSuccessListItem = (item, index) => {
        console.log("item====>",item)
        return (
            <View
                style={[{width: '98%',  borderWidth: 0.5, borderRadius: 5, borderColor: 'grey', margin: 5, padding: 8}]}>
                {!isNullOrEmptyNOTTrim(item.cashRewards) &&
                    <CustomLabelValue
                        lblName={`${translate('amount')} (₹)`}
                        lblValue={isDigitOnly(item.cashRewards) ? item.cashRewards : item.cashRewards}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.transferId) &&
                    <CustomLabelValue
                        lblName={translate('transaction_id')}
                        lblValue={item.transferId}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.createdOn) &&
                    <CustomLabelValue
                        lblName={translate('date')}
                        lblValue={strYMMDhmsSToDMMMYhms(item.createdOn)}
                    />
                }
                {!isNullOrEmptyNOTTrim(item.referenceId) &&
                    <CustomLabelValue
                        lblName={translate('reference_id')}
                        lblValue={item.referenceId}
                    />
                } 
                {!isNullOrEmptyNOTTrim(item.paymentStatus) &&
                    <CustomLabelValue
                        lblName={translate('status_')}
                        lblValue={item.paymentStatus == SUCCESS_st && translate('success') ||
                            item.paymentStatus == FAILED_st && translate('failed') ||
                            item.paymentStatus == PENDING_st && translate('pending')}
                    />
                }
                {/* {!isNullOrEmpty(item.productName) &&
                    <CustomLabelValue
                        lblName={translate('product_name_label')}
                        lblValue={item.productName}
                    />
                }

                {!isNullOrEmpty(item.amount) &&
                    <CustomLabelValue
                        lblName={translate('reward')}
                        lblValue={item.amount}
                    />
                    
                }
                {!isNullOrEmpty(item.referenceId) &&
                    <CustomLabelValue
                        lblName={translate('referenceId')}
                        lblValue={item.referenceId}
                    />}

                {!isNullOrEmpty(item.createdOn) &&
                    <CustomLabelValue
                        lblName={translate('date')}
                        lblValue={strYMMDhmsSToDMMMYhms(item.createdOn)}
                    />
                }
                {!isNullOrEmpty(item.prodSerialNumber) &&
                    <CustomLabelValue
                        lblName={translate('product_uid')}
                        lblValue={item.prodSerialNumber}
                    />
                }
                {!isNullOrEmpty(item.status) &&
                    <CustomLabelValue
                        lblName={translate('status_')}
                        lblValue={item.status == SUCCESS_st && translate('success') ||
                            item.status == FAILED_st && translate('failed') ||
                            item.status == PENDING_st && translate('pending')}
                    />
                } */}
            </View>
        )
    };


    return (
        <View style={[{width:'100%', height:'100%', backgroundColor: dynamicStyles?.secondaryColor}]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles?.primaryColor} barStyle='dark-content' />}


            {/* Header tool bar Section */}
            <View style={[{flexDirection: 'row', width: '100%', backgroundColor: dynamicStyles?.primaryColor, height: 60, alignItems: 'center', paddingLeft: 15}]}>
                <Text style={[{fontSize: 21, fontWeight: '400', color: 'white', paddingLeft: 5, width: '85%'}]}>{translate('transction_details')}</Text>
                <TouchableOpacity
                    style={[{ flexDirection: 'row', justifyContent: 'flex-end', width: '15%', paddingEnd: 15 }]}
                    onPress={() => {
                        navigation.goBack()
                    }}>
                    <Image style={[{width: 25, height: 25, tintColor: 'white'}]} source={require('../CashbackProgram/assets/ic_close_icon.png')} />
                </TouchableOpacity>
            </View>



            {/* Section */}
            <View style={[{width:'100%'}]}>
                <View style={[{flexDirection: 'row', width: '100%', backgroundColor: dynamicStyles?.primaryColor, padding: 8, marginTop : 5, alignItems: 'center', borderTopEndRadius:10, borderTopLeftRadius:10 }]}>
                    <Text
                        style={[{flex:1, paddingStart:10, fontSize: 16, fontWeight: '400', color: 'white'}]}>{translate('referenceId') + " - " + onSelectedItem?.referenceId}</Text>
                    <Text
                        style={[{flex : 1, fontSize: 16, fontWeight: '400', color: 'white', textAlign:'right', right:5}]}>{onSelectedItem?.amount}</Text>
                </View>
                <View
                    style={[{width:'100%', alignSelf: 'center', paddingBottom:200}]}>
                    <FlatList
                        data={transactionList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => renderSuccessListItem(item, index)}
                        contentContainerStyle={{ flexGrow: 1 }}
                    />
                </View>
            </View>
        </View>
    );
}



export default TransactionDetailsActivity;
