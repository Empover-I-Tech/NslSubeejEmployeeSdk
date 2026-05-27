// import { Box, Center, Progress, Text } from 'native-base';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Styles } from '../styles/Styles';
import { Animated, Dimensions, Image, View } from 'react-native';
import TextAnimator from '../anim/TextAnimator';

const CustomLoader = ({ visible, message, loaderImage = require('../../assets/Images/SubeejLoader.gif'), progress, type }) => {
  const currentTheme = useSelector(state => state.theme.theme);
  const styles = Styles(currentTheme);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderMessage, setLoaderMessage] = useState("");
  const [image, setImage] = useState("");
  const floatAnim = useRef(new Animated.Value(0)).current;
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);


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
    // <Center
    //   position="absolute"
    //   top={0}
    //   right={0}
    //   left={0}
    //   bottom={0}
    //   backgroundColor="rgba(0, 0, 0, 0.5)"
    //   zIndex={1}
    // >
    //   <Box
    //     style={[
    //       styles.widthPct_85,
    //       styles.padding_10,
    //       styles.alignSelfCenter,
    //       styles.alignItemsCenter,
    //     ]}
    //   >
    <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1, position: "absolute", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>

      {type ? (
        <Image
          resizeMode="contain"
          source={{ uri: loaderImage }}
          style={{ height: 150, width: 150 }}
          //  style={{ height: Dimensions.get('window').width / 5, width: Dimensions.get('window').width / 2.29 }}
          accessibilityLabel="Loading animation"
          accessibilityHint="Displays a loading GIF"
        />
      ) : (
        <>

          <Image
            resizeMode='contain'
            source={loaderImage}
            style={{ height: Dimensions.get('window').width / 2.30, width: Dimensions.get('window').width / 2.29 }}
            accessibilityLabel="Loading animation"
            accessibilityHint="Displays a loading GIF"
          />
        </>
      )}
      {/* </Box>
    </Center> */}
    </View>

  );
};

export default CustomLoader;
