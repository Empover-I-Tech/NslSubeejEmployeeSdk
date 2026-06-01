// import { Box, Center, Progress, Text } from 'native-base';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Text, View } from 'react-native';

const CashbackLoader = ({loaderPath,message}) => {
    console.log("path==--=>",loaderPath)
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10, // Move up by 10 units
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 10, // Move down by 10 units
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);
  return (
      <View style={{backgroundColor:"rgba(0, 0, 0, 0.5)",zIndex:1,position:"absolute",width:"100%",height:"100%",justifyContent:"center",alignItems:"center"}}>
          {loaderPath != undefined && loaderPath != "" &&
              <Image
                  resizeMode='contain'
                  source={{uri: "file://" + loaderPath}}
                  style={{ height: Dimensions.get('window').width / 2.30, width: Dimensions.get('window').width / 2.29 }}
                  accessibilityLabel="Loading animation"
                  accessibilityHint="Displays a loading GIF"
              />
          }
          {message&&
          <Text style={{color:"#fff",fontSize:14}}>{message}</Text>
          }

      </View>
  );
};

export default CashbackLoader;
