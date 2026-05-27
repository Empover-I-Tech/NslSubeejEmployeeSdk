import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, StyleSheet, Text, Keyboard } from "react-native";

const CustomOtpPinView = ({ pinLength = 6, onOtpComplete, defaultValue = "" }) => {
    const [otp, setOtp] = useState(Array(pinLength).fill(""));
    const inputs = useRef([]);

    useEffect(() => {
        if (defaultValue && defaultValue.length === pinLength) {
            const otpArray = defaultValue.split("");
            setOtp(otpArray);

            // Automatically trigger the OTP complete callback if defaultValue is fully populated
            onOtpComplete(defaultValue);
        } else if (!defaultValue) {
            // Clear OTP if defaultValue is cleared
            setOtp(Array(pinLength).fill(""));
        }
    }, [defaultValue]);

    const handleChangeText = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Move focus to next input field
        if (text.length > 0 && index < pinLength - 1) {
            inputs.current[index + 1].focus();
        }

        // Trigger OTP completion callback and dismiss the keyboard
        if (newOtp.join("").length === pinLength) {
            Keyboard.dismiss();
            onOtpComplete(newOtp.join(""));
        }
    };

    const handleKeyPress = (event, index) => {
        if (event.nativeEvent.key === "Backspace") {
            const newOtp = [...otp];
            if (otp[index] === "" && index > 0) {
                inputs.current[index - 1].focus();
                newOtp[index - 1] = ""; // Clear the previous input
            } else {
                newOtp[index] = ""; // Clear the current input
            }
            setOtp(newOtp);
        }
    };

    return (
        <View style={styles.container}>
            {otp.map((value, index) => (
                <TextInput
                    key={index}
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={1}
                    value={value}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    ref={(ref) => (inputs.current[index] = ref)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 20,
    },
    input: {
        width: 40,
        height: 50,
        borderWidth: 1,
        margin: 2,
        borderRadius: 5,
        borderColor: "#ccc",
        textAlign: "center",
        fontSize: 18,
        color: "#333",
    },
});

export default CustomOtpPinView;
