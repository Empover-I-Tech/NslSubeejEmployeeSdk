import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useFontStyles } from '../hooks/useFontStyles';

const CustomCircularProgress = ({ percentage = 75, radius = 30, strokeWidth = 6, percentageText = 95, level = 'High', strokeColor = '', hideStatus = false }) => {
    const size = (radius + strokeWidth) * 2;
    const center = radius + strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;
    const fonts=useFontStyles()

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={{ position: "absolute" }}>
                <Svg width={size} height={size}>
                    <Circle
                        stroke="#ccc"
                        fill="none"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        // stroke={strokeColor}
                        stroke={strokeColor || (level == 'High' ? 'rgba(237, 50, 55, 1)' : level == 'Low' ? 'rgba(0, 135, 63, 1)' : 'rgba(255, 164, 18, 1)')}
                        fill="none"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${center}, ${center}`}
                    />
                </Svg>
            </View>
            <View style={styles.textWrapper}>
                {/* <Text style={styles.text}>{`${percentageText}%`}</Text> */}
                {!hideStatus && <Text style={[styles.subText,{fontFamily:fonts.SemiBold}]}>{level}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    textWrapper: {
        // position: 'absolute',
        // top: '50%',
        // left: '50%',
        // transform: [{ translateX: -18 }, { translateY: -18 }],
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(0, 0, 0, 1)',
    },
    subText: {
        fontSize:10,
        color: '#666',
    },

});

export default CustomCircularProgress;