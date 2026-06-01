import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import NoInternetOverlay from '../screens/NoInternetOverlay';

const ScreenWrapper = ({ children, style }) => {
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const isConnected = useSelector(state => state.network.isConnected);
  const isEmployee = useSelector(state => state.employeeRole.isEmployee);
  console.log("isemppo=--=>",isEmployee)

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      
      {/* Top Safe Area ONLY – removes gap */}
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: dynamicStyles?.primaryColor || '#fff' }}
      />

      {/* Actual Screen */}
      <View style={[{ flex: 1, backgroundColor: '#fff' }, style]}>
        {children}
        {isEmployee && <NoInternetOverlay visible={!isConnected} />}
      </View>

      {/* Bottom Safe Area – no color, no gap */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }} />

    </View>
  );
};

export default ScreenWrapper;
