import { useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  AppState,
  Appearance,
  Keyboard,
  Platform
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { useFontStyles } from '../hooks/useFontStyles';

const CustomInputDropDown = (props) => {

  const fonts = useFontStyles();
  let styles = BuildStyleOverwrite(Styles);
  const dynamicStyles = useSelector((state) => state.companyStyles.companyStyles);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      styles = BuildStyleOverwrite(Styles);
    }
  };

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    const appearanceListener = Appearance.addChangeListener(({ colorScheme }) => {
      styles = BuildStyleOverwrite(Styles);
    });

    return () => {
      appStateListener.remove();
      appearanceListener.remove();
    };
  }, []);

  return (
    <View style={[props.width !== undefined ? props.width : styles['width_90%'], { height: 90 }]}>

      {/* Label */}
      {props.labelName !== undefined && (
        <Text
          style={[
            { lineHeight: 30, color: dynamicStyles?.textColor ?? Colors.black, fontFamily: fonts.Medium },
            styles['font_size_14_Regular'],
          ]}
        >
          {props.labelName}
          {props.IsRequired && <Text style={[styles['text_color_red']]}> *</Text>}
        </Text>
      )}

      {/* Input + Arrow Container */}
      <View
        style={[
          styles['flex_direction_row'],
          styles['width_100%'],
          styles['top_10'],
          styles['border_width_1'],
          styles['border_radius_6'],
          {
            borderColor: "#D6D6D6",
            height: 45,
            alignItems: 'center',   // 🔥 center vertically
            paddingRight: 10
          }
        ]}
      >

        {/* Input clickable area */}
        <TouchableOpacity
          style={[
            { flex: 1, flexDirection: 'row', alignItems: 'center' },
            props?.disabled && { backgroundColor: 'rgba(0,0,0,0.05)' }
          ]}
          onPress={props.onFocus}
          activeOpacity={0.8}
        >
          <TextInput
            style={[
              {
                flex: 1,
                paddingLeft: 10,
                fontFamily: fonts.Regular,

                // 🔥 FIX START
                paddingVertical: 0,
                textAlignVertical: 'center',   // Android fix
                includeFontPadding: false,     // removes extra top space
                height: 45,                    // match container height
                // 🔥 FIX END

                color: dynamicStyles?.textColor ?? Colors.black,
              },
            ]}
            value={props.value}
            placeholder={props.placeholder}
            placeholderTextColor={props.placeholderTextColor ?? "#B4B4B4"}
            defaultValue={props.defaultValue}
            editable={props.editable}
            showSoftInputOnFocus={false}
            autoCorrect={false}
            numberOfLines={1}
            multiline={false}
            onFocus={() => {
              Keyboard.dismiss();
              props.onFocus && props.onFocus();
            }}
            onEndEditing={(e) => {
              props.onEndEditing && props.onEndEditing(e);
            }}
          />
        </TouchableOpacity>

        {/* 🔥 Arrow (Perfectly aligned) */}
        <Image
          style={{
            width: 14,
            height: 8,
            tintColor: props.disabled ? '#ccc' : '#000'
          }}
          source={require('../assets/images/grayDownArrow.png')}
        />

      </View>
    </View>
  );
};

export default CustomInputDropDown;