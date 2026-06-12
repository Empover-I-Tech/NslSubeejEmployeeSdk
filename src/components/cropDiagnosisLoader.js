import { useSelector } from 'react-redux';
import { Text, View, Modal, Image, Dimensions } from 'react-native';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Colors } from '../assets/Utils/Color';
import { useFontStyles } from '../hooks/useFontStyles';

const styles = BuildStyleOverwrite(Styles);

const CustomLoader = ({ loading = false, fill = 10, message = "Loading...", loaderImage,fromCropDiag = false }) => {
  const fonts=useFontStyles()

  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  console.log(dynamicStyles.loaderPath, "BHASKAR");

  return (
    <Modal
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      animationType="fade"
      visible={loading}
      onRequestClose={() => console.log('close modal')}
    >
      <View style={[styles['justify_content_center'], { backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center" }]}>
        {fromCropDiag ?
        <Image
          source={ loaderImage}
          style={[styles['justify_content_center'], styles['align_self_center'], styles['center_align_items'], { width: 150, height: 150, marginTop: -75, /* tintColor:  dynamicStyles.primaryColor != undefined ? dynamicStyles.primaryColor : Colors.purple */ }]}
          resizeMode="contain"
        />
        :
        <Image
          source={dynamicStyles.loaderPath != undefined && dynamicStyles.loaderPath != "" ? { uri: "file://"+dynamicStyles.loaderPath } : loaderImage}
          // source={loaderImage}
          style={[styles['justify_content_center'], styles['align_self_center'], styles['center_align_items'], { width: 150, height: 150, marginTop: -75, /* tintColor:  dynamicStyles.primaryColor != undefined ? dynamicStyles.primaryColor : Colors.purple */ }]}
          resizeMode="contain"
        />}
        <Text
          style={[
            styles['font_size_13_Regular'], 
            // styles['textAlignCenter'], 
            styles['padding_left_10'], 
            styles['top_10'], 
            styles['text_input'], 
            styles['top_30'], 
            { color: dynamicStyles.secondaryColor != undefined ? dynamicStyles.secondaryColor : Colors.white,textAlign:"center",fontFamily:fonts.SemiBold }
          ]}
        >
          {message}
        </Text>
      </View>
    </Modal>
  );
};

export default CustomLoader;
