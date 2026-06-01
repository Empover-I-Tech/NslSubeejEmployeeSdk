// import { useSelector } from 'react-redux'; 
// import React, { Component } from 'react';
// import {
//   Text,
//   View,
//   Modal,
//   Dimensions,
//   Image,
//   // ActivityIndicator
// } from 'react-native';
// // import { AnimatedCircularProgress } from 'react-native-circular-progress';
// import { Styles } from '../assets/style/styles';
// import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
// import { selectUser } from '../redux/store/slices/UserSlice';
// import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';


// const { height, width } = Dimensions.get('window')

// var styles = BuildStyleOverwrite(Styles);




// export default class CustomLoader extends Component {
  
//   const getUserData = useSelector(selectUser);
// const companyStyle = useSelector(getCompanyStyles);
//   constructor(props) {
//     super(props)

//     this.state = {
//       dynamicStyles: companyStyle.value,
//       loading: this.props.loading == undefined ? false : this.props.loading,
//       fill: this.props.fill == undefined ? 10 : this.props.fill,
//       message: this.props.message == undefined ? "Loading..." : this.props.message,
//       loaderImage: this.props.loaderImage == undefined ? require('../assets/images/vm_loader.gif') : this.props.loaderImage
//     }
//   }

//   componentDidMount() {

//   }

//   componentWillReceiveProps(props) {
//     if (props.message != this.state.message) {
//       this.setState({
//         message: props.message
//       })
//     }
//   }
//   render() {
//     return (
//       <Modal
//         supportedOrientations={['portrait', 'landscape']}
//         transparent={true}
//         animationType='fade'
//         visible={this.state.loading}
//         onRequestClose={() => { console.log('close modal') }}>

//         <View style={[styles['justify_content_center'], { backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center" }]}>

//           {/* <AnimatedCircularProgress
//             size={170}
//             width={7}
//             fill={this.props.fill}
//             tintColor="#00000000"
//             tintTransparency={true}
//             rotation={360}
//             duration={this.state.duration}
//           /> */}

//           <Image source={this.props.loaderImage} style={[styles['justify_content_center'], styles['align_self_center'], styles['center_align_items'], { width: 150, height: 150, marginTop: -75,tintColor: dynamicStyles.primaryColor }]} resizeMode={'contain'} />

//           <Text style={[styles['font_size_13_Regular'], styles['textAlignCenter'], styles['padding_left_10'], styles['top_10'], styles['text_input'], styles['top_30'],{color: dynamicStyles.secondaryColor}]}>
//             {this.state.message}
//           </Text>

//         </View>
//       </Modal>

//     )
//   }
// }
import { useSelector } from 'react-redux';
import React from 'react';
import { Text, View, Modal, Image, Dimensions } from 'react-native';

import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';

import { Colors } from '../assets/Utils/Color';
import { useFontStyles } from '../hooks/useFontStyles';

const { height, width } = Dimensions.get('window');

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
