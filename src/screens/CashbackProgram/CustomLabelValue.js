//import liraries
import React, { Component } from 'react';
import { View, Text } from 'react-native';


// create a component
function CustomLabelValue({ lblName, lblValue }) {
    return (
        <View style={[{ width: '98%', flexDirection: 'row', marginTop: 3 }]}>
            <Text style={[{ width: '40%', color: 'black', fontSize: 12, fontWeight: '400' }]}>{lblName}</Text>
            <Text style={[{ color: 'black', marginHorizontal: 1 }]}>{" : "}</Text>
            <Text style={[{ width: '55%', color: 'black', fontSize: 12, fontWeight: '400' }]}>{lblValue}</Text>
        </View>
    );

};
export default CustomLabelValue;
