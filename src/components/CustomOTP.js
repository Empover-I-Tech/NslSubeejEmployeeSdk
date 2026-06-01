import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, TextInput } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { useNavigation } from '@react-navigation/native';
import { useFontStyles } from '../hooks/useFontStyles';

var styles = BuildStyleOverwrite(Styles);
function CustomOTP(props) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const fonts=useFontStyles()
    const inputRefs = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0)
    useEffect(() => {
        setOtp(['', '', '', '', '', ''])
        setActiveIndex(0)
        if(props.otpKeyBoardVisibe){
            console.log("otpKeybord=-=->",props.otpKeyBoardVisibe)
            if (props.otpKeyBoardVisibe) {
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            }




        }




    }, [props.resetOTP])

    useEffect(() => {
        if (props?.otpValues) {
            setOtp(props?.otpValues);
        }
    }, [props?.otpValues]);

    // useEffect(() => {
    //     console.log(props?.otpValues,"sdfsdfsdfmsdfkldsfklsfdlksdkllkds")
    //     if (props?.otpValues?.length > 1) {
    //         inputRefs.current[0]?.focus();
    //         setOtp(props?.otpValues);
    //         props?.otpValues?.forEach((value, index) => {
    //             if (value && inputRefs.current[index + 1]) {
    //                 inputRefs.current[index + 1].focus();
    //             }
    //         });
    //     }
    // }, [props?.otpValues]);



    // const handleChange = (index, value) => {
    //     if (/^[0-9]*$/.test(value) && value.length <= 1) {
    //         const newOtp = [...otp];
    //         newOtp[index] = value;
    //         setOtp(newOtp);

    //         if (value && inputRefs.current[index + 1]) {
    //             inputRefs.current[index + 1].focus();
    //         }
    //     }
    // };

    const handleChange = (index, value) => {
        if (index !== activeIndex) return; // only allow typing at current active index

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }
    };

    // const handleKeyPress = (index, key) => {
    //     if (key === 'Backspace' && inputRefs.current[index - 1]) {
    //         inputRefs.current[index - 1].focus();
    //     }
    // };

    // const handleKeyPress = (index, key) => {
    //     if (key === 'Backspace') {
    //         const newOtp = [...otp];

    //         if (otp[index] === '') {
    //             // alert("if")
    //             if (inputRefs.current[index - 1]) {
    //                 inputRefs.current[index - 1].focus();
    //                 newOtp[index - 1] = '';
    //                 setOtp(newOtp);
    //                 props?.onEndEditting(newOtp[index])
    //             }
    //         } else {
    //             // alert("else")
    //             newOtp[index] = '';
    //             setOtp(newOtp);
    //             props?.onEndEditting(newOtp[index])
    //         }
    //     }
    // };

    const handleKeyPress = (index, key) => {
        if (index !== activeIndex) return; // only allow keypress at current active index

        if (key === 'Backspace') {
            const newOtp = [...otp];

            if (otp[index] === '' && index > 0) {
                newOtp[index - 1] = '';
                setOtp(newOtp);
                setActiveIndex(index - 1);
                inputRefs.current[index - 1]?.focus();
            } else {
                newOtp[index] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
            props?.onEndEditting(newOtp[index])
        }
    };

    const handleFocus = (index) => {
        // prevent focusing if not at active index
        if (index !== activeIndex) {
            inputRefs.current[activeIndex]?.focus();
        }
    };


    useEffect(() => {
        const isValid = otp.every(element => element && element >= 0 && element <= 9);
        if (isValid) {
            props?.onEndEditting(otp.join(''))
        }
    }, [otp])
    return (

        <View style={{flexDirection:"row",width:"auto",alignItems:"center",marginVertical: Platform.OS == "ios" ? 15 : 10}}>
            {otp.map((value, index) => (
                <TextInput
                    key={index}
                    style={{fontFamily:fonts.Regular ,borderWidth: 1, borderColor: Colors.lightish_grey, borderRadius: 10, color: 'black', paddingHorizontal: 10, marginHorizontal: 5, width: Platform.OS === 'android' ? 40 : 43, height: Platform.OS === 'android' ? 40 : 43, textAlign: 'center' }}
                    value={value}
                    onChangeText={(text) => handleChange(index, text)}
                    onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus={false}
                    caretHidden={true} // ✅ hides the blinking cursor
                    onFocus={() => handleFocus(index)}
                    editable={true}                // ✅ allow typing
                    // pointerEvents="none"
                    // onTouchStart={(e) => e.preventDefault()}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    autoCorrect={false}
                    autoComplete="off" // Disable general autocomplete
                    autoCompleteType="none" // Android: Disable autocomplete (older RN versions)
                    importantForAutofill="no" // Android: Disable autofill
                    textContentType={Platform.OS === 'ios' ? 'none' : undefined} // iOS: Disable OTP autofill
                    contextMenuHidden={true} // Hide copy/paste menu
                    showSoftInputOnFocus={true} // Ensure keyboard shows
                    inputMode="numeric" // Reinforce numeric input
                    spellCheck={false} // Disable spell checking
                    onLongPress={() => { }} // Prevent long-press actions
                    // Add a placeholder to reduce keyboard suggestion heuristics
                    placeholder="" // Empty placeholder to avoid suggestions
                    placeholderTextColor="transparent" // Hide placeholder visually
                />
            ))}
        </View>
    )


}

export default CustomOTP;