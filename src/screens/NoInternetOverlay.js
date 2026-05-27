import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    Image,
} from 'react-native';

const NoInternetOverlay= ({ visible }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const [shouldRender, setShouldRender] = React.useState(visible);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setShouldRender(false);
            });
        }
    }, [visible]);

    if (!shouldRender) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: "#fff",
                    opacity,
                },
            ]}
        >
            <Image source={require("../../assets/Images/noInternet.png")} style={{height:100,width:100,resizeMode:"contain"}}/>
            <Text></Text>

            {/* <TextLabel
                variant="heading"
                weight="700"
                style={{ letterSpacing: scaleSize(2), marginTop: 20 }}
                color={colors.text.primary}
            >
                NO INTERNET CONNECTION
            </TextLabel>

            <TextLabel
                variant="subheading"
                align="center"
                style={{ marginTop: 10 }}
                color={colors.text.secondary}
            >
                You appear to be offline. Please check your connection
                or network settings and try again.
            </TextLabel> */}
        </Animated.View>
    );
};


export default NoInternetOverlay;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        zIndex: 999,
    },
});
